import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Folder, 
  File, 
  Download, 
  Upload, 
  ChevronRight, 
  Home, 
  Search, 
  Grid, 
  List,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.DEV ? 'http://localhost:3000/api' : '/api';

const App = () => {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async (path = '') => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/files`, { params: { path } });
      setFiles(response.data.files);
      setCurrentPath(response.data.currentPath);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
    setLoading(false);
  };

  const handleFolderClick = (folderPath) => {
    setHistory([...history, currentPath]);
    fetchFiles(folderPath);
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prevPath = history[history.length - 1];
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      fetchFiles(prevPath);
    }
  };

  const handleDownload = (filePath, fileName) => {
    window.open(`${API_URL}/download?path=${encodeURIComponent(filePath)}`, '_blank');
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`${API_URL}/upload?path=${encodeURIComponent(currentPath)}`, formData);
      fetchFiles(currentPath);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const getFileIcon = (file) => {
    if (file.isDirectory) return <Folder className="text-cyan-400" size={40} />;
    
    const ext = file.name.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) return <ImageIcon className="text-purple-400" size={40} />;
    if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) return <Film className="text-red-400" size={40} />;
    if (['mp3', 'wav', 'ogg'].includes(ext)) return <Music className="text-green-400" size={40} />;
    if (['pdf', 'txt', 'doc', 'docx'].includes(ext)) return <FileText className="text-blue-400" size={40} />;
    
    return <File className="text-gray-400" size={40} />;
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="app-container">
      <div className="bg-glow glow-1"></div>
      <div className="bg-glow glow-2"></div>

      {/* Sidebar/Header Navigation */}
      <header className="glass-panel p-6 m-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="logo text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            THE NET
          </div>
          <div className="flex items-center gap-2 text-sm text-secondary bg-white/5 px-3 py-1.5 rounded-full">
            <Home size={14} />
            <ChevronRight size={14} />
            <span className="truncate max-w-[200px]">{currentPath || 'Root'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search files..."
              className="glass-input pl-10 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <label className="glass-button cursor-pointer">
            <Upload size={18} />
            <span>Upload</span>
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto">
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="flex items-center gap-4">
            {history.length > 0 && (
              <button onClick={handleBack} className="glass-button !p-2">
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-xl font-medium">Files & Folders</h2>
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-secondary hover:text-white'}`}
            >
              <Grid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-secondary hover:text-white'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <motion.div 
            layout
            className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4' : 'flex flex-col gap-2'}
          >
            <AnimatePresence>
              {filteredFiles.map((file) => (
                <motion.div
                  key={file.path}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.06)' }}
                  onClick={() => file.isDirectory && handleFolderClick(file.path)}
                  className={`glass-panel p-4 cursor-pointer group relative ${viewMode === 'list' ? 'flex items-center gap-4' : 'text-center'}`}
                >
                  <div className={viewMode === 'grid' ? 'flex justify-center mb-3' : ''}>
                    {getFileIcon(file)}
                  </div>
                  <div className={`flex-1 min-w-0 ${viewMode === 'grid' ? '' : 'text-left'}`}>
                    <p className="font-medium truncate text-sm mb-1">{file.name}</p>
                    <p className="text-xs text-secondary">
                      {file.isDirectory ? 'Folder' : formatSize(file.size)}
                    </p>
                  </div>
                  
                  {!file.isDirectory && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file.path, file.name);
                      }}
                      className={`glass-button !p-2 opacity-0 group-hover:opacity-100 transition-opacity ${viewMode === 'grid' ? 'absolute top-2 right-2' : ''}`}
                    >
                      <Download size={14} />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .app-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }
        /* Tailwind-like utilities for quick assembly */
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .gap-4 { gap: 1rem; }
        .gap-3 { gap: 0.75rem; }
        .gap-2 { gap: 0.5rem; }
        .p-4 { padding: 1rem; }
        .p-6 { padding: 1.5rem; }
        .m-4 { margin: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-1 { margin-bottom: 0.25rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
        .py-1.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        @media (min-width: 768px) { .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
        @media (min-width: 1024px) { .lg\\:grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); } }
        @media (min-width: 1280px) { .xl\\:grid-cols-8 { grid-template-columns: repeat(8, minmax(0, 1fr)); } }
        .flex-1 { flex: 1 1 0%; }
        .font-bold { font-weight: 700; }
        .font-medium { font-weight: 500; }
        .text-2xl { font-size: 1.5rem; line-height: 2rem; }
        .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .text-xs { font-size: 0.75rem; line-height: 1rem; }
        .text-secondary { color: var(--text-secondary); }
        .text-cyan-400 { color: #22d3ee; }
        .text-purple-400 { color: #c084fc; }
        .text-red-400 { color: #f87171; }
        .text-green-400 { color: #4ade80; }
        .text-blue-400 { color: #60a5fa; }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .rounded-full { border-radius: 9999px; }
        .rounded-xl { border-radius: 0.75rem; }
        .rounded-lg { border-radius: 0.5rem; }
        .bg-white\\/5 { background-color: rgba(255, 255, 255, 0.05); }
        .hidden { display: none; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .left-3 { left: 0.75rem; }
        .top-1/2 { top: 50%; }
        .-translate-y-1/2 { transform: translateY(-50%); }
        .top-2 { top: 0.5rem; }
        .right-2 { right: 0.5rem; }
        .w-64 { width: 16rem; }
        .pl-10 { padding-left: 2.5rem; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      ` }} />
    </div>
  );
};

export default App;
