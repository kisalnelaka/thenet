import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, FolderOpen, Clock, Star, Search, Bell, Settings,
  MoreVertical, Grid, List as ListIcon, Download, Upload, 
  Smartphone, Laptop, Wifi, Plus, File as FileIcon, Image as ImageIcon,
  Film, Music, FileText, X, ChevronLeft, Cpu
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
  const [history, setHistory] = useState([]);

  // Load and Identify Devices
  useEffect(() => {
    const init = async () => {
      // Identify current host first
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
      } catch (e) {
        console.error("Main identify failed");
      }
    };
    init();
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
      console.error('Connection failed:', error);
    }
    setLoading(false);
  };

  const handleNavigate = (path) => {
    setHistory(prev => [...prev, currentPath]);
    fetchFiles(path);
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prevPath = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      fetchFiles(prevPath);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      setLoading(true);
      await axios.post(`${activeDevice.url}/api/upload?path=${encodeURIComponent(currentPath)}`, formData);
      fetchFiles(currentPath);
    } catch (error) {
      alert('Upload failed. Check permissions on ' + activeDevice.name);
    }
    setLoading(false);
  };

  const handleDownload = (file) => {
    if (file.isDirectory) return;
    window.open(`${activeDevice.url}/api/download?path=${encodeURIComponent(file.path)}`, '_blank');
  };

  const addDevice = async () => {
    const ip = prompt("Enter Device IP (e.g. 192.168.100.X):");
    if (!ip) return;
    const url = ip.includes('://') ? ip : `http://${ip}:3000`;
    try {
      const res = await axios.get(`${url}/api/identity`);
      const newDevice = { ...res.data, url };
      const updated = [...devices.filter(d => d.url !== url), newDevice];
      setDevices(updated);
      localStorage.setItem('thenet_devices', JSON.stringify(updated));
    } catch (e) {
      alert("Failed to connect. Ensure your phone is on Wi-Fi and TheNet is running!");
    }
  };

  const getFileIcon = (file, size = 20) => {
    if (file.isDirectory) return <FolderOpen className="text-cyan-400" size={size} />;
    const ext = file.name.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return <ImageIcon className="text-purple-400" size={size} />;
    if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) return <Film className="text-red-400" size={size} />;
    if (['pdf', 'txt', 'doc', 'docx', 'zip', 'apk'].includes(ext)) return <FileText className="text-blue-400" size={size} />;
    return <FileIcon className="text-slate-400" size={size} />;
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <Wifi size={24} className="text-white" />
          <span>THE NET</span>
        </div>

        <nav className="nav-group">
          <div className="nav-item active"><LayoutDashboard size={20} /> <span>Dashboard</span></div>
          <div className="nav-item"><FolderOpen size={20} /> <span>My Drive</span></div>
          <div className="nav-item"><Clock size={20} /> <span>Recent</span></div>
          <div className="nav-item"><Star size={20} /> <span>Starred</span></div>
        </nav>

        <div style={{ marginTop: '40px' }}>
          <div className="flex justify-between items-center mb-6 px-2">
            <span className="text-xs font-bold text-secondary uppercase tracking-[2px]">Network Nodes</span>
            <button onClick={addDevice} className="p-1.5 bg-cyan-400/10 text-cyan-400 rounded-lg hover:bg-cyan-400/20 transition-all"><Plus size={16} /></button>
          </div>
          <div className="flex flex-col gap-3">
            {devices.map(d => (
              <div 
                key={d.url} 
                onClick={() => setActiveDevice(d)} 
                className={`nav-item device-node ${activeDevice.url === d.url ? 'active' : ''}`}
              >
                <div className={`p-2 rounded-xl ${activeDevice.url === d.url ? 'bg-cyan-400 text-black' : 'bg-white/5 text-secondary'}`}>
                  {d.type === 'mobile' ? <Smartphone size={20} /> : <Laptop size={20} />}
                </div>
                <div className="flex-1 truncate">
                  <p className="text-sm font-semibold truncate">{d.name}</p>
                  <p className="text-[10px] text-secondary opacity-60 font-mono">{d.ip || 'Localhost'}</p>
                </div>
                {activeDevice.url === d.url && <div className="active-pulse"></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="storage-widget mt-auto">
          <div className="flex justify-between items-center text-[10px] mb-2 uppercase font-bold tracking-wider">
            <span className="text-secondary">Node Status</span>
            <span className="text-cyan-400">Online</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: '100%' }}></div></div>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="main-wrapper">
        <header className="header">
          <div className="search-container">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
            <input 
              type="text" 
              className="search-input" 
              placeholder={`Query ${activeDevice.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-bold bg-white/5 border border-white/10 px-3 py-1 rounded-md text-secondary">
              <Cpu size={12} />
              <span>PLATFORM: {activeDevice.platform?.toUpperCase() || 'UNKNOWN'}</span>
            </div>
            <div className="user-profile">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kisal" className="avatar" alt="Avatar" />
              <div className="text-xs">
                <p className="font-bold">Kisal N.</p>
                <p className="text-green-400">● Online</p>
              </div>
            </div>
          </div>
        </header>

        <main className="content-area">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
              {history.length > 0 && (
                <button onClick={handleBack} className="glass-card !p-2 rounded-lg hover:text-cyan-400 transition-colors">
                  <ChevronLeft size={20} />
                </button>
              )}
              <div>
                <h1 className="section-title">{activeDevice.name}</h1>
                <p className="text-xs text-secondary -mt-4 font-mono">{currentPath || '/'}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => selectedFile && handleDownload(selectedFile)} className="glass-card !p-3 rounded-xl hover:text-cyan-400 transition-all"><Download size={20} /></button>
              <label className="glass-card !p-3 rounded-xl hover:text-cyan-400 transition-all cursor-pointer">
                <Upload size={20} /><input type="file" className="hidden" onChange={handleUpload} />
              </label>
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="quick-grid">
                {files.filter(f => f.isDirectory).slice(0, 4).map(folder => (
                  <div key={folder.path} className="glass-card cursor-pointer" onDoubleClick={() => handleNavigate(folder.path)}>
                    <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                      <FolderOpen className="text-cyan-400" />
                    </div>
                    <div className="flex-1 truncate">
                      <p className="font-semibold truncate">{folder.name}</p>
                      <p className="text-[10px] text-secondary uppercase font-bold">Directory</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="table-container">
                <div className="flex justify-between items-center mb-6 px-2">
                  <h2 className="text-sm font-bold uppercase tracking-[1px]">Data Nodes</h2>
                  <div className="flex gap-3">
                    <ListIcon size={16} className="text-cyan-400" />
                    <Grid size={16} className="text-secondary opacity-30" />
                  </div>
                </div>
                
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>ID</th>
                      <th>Object Name</th>
                      <th>Last Modified</th>
                      <th>Size</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map((file, idx) => (
                      <tr 
                        key={file.path} 
                        className={selectedFile?.path === file.path ? 'selected' : ''}
                        onClick={() => setSelectedFile(file)} 
                        onDoubleClick={() => file.isDirectory && handleNavigate(file.path)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="text-[10px] font-mono text-secondary">{idx + 1}</td>
                        <td><div className="flex items-center gap-3">{getFileIcon(file)}<span className="font-medium">{file.name}</span></div></td>
                        <td className="text-xs text-secondary font-mono">{new Date(file.modified).toLocaleDateString()}</td>
                        <td className="text-xs text-secondary font-mono">{file.isDirectory ? '--' : (file.size / 1024 / 1024).toFixed(2) + ' MB'}</td>
                        <td><button onClick={(e) => { e.stopPropagation(); handleDownload(file); }} className="p-2 opacity-0 group-hover:opacity-100 text-secondary hover:text-cyan-400"><Download size={16} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>

      <aside className="details-sidebar">
        <div className="flex justify-between items-center"><h2 className="text-sm font-bold uppercase tracking-widest">Metadata</h2><X size={18} className="text-secondary cursor-pointer" onClick={() => setSelectedFile(null)} /></div>
        {selectedFile ? (
          <>
            <div className="preview-box">
              {getFileIcon(selectedFile, 80)}
              <p className="mt-6 font-bold truncate w-full text-center text-sm">{selectedFile.name}</p>
            </div>
            <div className="flex flex-col gap-5 mt-6">
              <div className="flex justify-between text-xs font-mono"><span className="text-secondary">CAPACITY</span><span>{selectedFile.isDirectory ? '--' : (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB'}</span></div>
              <div className="flex justify-between text-xs font-mono"><span className="text-secondary">TYPE</span><span>{selectedFile.isDirectory ? 'DIR' : selectedFile.name.split('.').pop().toUpperCase()}</span></div>
              <div className="flex justify-between text-xs font-mono"><span className="text-secondary">NODE</span><span className="truncate ml-4 max-w-[120px]">{activeDevice.name}</span></div>
              {!selectedFile.isDirectory && (
                <button onClick={() => handleDownload(selectedFile)} className="w-full mt-6 py-3 bg-cyan-400 text-black font-bold rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(0,242,255,0.3)]">EXTRACT DATA</button>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-10">
            <Cpu size={64} /><p className="mt-4 text-xs font-bold uppercase">Ready for Input</p>
          </div>
        )}
      </aside>

      <style dangerouslySetInnerHTML={{ __html: `
        .device-node { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid transparent; }
        .device-node:hover { background: rgba(255,255,255,0.05); transform: translateX(5px); }
        .device-node.active { background: linear-gradient(90deg, rgba(0, 242, 255, 0.1) 0%, transparent 100%); border-left: 3px solid var(--accent-cyan); }
        .active-pulse { width: 8px; height: 8px; border-radius: 50%; background: var(--accent-cyan); animation: pulse 2s infinite; box-shadow: 0 0 10px var(--accent-cyan); }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
        .font-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .tracking-\\[2px\\] { letter-spacing: 2px; }
        .tracking-\\[1px\\] { letter-spacing: 1px; }
        .data-table th { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
      ` }} />
    </div>
  );
};

export default App;
