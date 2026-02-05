import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listenToOrders, updateOrder } from '../services/storageService';
import { deleteFileFromUrl } from '../services/fileUploadService';
import { sendStatusUpdateEmail } from '../services/emailService';
import { Order, OrderStatus } from '../types';
import { uploadFileWithProgress } from '../services/fileUploadService';
import { Search, MessageCircle, Layout, LogOut, ChevronRight, Save, User, X, AlertCircle, Download, Music, Copy, Check, Upload, Image as ImageIcon, FileBox, RefreshCw, DollarSign, ChevronUp, ChevronDown, Loader2, Trash2, Bell } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Progress State
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  
  // Edit States for the Modal
  const [editStatus, setEditStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [editEta, setEditEta] = useState('');
  
  // Deliverable States
  const [draftImage, setDraftImage] = useState<string | null>(null);
  const [finalFiles, setFinalFiles] = useState<{ name: string; type: string; data: string }[]>([]);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = listenToOrders((data) => {
      setOrders(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    navigate('/');
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const openOrder = (order: Order) => {
    if (!order) return;
    setSelectedOrder(order);
    setEditStatus(order.status);
    setEditEta(order.estimatedCompletion);
    setDraftImage(order.draftImg || null);
    setFinalFiles(order.finalFiles || []);
    setUploadProgress({});
  };

  const closeOrder = () => {
    setSelectedOrder(null);
    setDraftImage(null);
    setFinalFiles([]);
    setUploadProgress({});
  };

  const handleDraftUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedOrder) {
      const path = `${selectedOrder.clientId}/uploads/${selectedOrder.id}/drafts/${Date.now()}_${file.name}`;
      try {
          const url = await uploadFileWithProgress(file, path, (p) => {
            setUploadProgress(prev => ({ ...prev, draft: p }));
          });
          setDraftImage(url);
          // Auto update status suggestion
          if (editStatus !== OrderStatus.DRAFT_SENT) {
             setEditStatus(OrderStatus.DRAFT_SENT);
          }
          setUploadProgress(prev => {
            const n = { ...prev };
            delete n.draft;
            return n;
          });
      } catch (err) {
          console.error("Draft upload failed", err);
          alert("Failed to upload draft.");
          setUploadProgress(prev => {
            const n = { ...prev };
            delete n.draft;
            return n;
          });
      }
    }
  };

  const removeDraft = async () => {
      if (draftImage) {
          await deleteFileFromUrl(draftImage);
      }
      setDraftImage(null);
  };

  const handleFinalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && selectedOrder) {
      const fileList = Array.from(files) as File[];
      try {
        const newFiles = await Promise.all(fileList.map(async (f) => {
          const path = `${selectedOrder.clientId}/uploads/${selectedOrder.id}/final_assets/${Date.now()}_${f.name}`;
          const url = await uploadFileWithProgress(f, path, (p) => {
            setUploadProgress(prev => ({ ...prev, [f.name]: p }));
          });
          setUploadProgress(prev => {
            const n = { ...prev };
            delete n[f.name];
            return n;
          });
          return { name: f.name, type: f.type, data: url };
        }));
        setFinalFiles(prev => [...prev, ...newFiles]);
      } catch (err) {
        alert("Error uploading files.");
      }
    }
  };

  const removeFinalFile = async (index: number) => {
      const file = finalFiles[index];
      if (file && file.data) {
          await deleteFileFromUrl(file.data);
      }
      setFinalFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const saveChanges = async () => {
    if (!selectedOrder) return;
    const hasStatusChanged = editStatus !== selectedOrder.status;
    const updatedOrder = {
      ...selectedOrder,
      status: editStatus,
      estimatedCompletion: editEta || "",
      draftImg: draftImage || null,
      finalFiles: finalFiles || [],
    };
    await updateOrder(updatedOrder);
    if (hasStatusChanged) {
       await sendStatusUpdateEmail(updatedOrder, editStatus);
       if(window.confirm("Status changed. Open WhatsApp to notify client?")) {
           sendWhatsAppNotification(updatedOrder, editStatus);
       }
    }
    closeOrder();
  };

  const markPaymentComplete = async () => {
      setEditStatus(OrderStatus.COMPLETED);
      alert("Payment Marked as Completed. Please remember to 'Save Changes' to notify the client.");
  };

  const copyPalette = (palette: string[]) => {
    navigator.clipboard.writeText(palette.join(', '));
    alert('Copied!');
  };

  const exportPalette = (palette: string[]) => {
      const content = `Palette: ${palette.join(', ')}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `palette.txt`;
      a.click();
      URL.revokeObjectURL(url);
  };

  const sendWhatsAppNotification = (order: Order, status: OrderStatus) => {
      const url = `https://api.whatsapp.com/send?phone=${order.mobile.replace(/[^0-9]/g, '')}&text=Order Update: ${status}`;
      window.open(url, '_blank');
  };

  const filteredOrders = orders.filter(o => {
      if (!o) return false;
      const matchesSearch = (o.clientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (o.id?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || o.status === filterStatus;
      return matchesSearch && matchesStatus;
  }).sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const pendingCount = orders.filter(o => o.status === OrderStatus.PENDING).length;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm">
         <div className="flex items-center gap-3">
             <span className="font-bold text-lg tracking-tight pl-2">Admin Dashboard</span>
             <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded border border-green-200">CLOUD MODE</span>
             {pendingCount > 0 && (
                <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-200 text-[10px] font-bold animate-pulse">
                  <Bell size={10} /> {pendingCount} NEW
                </div>
             )}
         </div>
         <div className="flex items-center gap-4">
             <button onClick={handleLogout} className="text-xs font-bold text-gray-500 hover:text-red-600 flex items-center gap-2 bg-gray-100 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors cursor-pointer">
                <LogOut size={14} /> Log Out
             </button>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Projects</h2>
              <p className="text-gray-500 text-sm">Manage client requests (Real-time Cloud Sync).</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                   <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                   <input 
                     value={searchTerm} 
                     onChange={e => setSearchTerm(e.target.value)}
                     placeholder="Search projects..." 
                     className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                   />
                </div>
                <div className="bg-white border border-gray-200 text-gray-400 p-2.5 rounded-lg transition-all" title="Sync Status">
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                </div>
            </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          <th className="p-4 pl-6">ID / Client</th>
                          <th className="p-4">Service</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors select-none group" onClick={toggleSort}>
                              <div className="flex items-center gap-1 text-gray-700">
                                  Date
                                  {sortOrder === 'asc' ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                              </div>
                          </th>
                          <th className="p-4 text-right pr-6">Action</th>
                      </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100">
                      {filteredOrders.length > 0 ? filteredOrders.map(o => (
                          <tr key={o?.id || Math.random()} className={`hover:bg-gray-50 transition-colors group cursor-pointer relative ${o?.status === OrderStatus.CANCELLED ? 'opacity-60 bg-red-50/10' : ''}`} onClick={() => openOrder(o)}>
                              <td className="p-4 pl-6">
                                  <div className="flex items-center gap-4">
                                      {o?.status === OrderStatus.PENDING && !o.isDeletedByAdmin && (
                                          <div className="relative flex h-3 w-3 shrink-0">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                                          </div>
                                      )}
                                      <div className="flex flex-col relative">
                                        {o?.status === OrderStatus.REVISION && <span className="absolute -left-4 top-1.5 w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>}
                                        <span className={`font-medium ${o?.status === OrderStatus.CANCELLED ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{o?.clientName}</span>
                                        <span className="text-xs font-mono text-gray-400 uppercase tracking-tighter">{o?.id}</span>
                                      </div>
                                  </div>
                              </td>
                              <td className="p-4 text-gray-600">
                                  {o?.serviceType}
                                  {o.isDeletedByAdmin && <span className="ml-2 text-[9px] bg-red-100 text-red-600 px-1 rounded uppercase font-bold">Files Deleted</span>}
                              </td>
                              <td className="p-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                      o?.status === OrderStatus.COMPLETED ? 'bg-green-50 text-green-700 border-green-200' :
                                      o?.status === OrderStatus.REVISION ? 'bg-orange-100 text-orange-800 border-orange-200 animate-pulse' :
                                      o?.status === OrderStatus.IN_PROGRESS ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                      o?.status === OrderStatus.CANCELLED ? 'bg-red-50 text-red-600 border-red-200' :
                                      o?.status === OrderStatus.WAITING_PAYMENT ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                      o?.status === OrderStatus.PENDING ? 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-500/20' :
                                      'bg-gray-100 text-gray-700 border-gray-200'
                                  }`}>
                                      {o?.status}
                                  </span>
                              </td>
                              <td className="p-4 text-gray-500 text-xs">{o?.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A'}</td>
                              <td className="p-4 text-right pr-6">
                                  <div className="flex items-center justify-end gap-2">
                                      <button onClick={() => openOrder(o)} className="text-gray-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-full">
                                          <ChevronRight size={18} />
                                      </button>
                                  </div>
                              </td>
                          </tr>
                      )) : (
                          <tr>
                              <td colSpan={5} className="p-12 text-center text-gray-400 text-sm">
                                  {isLoading ? 'Syncing...' : 'No projects found.'}
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
            </div>
        </div>
      </div>

      {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={closeOrder}></div>
              <div className="relative bg-white rounded-2xl w-full max-w-5xl h-[90vh] shadow-2xl flex flex-col animate-fade-in border border-gray-200 overflow-hidden">
                  <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-white z-10 shrink-0">
                      <div>
                          <div className="flex items-center gap-3">
                             <h2 className="text-2xl font-bold text-gray-900">{selectedOrder?.serviceType}</h2>
                             {selectedOrder?.status === OrderStatus.COMPLETED && (
                                <div className="bg-green-100 text-green-800 text-[10px] uppercase font-bold px-2 py-1 rounded border border-green-200 flex items-center gap-1">
                                    <Check size={12} /> Approved by Client
                                </div>
                             )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                             <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700 uppercase">{selectedOrder?.id}</span>
                             <span>•</span>
                             <span className="flex items-center gap-1"><User size={14} /> {selectedOrder?.clientName}</span>
                          </div>
                      </div>
                      <button onClick={closeOrder} className="text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                          <X size={20} />
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-50/50">
                      
                      {/* COLUMN 1: CONTROLS */}
                      <div className="md:col-span-1 space-y-6">
                          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                              <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-4">Project Controls</h3>
                              <div className="mb-4">
                                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Status</label>
                                <select 
                                  value={editStatus} 
                                  onChange={e => setEditStatus(e.target.value as OrderStatus)}
                                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:bg-white"
                                >
                                    {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </div>
                              <div className="mb-6">
                                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Estimated Completion</label>
                                <input 
                                  value={editEta}
                                  onChange={e => setEditEta(e.target.value)}
                                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:bg-white"
                                />
                              </div>
                              {selectedOrder?.status === OrderStatus.WAITING_PAYMENT && (
                                <button onClick={markPaymentComplete} className="w-full mt-2 bg-green-600 text-white py-3 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-green-600/30">
                                   <DollarSign size={16} /> Confirm Payment
                                </button>
                              )}
                          </div>

                          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                             <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-4">Deliverables</h3>
                             <label className="block w-full cursor-pointer group">
                                <div className="w-full h-32 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-gray-50 hover:border-blue-300 transition-colors relative overflow-hidden">
                                   {uploadProgress.draft !== undefined ? (
                                      <div className="flex flex-col items-center gap-2 w-full px-4">
                                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                              <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${uploadProgress.draft}%` }}></div>
                                          </div>
                                          <span className="text-[10px] font-bold text-blue-600">{Math.round(uploadProgress.draft)}%</span>
                                      </div>
                                   ) : draftImage ? (
                                     <div className="relative w-full h-full">
                                         <img src={draftImage} className="w-full h-full object-cover opacity-50" alt="Draft" />
                                         <button onClick={(e) => { e.preventDefault(); removeDraft(); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full z-20 hover:bg-red-600"><X size={12} /></button>
                                     </div>
                                   ) : (
                                     <Upload className="text-gray-300 group-hover:text-blue-500" />
                                   )}
                                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                      <span className="text-xs font-bold text-gray-500 bg-white/80 px-2 py-1 rounded shadow-sm">
                                        {draftImage ? 'Change Preview' : uploadProgress.draft ? 'Uploading...' : 'Upload Preview'}
                                      </span>
                                   </div>
                                </div>
                                <input type="file" onChange={handleDraftUpload} className="hidden" accept="image/*" />
                             </label>
                             <div className="text-[10px] text-gray-400 mt-2 text-center">Uploading sets status to 'Draft Sent'</div>
                          </div>

                          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                             <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-4">Final Assets</h3>
                             <label className="block w-full cursor-pointer group mb-4">
                                <div className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-gray-50 hover:border-blue-300 transition-all bg-gray-50/30">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                        <Upload size={20} className="text-blue-500" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-600">Upload Final Files</span>
                                </div>
                                <input type="file" onChange={handleFinalFileUpload} className="hidden" multiple />
                             </label>
                             <div className="space-y-3">
                                {Object.keys(uploadProgress).filter(k => k !== 'draft').map(fileName => (
                                    <div key={fileName} className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg animate-pulse">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-bold text-blue-800 truncate flex-1">{fileName}</span>
                                            <span className="text-[10px] font-bold text-blue-600">{Math.round(uploadProgress[fileName])}%</span>
                                        </div>
                                        <div className="w-full bg-blue-100 rounded-full h-1 overflow-hidden">
                                            <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${uploadProgress[fileName]}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                                {finalFiles.length > 0 ? finalFiles.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 group shadow-sm hover:border-gray-200 transition-all">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                           <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                                              <FileBox size={16} className="text-gray-400" />
                                           </div>
                                           <span className="text-xs text-gray-700 font-medium truncate max-w-[150px]">{f.name}</span>
                                        </div>
                                        <button onClick={() => removeFinalFile(i)} className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"><X size={16}/></button>
                                    </div>
                                )) : <div className="text-center text-xs text-gray-400 italic">No final files added.</div>}
                             </div>
                          </div>

                          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                              <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-4">Communication</h3>
                              <button onClick={() => selectedOrder && sendWhatsAppNotification(selectedOrder, selectedOrder.status)} className="w-full bg-emerald-50 text-emerald-600 py-4 rounded-xl font-bold text-xs uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-emerald-100">
                                  <MessageCircle size={18} /> WhatsApp Update
                              </button>
                          </div>
                      </div>

                      {/* COLUMN 2 & 3: DETAILS */}
                      <div className="md:col-span-2 space-y-6">
                           {selectedOrder?.status === OrderStatus.REVISION && (
                               <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-start gap-4">
                                   <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={18} />
                                   <div>
                                       <h4 className="text-orange-800 font-bold text-sm">Revision Requested</h4>
                                       <p className="text-orange-700 text-sm mt-1">{selectedOrder.revisionNotes || "No notes provided."}</p>
                                   </div>
                               </div>
                           )}

                           {selectedOrder?.isDeletedByAdmin && (
                               <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-4">
                                   <div className="bg-red-100 p-2 rounded-full"><Trash2 className="text-red-500" size={20} /></div>
                                   <div>
                                       <h4 className="text-red-800 font-bold text-sm">Files Erased</h4>
                                       <p className="text-red-700 text-xs mt-0.5">Admin has removed the assets for this project.</p>
                                   </div>
                               </div>
                           )}

                           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                              <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                                <Download size={16} className="text-gray-400" /> Client Assets
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div>
                                   <span className="text-gray-400 block text-xs uppercase tracking-wider mb-3">Uploaded Files</span>
                                   {selectedOrder?.files && selectedOrder.files.length > 0 ? (
                                     <div className="space-y-2">
                                       {selectedOrder.files.map((f, i) => (
                                          <a key={i} href={f.data} download={f.name} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg group transition-colors cursor-pointer">
                                              <div className="flex items-center gap-3 overflow-hidden">
                                                 <div className="bg-white p-1.5 rounded border border-gray-200 text-gray-500"><ImageIcon size={14} /></div>
                                                 <span className="text-sm text-gray-700 font-medium truncate">{f.name}</span>
                                              </div>
                                              <Download size={14} className="text-gray-400 group-hover:text-blue-500" />
                                          </a>
                                       ))}
                                     </div>
                                   ) : (
                                     <div className="text-gray-400 italic text-sm bg-gray-50 p-3 rounded-lg text-center">No files uploaded.</div>
                                   )}
                                 </div>
                                 <div>
                                   <span className="text-gray-400 block text-xs uppercase tracking-wider mb-3">Voice Briefs</span>
                                   {selectedOrder?.voiceClips && selectedOrder.voiceClips.length > 0 ? (
                                     <div className="space-y-2">
                                       {selectedOrder.voiceClips.map((v, i) => (
                                          <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                             <div className="flex items-center gap-2 mb-2">
                                                <Music size={14} className="text-purple-500" />
                                                <span className="text-xs font-bold text-gray-700">{v.name}</span>
                                             </div>
                                             <audio controls src={v.data} className="w-full h-8" />
                                          </div>
                                       ))}
                                     </div>
                                   ) : (
                                      <div className="text-gray-400 italic text-sm bg-gray-50 p-3 rounded-lg text-center">No voice notes.</div>
                                   )}
                                 </div>
                              </div>
                           </div>
                           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                               <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Layout size={16} className="text-gray-400" /> Specifications</h3>
                                  <button onClick={() => selectedOrder && exportPalette(selectedOrder.colorPalette)} className="text-[10px] font-bold text-gray-500 hover:text-blue-600 flex items-center gap-1 uppercase tracking-wider">
                                    <Download size={12} /> Export Palette
                                  </button>
                               </div>
                               <div className="grid grid-cols-2 gap-6 text-sm">
                                   {selectedOrder?.dimensions && (
                                       <div>
                                           <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">Dimensions</span>
                                           <span className="font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded inline-block uppercase">{selectedOrder.dimensions.width}x{selectedOrder.dimensions.height}{selectedOrder.dimensions.unit} ({selectedOrder.dimensions.ppi}ppi)</span>
                                       </div>
                                   )}
                                   <div>
                                        <div className="flex justify-between items-center mb-1">
                                           <span className="text-gray-400 block text-xs uppercase tracking-wider">Palette</span>
                                           <button onClick={() => selectedOrder && copyPalette(selectedOrder.colorPalette)} className="text-gray-400 hover:text-gray-600"><Copy size={10} /></button>
                                        </div>
                                        <div className="flex gap-1.5 mt-1 flex-wrap">
                                            {selectedOrder?.colorPalette.map(c => <div key={c} className="w-8 h-8 rounded-full border border-gray-200 shadow-sm" style={{backgroundColor: c}}></div>)}
                                        </div>
                                   </div>
                                   <div className="col-span-2">
                                       <span className="text-gray-400 block text-xs uppercase tracking-wider mb-2">Project Brief</span>
                                       <div className="bg-gray-50 p-4 rounded-lg border border-white/5 text-gray-800 leading-relaxed whitespace-pre-wrap">
                                          {selectedOrder?.requirements}
                                       </div>
                                       
                                       {selectedOrder?.customFields && Object.keys(selectedOrder.customFields).length > 0 && (
                                           <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                                             {Object.entries(selectedOrder.customFields).map(([key, value]) => {
                                                if (!value) return null;
                                                return (
                                                  <div key={key} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">{key}</span>
                                                    <div className="text-sm font-medium text-gray-800 break-words">
                                                      {Array.isArray(value) ? (
                                                        <ul className="list-disc list-inside space-y-1">
                                                          {value.map((item: any, i: number) => {
                                                            if (typeof item === 'string') return <li key={i}>{item}</li>;
                                                            if (item.platform && item.handle) return <li key={i}><span className="font-semibold">{item.platform}:</span> {item.handle}</li>;
                                                            if (item.title) return <li key={i}><span className="italic">{item.title}</span> {item.author ? `by ${item.author}` : ''}</li>;
                                                            return <li key={i}>{JSON.stringify(item)}</li>;
                                                          })}
                                                        </ul>
                                                      ) : (
                                                        value.toString()
                                                      )}
                                                    </div>
                                                  </div>
                                                );
                                             })}
                                           </div>
                                       )}
                                   </div>
                               </div>
                           </div>
                      </div>
                  </div>
                  
                  <div className="px-8 py-5 border-t border-gray-100 bg-white flex justify-end items-center gap-4 z-10 shrink-0">
                      <button onClick={closeOrder} className="px-6 py-2.5 rounded-lg text-gray-500 font-semibold hover:bg-gray-100 transition-colors text-sm">Cancel</button>
                      <button onClick={saveChanges} disabled={Object.keys(uploadProgress).length > 0} className={`px-10 py-3.5 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-3 text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all ${Object.keys(uploadProgress).length > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}>
                          {Object.keys(uploadProgress).length > 0 ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                          {Object.keys(uploadProgress).length > 0 ? 'Uploading...' : 'Save Changes'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};