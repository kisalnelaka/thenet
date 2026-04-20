import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, FolderOpen, Clock, Star, Search, Bell, Settings,
  MoreVertical, Grid, List as ListIcon, Download, Upload, 
  Smartphone, Laptop, Wifi, Plus, File as FileIcon, Image as ImageIcon,
  Film, Music, FileText, X, ChevronLeft, Cpu, Trash2, Clipboard,
  Zap, Save, Play, Package, Shield, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_HOST = import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin;

const App = () => {
  const [activeDevice, setActiveDevice] = useState({ name: 'Fetching...', url: DEFAULT_HOST, type: 'desktop' });
  const [devices, setDevices] = useState([{ name: 'Main Console', url: DEFAULT_HOST, type: 'desktop', ip: 'Local' }]);
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [history, setHistory] = useState([]);
  const [viewTab, setViewTab] = useState('dashboard');
  const [starredFiles, setStarredFiles] = useState([]);
  const [storage, setStorage] = useState({ percentage: 0, used: 0, total: 0 });
  const [vitals, setVitals] = useState({ battery: {}, cpu: {}, ram: {} });
  const [clipboard, setClipboard] = useState("");
  const [editor, setEditor] = useState({ open: false, content: "", path: "" });

  useEffect(() => {
    const init = async () => {
      try {
        const res = await axios.get(`${DEFAULT_HOST}/api/identity`);
        const main = { ...res.data, url: DEFAULT_HOST };
        setActiveDevice(main);
        const saved = localStorage.getItem('thenet_devices');
        let allDevices = [main];
        if (saved) {
          const others = JSON.parse(saved).filter(d => d.url !== DEFAULT_HOST);
          allDevices = [...allDevices, ...others];
        }
        setDevices(allDevices);
        const savedStars = localStorage.getItem('thenet_starred');
        if (savedStars) setStarredFiles(JSON.parse(savedStars));
      } catch (e) { console.error("Init failed"); }
    };
    init();
    const interval = setInterval(fetchVitals, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchFiles();
    fetchStorage();
    fetchClipboard();
  }, [activeDevice, viewTab]);

  const fetchFiles = async (path = '') => {
    setLoading(true);
    try {
      let endpoint = `${activeDevice.url}/api/files`;
      if (viewTab === 'recent') endpoint = `${activeDevice.url}/api/recent`;
      const response = await axios.get(endpoint, { params: { path } });
      setFiles(response.data.files || []);
      if (response.data.currentPath) setCurrentPath(response.data.currentPath);
      setSelectedFiles([]);
    } catch (error) { console.error('Fetch failed:', error); }
    setLoading(false);
  };

  const fetchStorage = async () => {
    try {
      const res = await axios.get(`${activeDevice.url}/api/storage`);
      setStorage(res.data);
    } catch (e) {}
  };

  const fetchVitals = async () => {
    try {
      const res = await axios.get(`${activeDevice.url}/api/vitals`);
      setVitals(res.data);
    } catch (e) {}
  };

  const fetchClipboard = async () => {
    try {
      const res = await axios.get(`${activeDevice.url}/api/clipboard`);
      setClipboard(res.data.text);
    } catch (e) {}
  };

  const syncClipboard = async (text) => {
    try {
      await axios.post(`${activeDevice.url}/api/clipboard`, { text });
      setClipboard(text);
    } catch (e) {}
  };

  const openEditor = async (file) => {
    try {
      const res = await axios.get(`${activeDevice.url}/api/text`, { params: { path: file.path } });
      setEditor({ open: true, content: res.data, path: file.path });
    } catch (e) { alert("Cannot edit this file type"); }
  };

  const saveEditor = async () => {
    try {
      await axios.post(`${activeDevice.url}/api/text`, { path: editor.path, content: editor.content });
      setEditor({ ...editor, open: false });
      fetchFiles(currentPath);
    } catch (e) { alert("Save failed"); }
  };

  const batchDownload = async () => {
    if (!selectedFiles.length) return;
    try {
      const response = await axios.post(`${activeDevice.url}/api/zip`, { paths: selectedFiles }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'thenet_archive.zip');
      document.body.appendChild(link);
      link.click();
    } catch (e) { alert("Batch download failed"); }
  };

  const handleNavigate = (path) => {
    setHistory(prev => [...prev, currentPath]);
    fetchFiles(path);
  };

  const isImage = (name) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
  const isVideo = (name) => /\.(mp4|mov|avi|mkv|webm)$/i.test(name);
  const isAudio = (name) => /\.(mp3|wav|ogg)$/i.test(name);
  const isText = (name) => /\.(txt|md|json|js|css|html|py|sh)$/i.test(name);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-container"><Wifi size={24} className="text-white" /><span>THE NET</span></div>
        <nav className="nav-group">
          <div onClick={() => setViewTab('dashboard')} className={`nav-item ${viewTab === 'dashboard' ? 'active' : ''}`}><LayoutDashboard size={20} /> <span>Console</span></div>
          <div onClick={() => { setViewTab('drive'); fetchFiles(''); }} className={`nav-item ${viewTab === 'drive' ? 'active' : ''}`}><FolderOpen size={20} /> <span>Explorer</span></div>
          <div onClick={() => setViewTab('recent')} className={`nav-item ${viewTab === 'recent' ? 'active' : ''}`}><Clock size={20} /> <span>Chronos</span></div>
          <div onClick={() => setViewTab('starred')} className={`nav-item ${viewTab === 'starred' ? 'active' : ''}`}><Star size={20} /> <span>Vault</span></div>
        </nav>

        <div className="vitals-panel mt-8">
           <p className="text-[10px] font-bold text-secondary uppercase tracking-[2px] mb-4 px-2">Node Vitals</p>
           <div className="flex flex-col gap-3">
             <div className="vital-row"><Zap size={14} className="text-yellow-400" /> <span>{vitals.battery?.level}% Battery</span></div>
             <div className="vital-row"><Cpu size={14} className="text-cyan-400" /> <span>{vitals.cpu?.load}% Load</span></div>
             <div className="vital-row"><Package size={14} className="text-purple-400" /> <span>{vitals.ram?.used}/{vitals.ram?.total}GB RAM</span></div>
           </div>
        </div>

        <div className="mt-8 flex-1 overflow-auto">
          <div className="flex justify-between items-center mb-6 px-2">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-[2px]">Mesh Nodes</span>
            <button onClick={() => alert("Scanning network...")} className="p-1.5 bg-cyan-400/10 text-cyan-400 rounded-lg hover:bg-cyan-400/20 transition-all"><Globe size={14} /></button>
          </div>
          <div className="flex flex-col gap-3">
            {devices.map(d => (
              <div key={d.url} onClick={() => setActiveDevice(d)} className={`nav-item device-node ${activeDevice.url === d.url ? 'active' : ''}`}>
                <div className={`p-2 rounded-xl ${activeDevice.url === d.url ? 'bg-cyan-400 text-black' : 'bg-white/5 text-secondary'}`}>{d.type === 'mobile' ? <Smartphone size={18} /> : <Laptop size={18} />}</div>
                <div className="flex-1 truncate"><p className="text-sm font-semibold truncate">{d.name}</p><p className="text-[9px] text-secondary opacity-60 font-mono">{d.ip}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="storage-widget mt-auto">
          <div className="flex justify-between items-center text-[10px] mb-2 uppercase font-bold tracking-wider">
            <span className="text-secondary">Storage</span><span className="text-cyan-400">{storage.percentage}%</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${storage.percentage}%` }}></div></div>
        </div>

        <div className="clipboard-widget mt-4">
           <p className="text-[10px] font-bold text-secondary uppercase tracking-[2px] mb-2 px-2">Bridge Clipboard</p>
           <textarea 
             className="glass-input text-[10px] h-16 w-full resize-none p-2" 
             value={clipboard} 
             onChange={(e) => syncClipboard(e.target.value)}
             placeholder="Type to sync across nodes..."
           />
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="main-wrapper">
        <header className="header">
          <div className="search-container">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
            <input type="text" className="search-input" placeholder={`Accessing ${activeDevice.name} data stream...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-bold bg-white/5 border border-white/10 px-3 py-1 rounded-md text-secondary"><Shield size={12} className="text-green-400" /><span>SECURE NODE</span></div>
            <div className="user-profile"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kisal" className="avatar" alt="Avatar" /><div className="text-xs"><p className="font-bold">KISAL N.</p><p className="text-cyan-400">● SYSTEM ADMIN</p></div></div>
          </div>
        </header>

        <main className="content-area">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
              {history.length > 0 && <button onClick={() => { const p = history.pop(); setHistory([...history]); fetchFiles(p); }} className="glass-card !p-2 rounded-lg hover:text-cyan-400 transition-colors"><ChevronLeft size={20} /></button>}
              <div><h1 className="section-title">{viewTab.toUpperCase()}</h1><p className="text-xs text-secondary -mt-4 font-mono">{currentPath || '/'}</p></div>
            </div>
            <div className="flex gap-3">
              {selectedFiles.length > 0 && <button onClick={batchDownload} className="glass-card !p-3 rounded-xl bg-cyan-400/20 text-cyan-400 border-cyan-400/30 flex gap-2"><Package size={20} /><span>ZIP {selectedFiles.length}</span></button>}
              <label className="glass-card !p-3 rounded-xl hover:text-cyan-400 cursor-pointer"><Upload size={20} /><input type="file" className="hidden" onChange={async (e) => {
                const fd = new FormData(); fd.append('file', e.target.files[0]);
                await axios.post(`${activeDevice.url}/api/upload?path=${encodeURIComponent(currentPath)}`, fd); fetchFiles(currentPath);
              }} /></label>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead><tr><th style={{ width: '40px' }}><input type="checkbox" onChange={(e) => setSelectedFiles(e.target.checked ? files.map(f => f.path) : [])} /></th><th>Object Name</th><th>Access Date</th><th>Size</th><th>Actions</th></tr></thead>
              <tbody>
                {files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map((file, idx) => (
                  <tr key={file.path} className={selectedFile?.path === file.path ? 'selected' : ''} onClick={() => setSelectedFile(file)} onDoubleClick={() => file.isDirectory ? handleNavigate(file.path) : isText(file.name) ? openEditor(file) : null}>
                    <td><input type="checkbox" checked={selectedFiles.includes(file.path)} onChange={(e) => setSelectedFiles(prev => e.target.checked ? [...prev, file.path] : prev.filter(p => p !== file.path))} onClick={(e) => e.stopPropagation()} /></td>
                    <td><div className="flex items-center gap-3">{file.isDirectory ? <FolderOpen className="text-cyan-400" size={18} /> : isImage(file.name) ? <ImageIcon className="text-purple-400" size={18} /> : <FileIcon className="text-slate-500" size={18} />}<span className="font-medium">{file.name}</span></div></td>
                    <td className="text-[11px] text-secondary font-mono">{new Date(file.modified).toLocaleString()}</td>
                    <td className="text-[11px] text-secondary font-mono">{file.isDirectory ? '--' : (file.size / 1024 / 1024).toFixed(2) + ' MB'}</td>
                    <td>
                      <div className="flex gap-2">
                        {isText(file.name) && <button onClick={(e) => { e.stopPropagation(); openEditor(file); }} className="text-secondary hover:text-cyan-400"><FileText size={16} /></button>}
                        <button onClick={(e) => { e.stopPropagation(); window.open(`${activeDevice.url}/api/download?path=${encodeURIComponent(file.path)}`); }} className="text-secondary hover:text-cyan-400"><Download size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Details Sidebar */}
      <aside className="details-sidebar">
        <div className="flex justify-between items-center"><h2 className="text-sm font-bold uppercase tracking-widest">Core Data</h2><X size={18} className="text-secondary cursor-pointer" onClick={() => setSelectedFile(null)} /></div>
        {selectedFile ? (
          <>
            <div className="preview-box overflow-hidden relative bg-black">
              {isImage(selectedFile.name) ? (
                <img src={`${activeDevice.url}/api/preview?path=${encodeURIComponent(selectedFile.path)}`} className="w-full h-full object-contain" alt="Preview" />
              ) : isVideo(selectedFile.name) ? (
                <video key={selectedFile.path} controls className="w-full h-full"><source src={`${activeDevice.url}/api/preview?path=${encodeURIComponent(selectedFile.path)}`} /></video>
              ) : isAudio(selectedFile.name) ? (
                <div className="flex flex-col items-center"><Music size={48} className="text-cyan-400 mb-4" /><audio controls className="w-full"><source src={`${activeDevice.url}/api/preview?path=${encodeURIComponent(selectedFile.path)}`} /></audio></div>
              ) : (
                <div className="flex flex-col items-center"><FileIcon size={64} className="text-slate-500" /><p className="mt-4 text-xs font-mono">{selectedFile.name}</p></div>
              )}
            </div>
            <div className="flex flex-col gap-4 mt-6">
               <div className="detail-stat"><span>SIZE</span><span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span></div>
               <div className="detail-stat"><span>TYPE</span><span>{selectedFile.isDirectory ? 'DIR' : selectedFile.name.split('.').pop().toUpperCase()}</span></div>
               <div className="flex gap-2 mt-4">
                  <button onClick={() => window.open(`${activeDevice.url}/api/download?path=${encodeURIComponent(selectedFile.path)}`)} className="flex-1 py-3 bg-cyan-400 text-black font-bold rounded-xl text-xs">EXTRACT</button>
                  <button onClick={() => isText(selectedFile.name) && openEditor(selectedFile)} className="p-3 bg-white/5 rounded-xl border border-white/10"><Settings size={18} /></button>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-10"><Globe size={64} /><p className="mt-4 text-[10px] font-bold">READY FOR DATA INGESTION</p></div>
        )}
      </aside>

      {/* Text Editor Modal */}
      <AnimatePresence>
        {editor.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-10">
            <div className="bg-sidebar-bg border border-white/10 rounded-2xl w-full max-w-4xl h-full flex flex-col overflow-hidden">
              <div className="p-6 border-bottom border-white/10 flex justify-between items-center">
                <h3 className="font-bold flex gap-3 items-center"><FileText size={20} className="text-cyan-400" /> {editor.path.split('/').pop()}</h3>
                <div className="flex gap-4">
                   <button onClick={saveEditor} className="flex gap-2 items-center bg-cyan-400 text-black px-4 py-2 rounded-lg font-bold text-sm"><Save size={16} /> Save Changes</button>
                   <button onClick={() => setEditor({ ...editor, open: false })} className="p-2 text-secondary hover:text-white"><X size={24} /></button>
                </div>
              </div>
              <textarea 
                className="flex-1 bg-transparent p-10 font-mono text-sm outline-none resize-none text-slate-300"
                value={editor.content}
                onChange={(e) => setEditor({ ...editor, content: e.target.value })}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .inset-0 { position: fixed; top: 0; left: 0; right: 0; bottom: 0; }
        .vital-row { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 500; color: var(--text-secondary); }
        .detail-stat { display: flex; justify-content: space-between; font-size: 10px; font-family: monospace; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; }
        .bg-sidebar-bg { background: #0b0e14; }
        .border-bottom { border-bottom: 1px solid rgba(255,255,255,0.08); }
      ` }} />
    </div>
  );
};

export default App;
