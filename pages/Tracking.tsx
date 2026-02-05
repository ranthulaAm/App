import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Package, CheckCircle2, AlertCircle, Clock, DollarSign, Download, Home, MessageCircle, Edit2, Trash2, Eye, Copy, Loader2, Info, X, Send, ShieldAlert, Check, Image as ImageIcon } from 'lucide-react';
import { listenToOrderById, updateOrder, cancelOrder, listenToOrdersByClientId } from '../services/storageService';
import { Order, OrderStatus, User } from '../types';

interface TrackingProps {
  user: User | null;
}

export const Tracking: React.FC<TrackingProps> = ({ user }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState(searchParams.get('id') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal States
  const [showDraftLightbox, setShowDraftLightbox] = useState(false);
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  
  // Body scroll lock for lightbox
  useEffect(() => {
    if (showDraftLightbox) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => { document.body.classList.remove('overflow-hidden'); }
  }, [showDraftLightbox]);

  // Fetch specific order if ID is in URL
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setTrackingId(idFromUrl);
      setError('');
      setIsLoading(true);
      const unsubscribe = listenToOrderById(idFromUrl, (foundOrder) => {
        setIsLoading(false);
        if (foundOrder) {
          setOrder(foundOrder);
          setError('');
        } else {
          setOrder(null);
          setError('Order not found.');
        }
      });
      return () => unsubscribe();
    } else {
      setOrder(null);
      setIsLoading(false);
    }
  }, [searchParams]);

  // Fetch list of orders for logged-in user
  useEffect(() => {
    if (user && !searchParams.get('id')) {
      const unsubscribe = listenToOrdersByClientId(user.id, (myOrders) => {
        setUserOrders(myOrders);
      });
      return () => unsubscribe();
    }
  }, [user, searchParams]);

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    alert(`Order ID ${text} copied!`);
  };

  const onEditClick = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/order?edit=${orderId}`);
  };

  const onHelpClick = (o: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://api.whatsapp.com/send?phone=94712132855&text=${encodeURIComponent(`Help with order ${o.id}`)}`, '_blank');
  };

  const handleApprove = async () => {
    if (!order) return;
    setIsSubmittingAction(true);
    try {
      await updateOrder({ ...order, status: OrderStatus.WAITING_PAYMENT });
      setShowDraftLightbox(false);
    } catch (err) {
      alert("Failed to approve draft.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleSubmitRevision = async () => {
    if (!order || !revisionNotes.trim()) return;
    setIsSubmittingAction(true);
    try {
      await updateOrder({ 
        ...order, 
        status: OrderStatus.REVISION, 
        revisionNotes: revisionNotes.trim() 
      });
      setIsRevisionMode(false);
      setRevisionNotes('');
      setShowDraftLightbox(false);
    } catch (err) {
      alert("Failed to submit revision.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await cancelOrder(order.id);
      } catch (err) {
        alert("Failed to cancel order.");
      }
    }
  };

  const STATUS_FLOW = [
    { id: OrderStatus.PENDING, label: 'PLACED' },
    { id: OrderStatus.REVIEWING, label: 'REVIEWING' },
    { id: OrderStatus.IN_PROGRESS, label: 'PROCESSING' },
    { id: OrderStatus.DRAFT_SENT, label: 'DRAFT' },
    { id: OrderStatus.WAITING_PAYMENT, label: 'PAYMENT' },
    { id: OrderStatus.COMPLETED, label: 'DONE' }
  ];

  const getCurrentStepIndex = (status: OrderStatus) => {
    if (status === OrderStatus.REVISION) return 3;
    if (status === OrderStatus.CANCELLED) return -1;
    return STATUS_FLOW.findIndex(s => s.id === status);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-6 animate-fade-in">
        <Loader2 className="animate-spin text-accent-purple" size={48} />
        <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-xs">Syncing...</p>
      </div>
    );
  }

  // 1. Detailed View (Single Order)
  if (order) {
    const isFilesDeleted = order.isDeletedByAdmin === true;
    const activeIndex = getCurrentStepIndex(order.status);
    const hasDraft = !!order.draftImg;

    return (
      <div className="min-h-screen pt-24 px-4 pb-12 max-w-7xl mx-auto">
        <div className="mb-8">
          <button onClick={() => { setOrder(null); setSearchParams({}); }} className="inline-flex items-center gap-3 text-white/70 hover:text-white transition-all group bg-white/5 border border-white/10 px-4 py-2 rounded-full">
             <Home size={18} />
             <span className="text-xs font-bold uppercase tracking-widest">Back to Projects</span>
          </button>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-neutral-900 border border-white/10 rounded-[3rem] p-8 md:p-12 backdrop-blur-md relative overflow-hidden shadow-2xl">
             <div className="flex justify-between items-start mb-10">
               <div>
                 <h2 className="text-3xl md:text-4xl font-display text-white mb-2">{order.serviceType}</h2>
                 <div className="text-xs font-mono text-white/40 uppercase tracking-widest">{order.id}</div>
               </div>
               <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${order.status === OrderStatus.COMPLETED ? 'bg-green-500/20 text-green-500 border-green-500/30' : order.status === OrderStatus.WAITING_PAYMENT ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' : 'bg-accent-purple/20 text-accent-purple border-accent-purple/30'}`}>
                 {order.status}
               </div>
             </div>
             
             <div className="relative pl-6 space-y-10 my-12 max-w-sm">
                <div className="absolute left-[31px] top-2 bottom-2 w-px bg-white/10"></div>
                {STATUS_FLOW.map((s, idx) => {
                   const isCompleted = idx <= activeIndex;
                   const isCurrent = idx === activeIndex;
                   return (
                     <div key={s.id} className="relative flex items-center gap-6">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 z-10 transition-all duration-500 ${isCompleted ? 'bg-accent-purple border-accent-purple shadow-[0_0_15px_rgba(213,0,249,0.8)]' : 'bg-transparent border-white/20'}`}></div>
                        <div className={`${isCompleted ? 'text-white' : 'text-white/20'} ${isCurrent ? 'font-black' : 'font-bold'} text-[11px] uppercase tracking-[0.2em]`}>{s.label}</div>
                     </div>
                   );
                })}
             </div>

             <div className="space-y-4">
                {order.status === OrderStatus.WAITING_PAYMENT && (
                   <div className="p-6 bg-orange-500/5 border border-orange-500/20 rounded-3xl flex flex-col items-center gap-2 text-center animate-fade-in mb-4">
                      <div className="flex items-center gap-2 text-orange-500 font-bold uppercase tracking-widest text-sm">
                        <DollarSign size={18} /> Payment Required
                      </div>
                      <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider">Please contact admin to complete payment.</p>
                   </div>
                )}

                {/* Final Assets Section for Completed Orders */}
                {order.status === OrderStatus.COMPLETED && order.finalFiles && order.finalFiles.length > 0 && (
                   <div className="p-8 bg-accent-green/5 border border-accent-green/20 rounded-3xl animate-fade-in mb-4 shadow-[0_0_40px_rgba(0,230,118,0.05)]">
                      <div className="flex items-center gap-3 text-accent-green font-black uppercase tracking-[0.2em] text-[10px] mb-6">
                        <CheckCircle2 size={18} /> Final Assets Ready
                      </div>
                      <div className="space-y-3">
                        {order.finalFiles.map((f, i) => (
                           <a 
                             key={i} 
                             href={f.data} 
                             download={f.name}
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl group transition-all"
                           >
                              <div className="flex items-center gap-4">
                                 <div className="p-2 bg-accent-green/10 rounded-lg text-accent-green group-hover:scale-110 transition-transform">
                                    <ImageIcon size={16} />
                                 </div>
                                 <span className="text-xs font-bold text-white/80 group-hover:text-white truncate max-w-[180px]">{f.name}</span>
                              </div>
                              <Download size={18} className="text-white/20 group-hover:text-accent-green group-hover:scale-110 transition-all" />
                           </a>
                        ))}
                      </div>
                   </div>
                )}

                {hasDraft && (
                  <button onClick={() => setShowDraftLightbox(true)} className="w-full bg-accent-purple text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(213,0,249,0.3)]">
                    <Eye size={18} /> View Draft / Proof
                  </button>
                )}

                {(order.status === OrderStatus.PENDING || order.status === OrderStatus.REVIEWING) && (
                  <button onClick={handleCancel} className="w-full bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-500 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all">
                    <Trash2 size={18} /> Cancel Order
                  </button>
                )}

                <button onClick={(e) => onHelpClick(order, e)} className="w-full bg-accent-green/5 hover:bg-accent-green/10 border border-accent-green/20 text-accent-green py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all">
                  <MessageCircle size={18} /> Contact Support
                </button>
             </div>
          </div>
        </div>

        {/* Draft Lightbox Modal - FIXED SCROLLING */}
        {showDraftLightbox && (
          <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 overflow-y-auto">
             <div className="fixed inset-0 bg-black/95 backdrop-blur-xl" onClick={() => !isRevisionMode && setShowDraftLightbox(false)}></div>
             
             <div className="relative w-full max-w-lg glass-effect border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl animate-float my-8">
                <div className="relative aspect-[3/4] bg-neutral-950 flex items-center justify-center">
                   {order.draftImg ? (
                     <div className="relative w-full h-full">
                       <img src={order.draftImg} className="w-full h-full object-contain pointer-events-none select-none" alt="Draft Preview" />
                       {/* Watermark/Warning UI */}
                       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none opacity-20 overflow-hidden">
                          <span className="text-4xl font-black uppercase tracking-[0.5em] text-white rotate-45 mb-40">PREVIEW ONLY</span>
                          <span className="text-4xl font-black uppercase tracking-[0.5em] text-white rotate-45">PREVIEW ONLY</span>
                       </div>
                       <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-500/20 border border-red-500/30 px-4 py-2 rounded-full flex items-center gap-2 whitespace-nowrap z-20">
                          <ShieldAlert size={14} className="text-red-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Screen Capture Disabled</span>
                       </div>
                     </div>
                   ) : (
                     <div className="text-white/20 italic text-sm">No preview available.</div>
                   )}
                   <button onClick={() => setShowDraftLightbox(false)} className="absolute top-6 right-6 bg-black/40 hover:bg-white/10 p-3 rounded-full text-white/50 hover:text-white transition-all border border-white/10 z-50">
                     <X size={20} />
                   </button>
                </div>

                <div className="p-8 md:p-10 bg-neutral-900">
                   <h4 className="text-2xl font-display text-white mb-2">{order.serviceType}</h4>
                   <p className="text-white/20 font-mono text-xs uppercase tracking-widest mb-8">{order.id}</p>

                   {isRevisionMode ? (
                     <div className="space-y-6 animate-fade-in">
                        <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                           <label className="text-[10px] font-black text-accent-purple uppercase tracking-widest mb-2 block">Your Feedback</label>
                           <textarea 
                             value={revisionNotes}
                             onChange={(e) => setRevisionNotes(e.target.value)}
                             placeholder="What would you like us to change? Please be specific about colors, layout, or text."
                             className="w-full bg-transparent border-none text-white text-sm outline-none placeholder:text-white/10 min-h-[120px] resize-none"
                             autoFocus
                           />
                        </div>
                        <div className="flex gap-4">
                           <button onClick={() => setIsRevisionMode(false)} className="flex-1 py-4 text-white/30 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors">Cancel</button>
                           <button 
                             onClick={handleSubmitRevision} 
                             disabled={!revisionNotes.trim() || isSubmittingAction}
                             className="flex-1 bg-white text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-accent-magenta hover:text-white transition-all disabled:opacity-50"
                           >
                             {isSubmittingAction ? 'Submitting...' : 'Send Revision'}
                           </button>
                        </div>
                     </div>
                   ) : (
                     <div className="space-y-8 animate-fade-in">
                        <div className="bg-accent-purple/5 border border-accent-purple/10 rounded-2xl p-6">
                           <div className="flex items-center gap-3 text-accent-purple font-black uppercase tracking-widest text-[11px] mb-2">
                              <CheckCircle2 size={16} /> Latest Draft Status
                           </div>
                           <p className="text-white/40 text-[11px] font-medium leading-relaxed">
                             Please review the artwork carefully. Check for spelling, layout, and colors.
                           </p>
                        </div>

                        <div className="space-y-4">
                           <button onClick={() => setIsRevisionMode(true)} className="w-full py-4 border border-white/10 rounded-xl text-white/60 font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-3">
                              <Clock size={16} /> Request Revision
                           </button>
                           <button onClick={handleApprove} disabled={isSubmittingAction} className="w-full bg-accent-purple text-white py-5 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-accent-magenta transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(213,0,249,0.3)]">
                              <Check size={18} /> Approve & Proceed
                           </button>
                        </div>
                        <p className="text-[9px] text-center text-white/20 uppercase font-bold tracking-widest px-4 leading-relaxed">
                          By approving, you confirm that the artwork is final. You will be asked to complete payment.
                        </p>
                     </div>
                   )}
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  // 2. List View (Grid of Cards)
  return (
    <div className="min-h-screen pt-24 px-4 pb-12 max-w-7xl mx-auto">
       <div className="mb-12">
          <Link to="/" className="inline-flex items-center gap-3 text-white/70 hover:text-white transition-all group bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <Home size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Home</span>
          </Link>
       </div>

       <div className="mb-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h1 className="text-5xl font-display font-bold text-white mb-2 uppercase tracking-tight">Active Projects</h1>
            <p className="text-text-muted text-lg font-light">Keep track of your creative requests (Real-time updates).</p>
          </div>
          <Link to="/order" className="bg-white text-black px-8 py-4 rounded-full font-bold shadow-2xl hover:bg-accent-magenta hover:text-white transition-all flex items-center gap-3 uppercase text-xs tracking-widest">
             <Package size={20} /> New Order
          </Link>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {userOrders.map((o) => {
           const isFilesDeleted = o.isDeletedByAdmin === true;
           
           return (
           <div key={o.id} onClick={() => setSearchParams({ id: o.id })} className="group relative bg-white/5 border border-white/10 hover:border-accent-purple/50 rounded-3xl transition-all duration-300 hover:bg-white/10 overflow-hidden flex flex-col h-full shadow-lg cursor-pointer">
             <div className="p-6 pb-0 flex-grow relative z-10">
                 <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center gap-2">
                       {o.status === OrderStatus.PENDING && (
                          <div className="relative flex h-2 w-2 mr-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </div>
                       )}
                       <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 bg-white/5 border-white/10 text-white/60">
                         {o.status}
                       </div>
                   </div>
                   
                   <div onClick={(e) => copyToClipboard(o.id, e)} className="flex items-center gap-2 cursor-pointer group/id hover:bg-white/5 px-2 py-1 -mr-2 rounded-lg transition-colors">
                     <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">ID</span>
                     <div className="text-xs font-mono text-white/30 group-hover/id:text-white transition-colors uppercase">{o.id}</div>
                     <Copy size={12} className="text-white/10 group-hover/id:text-accent-purple opacity-0 group-hover/id:opacity-100 transition-all" />
                   </div>
                 </div>
                 
                 <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-display text-white group-hover:text-accent-purple transition-colors">{o.serviceType}</h3>
                    {isFilesDeleted && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-bold uppercase rounded-md tracking-wider">
                            Files Deleted
                        </span>
                    )}
                 </div>
                 
                 <p className="text-white/50 text-sm line-clamp-2 mb-6">{o.requirements}</p>
             </div>
             
             <div className="p-6 pt-4 border-t border-white/5 flex flex-wrap justify-between items-center gap-y-3 relative z-50 bg-transparent pointer-events-auto">
                <div className="flex flex-col">
                    <span className="text-[10px] text-white/30 font-bold uppercase">Created</span>
                    <span className="text-xs text-white/60 font-mono">{new Date(o.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center gap-2">
                   <button onClick={(e) => onHelpClick(o, e)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white transition-all border border-green-600/20">
                       <MessageCircle size={16} />
                       <span className="text-[10px] font-bold uppercase tracking-wider">Help</span>
                   </button>
                   {(o.status === OrderStatus.PENDING || o.status === OrderStatus.REVIEWING) && <button onClick={(e) => onEditClick(o.id, e)} className="p-2 rounded-lg bg-white/5 hover:bg-white/20 text-white transition-all"><Edit2 size={16} /></button>}
                </div>
             </div>
           </div>
           );
         })}
       </div>
    </div>
  );
};
