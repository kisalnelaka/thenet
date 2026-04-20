import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  Clock, 
  Star, 
  Trash2, 
  Cloud, 
  Layers,
  Search,
  Bell,
  Settings,
  MoreVertical,
  Grid,
  List as ListIcon,
  Download,
  Upload,
  ChevronRight,
  HardDrive,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  File as FileIcon,
  Plus,
  Smartphone,
  Laptop,
  Wifi
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Default to current host if in production
const DEFAULT_HOST = import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin;

const App = () => {
  const [activeDevice, setActiveDevice] = useState({ name: 'This Device', url: DEFAULT_HOST, type: 'desktop' });
  const [devices, setDevices] = useState([
    { name: 'This Device', url: DEFAULT_HOST, type: 'desktop', active: true }
  ]);
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedFile, setSelectedFile] = useState(null);
  const [history, setHistory] = useState([]);

  // Load saved devices
  useEffect(() => {
    const saved = localStorage.getItem('thenet_devices');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure "This Device" is always there and correctly pointed
      const base = parsed.filter(d => d.url !== DEFAULT_HOST);
      setDevices([{ name: 'This Device', url: DEFAULT_HOST, type: 'desktop', active: true }, ...base]);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [activeDevice]);

  const fetchFiles = async (path = '') => {
    setLoading(true);
    try {
      const response = await axios.get(`${activeDevice.url}/api/files`, { params: { path } });
      setFiles(response.data.files);
      setCurrentPath(response.data.currentPath);
      if (response.data.files.length > 0) setSelectedFile(response.data.files[0]);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
    setLoading(false);
  };

  const addDevice = async () => {
    const ip = prompt("Enter Device IP (e.g. 192.168.1.5):");
    if (!ip) return;
    
    const url = `http://${ip}:3000`;
    try {
      const res = await axios.get(`${url}/api/identity`);
      const newDevice = { ...res.data, url, active: false };
      const updated = [...devices, newDevice];
      setDevices(updated);
      localStorage.setItem('thenet_devices', JSON.stringify(updated));
    } catch (e) {
      alert("Could not connect to device. Make sure TheNet is running on it!");
    }
  };

  const switchDevice = (device) => {
    setActiveDevice(device);
    setDevices(devices.map(d => ({ ...d, active: d.url === device.url })));
    setHistory([]); // Clear history when switching devices
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file, size = 20) => {
    if (file.isDirectory) return <FolderOpen className="text-cyan-400" size={size} />;
    const ext = file.name.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return <ImageIcon className="text-purple-400" size={size} />;
    if (['mp4', 'mov', 'avi'].includes(ext)) return <Film className="text-red-400" size={size} />;
    if (['mp3', 'wav'].includes(ext)) return <Music className="text-green-400" size={size} />;
    if (['pdf', 'txt', 'doc'].includes(ext)) return <FileText className="text-blue-400" size={size} />;
    return <FileIcon className="text-slate-400" size={size} />;
  };

  const sortedFiles = [...files]
    .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon"><Layers size={18} color="white" /></div>
          <span>THE NET</span>
        </div>

        <nav className="nav-group">
          <div className="nav-item active"><LayoutDashboard size={20} /> Dashboard</div>
          <div className="nav-item"><FolderOpen size={20} /> My Drive</div>
          <div className="nav-item"><Clock size={20} /> Recent</div>
          <div className="nav-item"><Star size={20} /> Starred</div>
        </nav>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4 px-2">
            <p className="text-xs font-bold text-secondary uppercase tracking-wider">Devices</p>
            <button onClick={addDevice} className="text-cyan-400 hover:bg-cyan-400/10 p-1 rounded-md transition-colors">
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {devices.map((device) => (
              <div 
                key={device.url}
                onClick={() => switchDevice(device)}
                className={`nav-item !py-2.5 ${device.active ? 'active' : ''}`}
              >
                {device.type === 'mobile' ? <Smartphone size={18} /> : <Laptop size={18} />}
                <span className="text-sm truncate flex-1">{device.name}</span>
                {device.active && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2ff]"></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="storage-widget mt-auto">
          <div className="flex justify-between items-center text-sm">
            <span>Storage</span>
            <span className="text-cyan-400">68% Used</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '68%' }}></div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-col overflow-hidden">
        <header className="header">
          <div className="search-bar">
            <Search size={18} className="text-secondary" />
            <input 
              type="text" 
              placeholder={`Search in ${activeDevice.name}...`} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs bg-cyan-400/10 text-cyan-400 px-3 py-1.5 rounded-full border border-cyan-400/20">
              <Wifi size={12} />
              <span>Connected to {activeDevice.name}</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 p-1 pr-3 rounded-full border border-white/10">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aleksei" alt="User" className="w-8 h-8 rounded-full" />
              <div className="text-xs">
                <p className="font-medium">Kisal N.</p>
                <p className="text-green-400 text-[10px]">● online</p>
              </div>
            </div>
          </div>
        </header>

        <div className="content-scroll">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold">{activeDevice.name}</h1>
              <p className="text-xs text-secondary mt-1">{currentPath || 'Root Directory'}</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg"><Download size={20} /></button>
              <label className="p-2 bg-white/5 text-secondary rounded-lg cursor-pointer hover:text-white transition-colors">
                <Upload size={20} />
                <input type="file" className="hidden" />
              </label>
            </div>
          </div>

          <section className="mb-8">
            <div className="quick-access">
              {files.filter(f => f.isDirectory).slice(0, 4).map((folder, i) => (
                <div key={folder.path} className="card" onDoubleClick={() => handleFolderClick(folder.path)}>
                  <div className={`card-icon bg-gradient-to-br from-cyan-500/20 to-blue-500/20`}>
                    <FolderOpen className="text-cyan-400" />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="font-medium truncate">{folder.name}</p>
                    <p className="text-xs text-secondary">Directory</p>
                  </div>
                  <MoreVertical size={16} className="text-secondary" />
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Files</h2>
              <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-secondary'}`}><ListIcon size={16} /></button>
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-secondary'}`}><Grid size={16} /></button>
              </div>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <table className="file-table">
                <thead>
                  <tr>
                    <th className="w-10"><input type="checkbox" className="accent-cyan-400" /></th>
                    <th className="cursor-pointer" onClick={() => setSortBy('name')}>Name</th>
                    <th className="cursor-pointer" onClick={() => setSortBy('modified')}>Modified</th>
                    <th className="cursor-pointer" onClick={() => setSortBy('size')}>Size</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {sortedFiles.map((file) => (
                      <motion.tr 
                        key={file.path}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`file-row group cursor-pointer ${selectedFile?.path === file.path ? 'bg-white/5' : ''}`}
                        onClick={() => setSelectedFile(file)}
                        onDoubleClick={() => file.isDirectory && handleFolderClick(file.path)}
                      >
                        <td><input type="checkbox" className="accent-cyan-400" checked={selectedFile?.path === file.path} readOnly /></td>
                        <td><div className="flex items-center gap-3">{getFileIcon(file)}<span>{file.name}</span></div></td>
                        <td className="text-sm text-secondary">{new Date(file.modified).toLocaleDateString()}</td>
                        <td className="text-sm text-secondary">{file.isDirectory ? '--' : formatSize(file.size)}</td>
                        <td><button onClick={() => !file.isDirectory && window.open(`${activeDevice.url}/api/download?path=${encodeURIComponent(file.path)}`)} className="p-2 opacity-0 group-hover:opacity-100 text-secondary hover:text-cyan-400"><Download size={16} /></button></td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </section>
        </div>
      </main>

      {/* Details Pane */}
      <aside className="details-pane">
        <h2 className="text-lg font-medium">Details</h2>
        {selectedFile ? (
          <>
            <div className="detail-card">
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/20 mb-4 flex flex-col items-center">
                {getFileIcon(selectedFile, 64)}
                <p className="mt-4 font-semibold text-center truncate w-full">{selectedFile.name}</p>
              </div>
            </div>
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex justify-between text-sm"><span className="text-secondary">Size</span><span>{formatSize(selectedFile.size)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-secondary">Type</span><span>{selectedFile.isDirectory ? 'Folder' : selectedFile.name.split('.').pop().toUpperCase()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-secondary">Location</span><span className="truncate ml-4 max-w-[150px]">{activeDevice.name}</span></div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-secondary opacity-20">
            <FileIcon size={48} className="mb-4" />
            <p>Select a file</p>
          </div>
        )}
      </aside>

      <style dangerouslySetInnerHTML={{ __html: `
        .mt-6 { margin-top: 1.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .uppercase { text-transform: uppercase; }
        .tracking-wider { letter-spacing: 0.05em; }
        .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
        .flex-1 { flex: 1 1 0%; }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ml-4 { margin-left: 1rem; }
        .max-w-\\[150px\\] { max-width: 150px; }
      ` }} />
    </div>
  );
};

export default App;
