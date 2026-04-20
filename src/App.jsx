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
  const [activeDevice, setActiveDevice] = useState({ name: 'Node...', url: DEFAULT_HOST, type: 'desktop' });
  const [devices, setDevices] = useState([{ name: 'Console', url: DEFAULT_HOST, type: 'desktop', ip: 'Local' }]);
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
      setClipboard(res.data.text || "");
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
        <div className="logo-container"><Wifi size={24} /><span>THE NET</span></div>
        <nav className="nav-group">
          <div onClick={() => setViewTab('dashboard')} className={`nav-item ${viewTab === 'dashboard' ? 'active' : ''}`}><LayoutDashboard size={18} /> <span>Console</span></div>
          <div onClick={() => { setViewTab('drive'); fetchFiles(''); }} className={`nav-item ${viewTab === 'drive' ? 'active' : ''}`}><FolderOpen size={18} /> <span>Explorer</span></div>
          <div onClick={() => setViewTab('recent')} className={`nav-item ${viewTab === 'recent' ? 'active' : ''}`}><Clock size={18} /> <span>Chronos</span></div>
          <div onClick={() => setViewTab('starred')} className={`nav-item ${viewTab === 'starred' ? 'active' : ''}`}><Star size={18} /> <span>Vault</span></div>
        </nav>

        <div className="vitals-panel">
           <p className="text-[10px] font-bold text-secondary uppercase tracking-[2px] mb-4">Node Vitals</p>
           <div className="vital-row"><Zap size={14} className="text-yellow-400" /> <span>{vitals.battery?.level}% Battery</span></div>
           <div className="vital-row"><Cpu size={14} className="text-cyan-400" /> <span>{vitals.cpu?.load}% Load</span></div>
           <div className="vital-row"><Package size={14} className="text-purple-400" /> <span>{vitals.ram?.used || 0}/{vitals.ram?.total || 0}GB RAM</span></div>
        </div>

        <div className="nodes-panel flex-1">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-[2px]">Mesh Nodes</span>
            <button className="p-1.5 bg-cyan-400/10 text-cyan-400 rounded-lg"><Globe size={14} /></button>
          </div>
          <div className="flex flex-col gap-2">
            {devices.map(d => (
              <div key={d.url} onClick={() => setActiveDevice(d)} className={`nav-item ${activeDevice.url === d.url ? 'active' : ''}`}>
                <div className={`p-2 rounded-lg ${activeDevice.url === d.url ? 'bg-cyan-400 text-black' : 'bg-white/5 text-secondary'}`}>{d.type === 'mobile' ? <Smartphone size={16} /> : <Laptop size={16} />}</div>
                <div className="flex-1 truncate"><p className="text-xs font-bold truncate">{d.name}</p><p className="text-[9px] opacity-50 font-mono">{d.ip}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="storage-widget mt-6">
          <div className="flex justify-between items-center text-[10px] mb-2 uppercase font-bold tracking-wider">
            <span className="text-secondary">Storage</span><span className="text-cyan-400">{storage.percentage}%</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${storage.percentage}%` }}></div></div>
        </div>

        <div className="clipboard-widget mt-6">
           <p className="text-[10px] font-bold text-secondary uppercase tracking-[2px] mb-2">Clipboard Bridge</p>
           <textarea className="glass-input text-[10px] h-20 w-full resize-none" value={clipboard} onChange={(e) => syncClipboard(e.target.value)} placeholder="Sync across nodes..." />
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="main-wrapper">
        <header className="header">
          <div className="search-container">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={16} />
            <input type="text" className="search-input" placeholder={`Accessing ${activeDevice.name} stream...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-md text-secondary"><Shield size={12} className="text-green-400" /><span>SECURE NODE</span></div>
            <div className="user-profile"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kisal" className="avatar" alt="Avatar" /><div className="text-xs"><p className="font-bold uppercase">KISAL N.</p><p className="text-cyan-400 text-[10px]">● SYSTEM ADMIN</p></div></div>
          </div>
        </header>

        <main className="content-area">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              {history.length > 0 && <button onClick={() => { const p = history.pop(); setHistory([...history]); fetchFiles(p); }} className="glass-card !p-2 rounded-lg hover:text-cyan-400"><ChevronLeft size={20} /></button>}
              <div><h1 className="section-title">{viewTab.toUpperCase()}</h1><p className="text-xs text-secondary -mt-1 font-mono">{currentPath || '/'}</p></div>
            </div>
            <div className="flex gap-3">
              {selectedFiles.length > 0 && <button onClick={batchDownload} className="glass-card !px-4 !py-2 bg-cyan-400 text-black border-none flex gap-2 items-center font-bold text-xs"><Package size={16} /> ZIP {selectedFiles.length}</button>}
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
                {files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map((file) => (
                  <tr key={file.path} className={selectedFile?.path === file.path ? 'selected' : ''} onClick={() => setSelectedFile(file)} onDoubleClick={() => file.isDirectory ? handleNavigate(file.path) : isText(file.name) ? openEditor(file) : null}>
                    <td><input type="checkbox" checked={selectedFiles.includes(file.path)} onChange={(e) => setSelectedFiles(prev => e.target.checked ? [...prev, file.path] : prev.filter(p => p !== file.path))} onClick={(e) => e.stopPropagation()} /></td>
                    <td><div className="flex items-center gap-3">{file.isDirectory ? <FolderOpen className="text-cyan-400" size={16} /> : isImage(file.name) ? <ImageIcon className="text-purple-400" size={16} /> : <FileIcon className="text-slate-500" size={16} />}<span className="font-medium truncate max-w-[300px] inline-block">{file.name}</span></div></td>
                    <td className="text-[11px] text-secondary font-mono">{new Date(file.modified).toLocaleDateString()}</td>
                    <td className="text-[11px] text-secondary font-mono">{file.isDirectory ? '--' : (file.size / 1024 / 1024).toFixed(2) + ' MB'}</td>
                    <td><div className="flex gap-2"><button onClick={(e) => { e.stopPropagation(); window.open(`${activeDevice.url}/api/download?path=${encodeURIComponent(file.path)}`); }} className="text-secondary hover:text-cyan-400"><Download size={14} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Details Sidebar */}
      <aside className="details-sidebar">
        <div className="flex justify-between items-center mb-6"><h2 className="text-xs font-bold uppercase tracking-widest">Metadata</h2><X size={18} className="text-secondary cursor-pointer" onClick={() => setSelectedFile(null)} /></div>
        {selectedFile ? (
          <>
            <div className="preview-box">
              {isImage(selectedFile.name) ? (
                <img src={`${activeDevice.url}/api/preview?path=${encodeURIComponent(selectedFile.path)}`} alt="Preview" />
              ) : isVideo(selectedFile.name) ? (
                <video key={selectedFile.path} controls><source src={`${activeDevice.url}/api/preview?path=${encodeURIComponent(selectedFile.path)}`} /></video>
              ) : isAudio(selectedFile.name) ? (
                <div className="flex flex-col items-center"><Music size={40} className="text-cyan-400 mb-4" /><audio controls className="w-full h-8"><source src={`${activeDevice.url}/api/preview?path=${encodeURIComponent(selectedFile.path)}`} /></audio></div>
              ) : (
                <div className="flex flex-col items-center opacity-50"><FileIcon size={48} /><p className="mt-4 text-[10px] font-mono">{selectedFile.name}</p></div>
              )}
            </div>
            <div className="flex flex-col gap-1 mt-2">
               <div className="detail-stat"><span className="text-secondary uppercase">Capacity</span><span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span></div>
               <div className="detail-stat"><span className="text-secondary uppercase">Type</span><span>{selectedFile.isDirectory ? 'DIR' : selectedFile.name.split('.').pop().toUpperCase()}</span></div>
               <div className="detail-stat"><span className="text-secondary uppercase">Node</span><span className="truncate ml-4 max-w-[120px]">{activeDevice.name}</span></div>
               <div className="flex gap-2 mt-6">
                  <button onClick={() => window.open(`${activeDevice.url}/api/download?path=${encodeURIComponent(selectedFile.path)}`)} className="flex-1 py-3 bg-cyan-400 text-black font-bold rounded-xl text-[10px]">EXTRACT DATA</button>
                  {isText(selectedFile.name) && <button onClick={() => openEditor(selectedFile)} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"><Settings size={18} /></button>}
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-10"><Globe size={48} /><p className="mt-4 text-[10px] font-bold">READY FOR INGESTION</p></div>
        )}
      </aside>

      {/* Text Editor Modal */}
      <AnimatePresence>
        {editor.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-6 md:p-12">
            <div className="bg-sidebar-bg border border-white/10 rounded-2xl w-full max-w-5xl h-full flex flex-col overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                <h3 className="font-bold flex gap-3 items-center text-sm"><FileText size={18} className="text-cyan-400" /> {editor.path.split(/[\\/]/).pop()}</h3>
                <div className="flex gap-3">
                   <button onClick={saveEditor} className="flex gap-2 items-center bg-cyan-400 text-black px-5 py-2 rounded-lg font-bold text-xs hover:bg-white transition-colors"><Save size={14} /> Synchronize</button>
                   <button onClick={() => setEditor({ ...editor, open: false })} className="p-2 text-secondary hover:text-white transition-colors"><X size={20} /></button>
                </div>
              </div>
              <textarea className="flex-1 bg-transparent p-8 font-mono text-xs md:text-sm outline-none resize-none text-slate-300 leading-relaxed" value={editor.content} onChange={(e) => setEditor({ ...editor, content: e.target.value })} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .flex-1 { flex: 1 1 0%; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .gap-2 { gap: 0.5rem; }
        .gap-3 { gap: 0.75rem; }
        .gap-4 { gap: 1rem; }
        .gap-6 { gap: 1.5rem; }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .max-w-\\[300px\\] { max-width: 300px; }
        .max-w-\\[120px\\] { max-width: 120px; }
        .absolute { position: absolute; }
        .left-4 { left: 1rem; }
        .top-1/2 { top: 50%; }
        .-translate-y-1/2 { transform: translateY(-50%); }
        .hidden { display: none; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        .mt-4 { margin-top: 1rem; }
        .mt-6 { margin-top: 1.5rem; }
        .mt-8 { margin-top: 2rem; }
        .-mt-1 { margin-top: -0.25rem; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .selected { background: rgba(0, 242, 255, 0.05); }
      ` }} />
    </div>
  );
};

export default App;
