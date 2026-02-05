import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Upload, Check, ChevronRight, Palette, Plus, X, ArrowLeft, AlertCircle, Home as HomeIcon, ShieldCheck, Mic, Square, Play, Trash2, PlusCircle, MinusCircle, Monitor, Smartphone, Printer, Layers, Move, Maximize, CreditCard, BookOpen, FileText, Image as ImageIcon, Video, Facebook, Linkedin, Youtube, Instagram, Twitter, Loader } from 'lucide-react';
import { SERVICES } from '../constants';
import { User } from '../types';
import { saveOrder, updateOrder, getOrderById, generateOrderId } from '../services/storageService';
import { uploadFile } from '../services/fileUploadService';
import { sendConfirmationEmail } from '../services/emailService';
import { OrderStatus } from '../types';

interface OrderProps {
  user: User | null;
  onLoginRequest: () => void;
}

// --- INDUSTRY STANDARD PRESETS ---
const SERVICE_PRESETS: Record<string, any[]> = {
  s_social: [
    { id: 'ig_sq', name: 'Instagram Square', width: '1080', height: '1080', unit: 'px', ppi: '72', icon: Instagram },
    { id: 'ig_pt', name: 'Instagram Portrait', width: '1080', height: '1350', unit: 'px', ppi: '72', icon: Instagram },
    { id: 'ig_st', name: 'Story / Reel / TikTok', width: '1080', height: '1920', unit: 'px', ppi: '72', icon: Smartphone },
    { id: 'fb_pt', name: 'Facebook Post', width: '1200', height: '630', unit: 'px', ppi: '72', icon: Facebook },
    { id: 'fb_cv', name: 'Facebook Cover', width: '820', height: '312', unit: 'px', ppi: '72', icon: Facebook },
    { id: 'yt_th', name: 'YouTube Thumbnail', width: '1280', height: '720', unit: 'px', ppi: '72', icon: Youtube },
    { id: 'li_cv', name: 'LinkedIn Banner', width: '1584', height: '396', unit: 'px', ppi: '72', icon: Linkedin },
    { id: 'tw_hd', name: 'X / Twitter Header', width: '1500', height: '500', unit: 'px', ppi: '72', icon: Twitter },
    { id: 'pin_lg', name: 'Pinterest Pin', width: '1000', height: '1500', unit: 'px', ppi: '72', icon: ImageIcon },
  ],
  s_invite: [
    { id: 'inv_57', name: 'Standard 5x7"', width: '5', height: '7', unit: 'in', ppi: '300', icon: Printer },
    { id: 'inv_46', name: 'Classic 4x6"', width: '4', height: '6', unit: 'in', ppi: '300', icon: Printer },
    { id: 'inv_sq', name: 'Square 5.25"', width: '5.25', height: '5.25', unit: 'in', ppi: '300', icon: Printer },
    { id: 'inv_a5', name: 'A5 Invitation', width: '148', height: '210', unit: 'mm', ppi: '300', icon: Printer },
    { id: 'inv_dl', name: 'DL Card', width: '99', height: '210', unit: 'mm', ppi: '300', icon: Printer },
    { id: 'evite', name: 'Digital Evite (HD)', width: '1080', height: '1920', unit: 'px', ppi: '72', icon: Smartphone },
  ],
  s_banner: [
    { id: 'ban_web_l', name: 'Leaderboard', width: '728', height: '90', unit: 'px', ppi: '72', icon: Monitor },
    { id: 'ban_web_m', name: 'Medium Rect', width: '300', height: '250', unit: 'px', ppi: '72', icon: Monitor },
    { id: 'ban_web_s', name: 'Skyscraper', width: '160', height: '600', unit: 'px', ppi: '72', icon: Monitor },
    { id: 'ban_roll', name: 'Roll-up Standee', width: '850', height: '2000', unit: 'mm', ppi: '150', icon: Layers },
    { id: 'ban_fb_ev', name: 'FB Event Cover', width: '1920', height: '1005', unit: 'px', ppi: '72', icon: Facebook },
    { id: 'ban_yt_ch', name: 'YouTube Channel', width: '2560', height: '1440', unit: 'px', ppi: '72', icon: Youtube },
  ],
  s_flyer: [
    { id: 'fly_a4', name: 'A4 Standard', width: '210', height: '297', unit: 'mm', ppi: '300', icon: FileText },
    { id: 'fly_a5', name: 'A5 Half Page', width: '148', height: '210', unit: 'mm', ppi: '300', icon: FileText },
    { id: 'fly_a6', name: 'A6 Postcard', width: '105', height: '148', unit: 'mm', ppi: '300', icon: FileText },
    { id: 'fly_dl', name: 'DL Rack Card', width: '99', height: '210', unit: 'mm', ppi: '300', icon: FileText },
    { id: 'fly_us', name: 'US Letter', width: '8.5', height: '11', unit: 'in', ppi: '300', icon: FileText },
    { id: 'fly_dig', name: 'Digital Flyer', width: '1080', height: '1350', unit: 'px', ppi: '72', icon: Smartphone },
  ],
  s_tute: [
    { id: 'tut_a4', name: 'A4 Document', width: '210', height: '297', unit: 'mm', ppi: '300', icon: BookOpen },
    { id: 'tut_us', name: 'US Letter', width: '8.5', height: '11', unit: 'in', ppi: '300', icon: BookOpen },
    { id: 'tut_scr', name: 'Presentation (16:9)', width: '1920', height: '1080', unit: 'px', ppi: '72', icon: Monitor },
    { id: 'tut_tb', name: 'Tabloid (11x17)', width: '11', height: '17', unit: 'in', ppi: '300', icon: Printer },
  ],
  s_letterhead: [
    { id: 'lh_a4', name: 'A4 Letterhead', width: '210', height: '297', unit: 'mm', ppi: '300', icon: FileText },
    { id: 'lh_us', name: 'US Letter', width: '8.5', height: '11', unit: 'in', ppi: '300', icon: FileText },
    { id: 'lh_dig', name: 'Email Header', width: '600', height: '200', unit: 'px', ppi: '72', icon: Monitor },
  ],
  s_book: [
    { id: 'bk_kind', name: 'Kindle / Ebook', width: '1600', height: '2560', unit: 'px', ppi: '72', icon: Smartphone },
    { id: 'bk_aud', name: 'Audiobook', width: '2400', height: '2400', unit: 'px', ppi: '72', icon: Smartphone },
    { id: 'bk_69', name: 'Trade Paperback (6x9)', width: '6', height: '9', unit: 'in', ppi: '300', icon: BookOpen },
    { id: 'bk_58', name: 'Novel Standard (5x8)', width: '5', height: '8', unit: 'in', ppi: '300', icon: BookOpen },
    { id: 'bk_sq', name: 'Square Book', width: '8.5', height: '8.5', unit: 'in', ppi: '300', icon: BookOpen },
  ],
  s_businesscard: [
    { id: 'bc_us', name: 'US Standard', width: '3.5', height: '2', unit: 'in', ppi: '300', icon: CreditCard },
    { id: 'bc_eu', name: 'EU Standard', width: '85', height: '55', unit: 'mm', ppi: '300', icon: CreditCard },
    { id: 'bc_sq', name: 'Square', width: '2.5', height: '2.5', unit: 'in', ppi: '300', icon: CreditCard },
    { id: 'bc_vert', name: 'Vertical US', width: '2', height: '3.5', unit: 'in', ppi: '300', icon: CreditCard },
  ],
};

// ... [Color Utils omitted for brevity, logic remains the same] ...
const rgbToCmyk = (r: number, g: number, b: number) => {
  let c = 1 - (r / 255);
  let m = 1 - (g / 255);
  let y = 1 - (b / 255);
  let k = Math.min(c, Math.min(m, y));
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  c = (c - k) / (1 - k);
  m = (m - k) / (1 - k);
  y = (y - k) / (1 - k);
  return { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) };
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
};

const PhotoshopColorPicker: React.FC<{ color: string; onChange: (hex: string) => void; onAdd: (hex: string) => void; isPrintMode: boolean; canAdd: boolean; }> = ({ color, onChange, onAdd, isPrintMode, canAdd }) => {
  const [h, setH] = useState(0);
  const [s, setS] = useState(100);
  const [v, setV] = useState(100);
  const [isDraggingSV, setIsDraggingSV] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const hsvToHex = (h: number, s: number, v: number) => {
    const s_val = s / 100;
    const v_val = v / 100;
    const i = Math.floor(h / 60);
    const f = h / 60 - i;
    const p = v_val * (1 - s_val);
    const q = v_val * (1 - f * s_val);
    const t = v_val * (1 - (1 - f) * s_val);
    let r = 0, g = 0, b = 0;
    switch (i % 6) { case 0: r = v_val; g = t; b = p; break; case 1: r = q; g = v_val; b = p; break; case 2: r = p; g = v_val; b = t; break; case 3: r = p; g = q; b = v_val; break; case 4: r = t; g = p; b = v_val; break; case 5: r = v_val; g = p; b = q; break; }
    const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const updateSV = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    const newS = Math.round((x / rect.width) * 100);
    const newV = Math.round(100 - (y / rect.height) * 100);
    setS(newS);
    setV(newV);
    onChange(hsvToHex(h, newS, newV));
  }, [h, onChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = `hsl(${h}, 100%, 50%)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const whiteGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    whiteGrad.addColorStop(0, 'white');
    whiteGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = whiteGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const blackGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    blackGrad.addColorStop(0, 'transparent');
    blackGrad.addColorStop(1, 'black');
    ctx.fillStyle = blackGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [h]);

  useEffect(() => {
    if (!isDraggingSV) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
      updateSV(clientX, clientY);
    };
    const onUp = () => setIsDraggingSV(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onUp); };
  }, [isDraggingSV, updateSV]);

  const rgb = hexToRgb(color);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

  return (
    <div className="bg-neutral-900 border border-white/10 p-5 rounded-[2.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8)] w-full max-w-sm animate-fade-in h-fit">
      <div className="flex gap-4 h-48 mb-5">
        <div className="relative flex-1">
          <canvas ref={canvasRef} width={220} height={220} className="w-full h-full rounded-2xl cursor-crosshair border border-white/5 touch-none" onMouseDown={(e) => { setIsDraggingSV(true); updateSV(e.clientX, e.clientY); }} onTouchStart={(e) => { setIsDraggingSV(true); updateSV(e.touches[0].clientX, e.touches[0].clientY); }} />
          <div className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none -translate-x-1/2 -translate-y-1/2" style={{ left: `${s}%`, top: `${100 - v}%`, backgroundColor: color }} />
        </div>
        <div className="w-8 h-full relative rounded-xl overflow-hidden border border-white/5 bg-white/5">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }} />
          <input type="range" min="0" max="360" value={h} onChange={(e) => { const newH = parseInt(e.target.value); setH(newH); onChange(hsvToHex(newH, s, v)); }} className="absolute top-0 left-0 w-48 h-8 origin-top-left rotate-90 translate-x-8 cursor-pointer appearance-none bg-transparent opacity-0 z-10" />
          <div className="absolute w-full h-2 border-y border-white shadow-md pointer-events-none" style={{ top: `${(h / 360) * 100}%` }} />
        </div>
      </div>
      <div className="bg-black/40 p-4 rounded-2xl border border-white/5 mb-5">
        <div className="flex items-center justify-between gap-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl border-2 border-white/20 shadow-inner" style={{ backgroundColor: color }}></div>
            <div className="text-left">
              <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isPrintMode ? 'text-accent-orange' : 'text-accent-purple'}`}>{isPrintMode ? 'Print (CMYK)' : 'Web (RGB)'}</div>
              <div className="text-white font-mono text-sm font-bold uppercase tracking-wider">{color}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] font-mono text-white/30 border-l border-white/10 pl-5">
            {isPrintMode ? (<><div>C:{cmyk.c}%</div><div>M:{cmyk.m}%</div><div>Y:{cmyk.y}%</div><div>K:{cmyk.k}%</div></>) : (<><div>R:{rgb.r}</div><div>G:{rgb.g}</div><div>B:{rgb.b}</div><div className="opacity-0">.</div></>)}
          </div>
        </div>
        <button type="button" disabled={!canAdd} onClick={() => onAdd(color)} className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${canAdd ? 'bg-white text-black hover:bg-accent-magenta hover:text-white' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}>
          {canAdd ? <><Plus size={14} /> Add to Palette</> : 'Palette Full'}
        </button>
      </div>
    </div>
  );
};

export const Order: React.FC<OrderProps> = ({ user, onLoginRequest }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const step = parseInt(searchParams.get('step') || '1', 10);
  const preSelectedServiceId = searchParams.get('service');
  const editOrderId = searchParams.get('edit');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: '',
    serviceType: preSelectedServiceId || SERVICES[0].id,
    industry: '',
    requirements: '',
    colorPalette: [] as string[],
    files: [] as File[],
    voiceClips: [] as { blob: Blob, url: string, name: string }[],
    // Dynamic Fields
    eventTitle: '',
    brandName: '',
    socialLinks: [{ platform: 'WhatsApp', handle: '' }],
    websiteUrl: '',
    audience: '',
    venue: '',
    eventDate: '',
    eventTime: '',
    recipient: '',
    subject: '',
    unitName: '',
    tutorName: '',
    year: '',
    institutes: '',
    keywords: '',
    motto: '',
    location: '',
    telephones: [''],
    books: [{ title: '', author: '' }],
    extraDetails: '',
    // Technical Specs
    dimensions: {
      width: '1080',
      height: '1080',
      unit: 'px',
      ppi: '72',
      orientation: 'square' as 'portrait' | 'landscape' | 'square',
      aspectRatio: '1:1'
    }
  });

  const [countryCode, setCountryCode] = useState('+94');
  const [phoneInput, setPhoneInput] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [customColor, setCustomColor] = useState('#ff007f');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Sync mobile when parts change
  useEffect(() => {
    setFormData(prev => ({ ...prev, mobile: `${countryCode}${phoneInput}` }));
  }, [countryCode, phoneInput]);

  // Load existing order if in Edit mode
  useEffect(() => {
    const loadOrder = async () => {
      if (editOrderId) {
        const orderToEdit = await getOrderById(editOrderId);
        if (orderToEdit) {
          setFormData(prev => ({
            ...prev,
            name: orderToEdit.clientName,
            email: orderToEdit.email,
            mobile: orderToEdit.mobile,
            serviceType: orderToEdit.serviceId || 's_social', 
            industry: orderToEdit.industry,
            requirements: orderToEdit.requirements,
            keywords: orderToEdit.keywords,
            colorPalette: orderToEdit.colorPalette,
            dimensions: orderToEdit.dimensions || prev.dimensions,
            files: [], // Files cannot be restored in edit mode in this demo version
          }));
          
          // Attempt to parse mobile number
          const mob = orderToEdit.mobile;
          if (mob.startsWith('+94')) { setCountryCode('+94'); setPhoneInput(mob.replace('+94', '')); }
          else if (mob.startsWith('+1')) { setCountryCode('+1'); setPhoneInput(mob.replace('+1', '')); }
          else if (mob.startsWith('+44')) { setCountryCode('+44'); setPhoneInput(mob.replace('+44', '')); }
          else if (mob.startsWith('+61')) { setCountryCode('+61'); setPhoneInput(mob.replace('+61', '')); }
          else if (mob.startsWith('+91')) { setCountryCode('+91'); setPhoneInput(mob.replace('+91', '')); }
          else if (mob.startsWith('+971')) { setCountryCode('+971'); setPhoneInput(mob.replace('+971', '')); }
          else { setCountryCode(''); setPhoneInput(mob); }
        }
      }
    };
    loadOrder();
  }, [editOrderId]);

  const isPrintMode = ['s_invite', 's_banner', 's_tute', 's_letterhead', 's_book', 's_businesscard'].includes(formData.serviceType);
  const selectedServiceTitle = SERVICES.find(s => s.id === formData.serviceType)?.title || 'New Project';

  useEffect(() => {
    if (user) setFormData(prev => ({ ...prev, name: user.name, email: user.email }));
  }, [user]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [step, formData.serviceType]);

  const currentPresets = SERVICE_PRESETS[formData.serviceType] || [];

  const validateStep = (currentStep: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    const hasVoice = formData.voiceClips.length > 0;

    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = 'Full Name is required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) newErrors.email = 'Email Address is required';
      else if (!emailRegex.test(formData.email)) newErrors.email = 'Enter a valid email address';
      if (!formData.mobile.trim() || formData.mobile.length < 5) newErrors.mobile = 'Phone number is required';
    }

    if (currentStep === 2) {
      const type = formData.serviceType;
      // ... same validation logic ...
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    return true;
  };

  const handleNextStep = () => validateStep(step) && changeStep(step + 1);

  const changeStep = (newStep: number) => {
    if (isExiting) return;
    setIsExiting(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('step', newStep.toString());
      setSearchParams(nextParams);
      setIsExiting(false);
    }, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalValue = value;
    // Note: mobile is handled by separate inputs now, but this is kept for other fields
    if (name === 'mobile') return; 

    if (name === 'serviceType') {
      const isPrint = ['s_invite', 's_banner', 's_tute', 's_letterhead', 's_book', 's_businesscard'].includes(value);
      setFormData(prev => ({ 
        ...prev, 
        [name]: finalValue,
        dimensions: { ...prev.dimensions, ppi: isPrint ? '300' : '72', unit: isPrint ? 'mm' : 'px' }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: finalValue }));
    }
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  const handleDimensionChange = (field: string, value: string) => {
    setFormData(prev => {
      const newDims = { ...prev.dimensions, [field]: value };
      if (field === 'width' || field === 'height') {
        const w = parseFloat(newDims.width) || 0;
        const h = parseFloat(newDims.height) || 0;
        if (w > h) newDims.orientation = 'landscape';
        else if (h > w) newDims.orientation = 'portrait';
        else newDims.orientation = 'square';
        const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
        const common = gcd(Math.round(w), Math.round(h));
        newDims.aspectRatio = common > 0 ? `${Math.round(w/common)}:${Math.round(h/common)}` : 'Custom';
      }
      return { ...prev, dimensions: newDims };
    });
  };

  const applyPreset = (presetId: string) => {
    const p = currentPresets.find(x => x.id === presetId);
    if (p) {
      const w = parseFloat(p.width);
      const h = parseFloat(p.height);
      setFormData(prev => ({
        ...prev,
        dimensions: { ...prev.dimensions, width: p.width, height: p.height, unit: p.unit, ppi: p.ppi, orientation: w > h ? 'landscape' : h > w ? 'portrait' : 'square', aspectRatio: `${p.width}:${p.height}` }
      }));
    }
  };

  const toggleOrientation = () => {
    setFormData(prev => {
      const { width, height, orientation } = prev.dimensions;
      return { ...prev, dimensions: { ...prev.dimensions, width: height, height: width, orientation: orientation === 'portrait' ? 'landscape' : 'portrait' } };
    });
  };

  const updateList = (field: 'socialLinks' | 'telephones' | 'books', index: number, subField: string, value: string) => {
    setFormData(prev => {
      const list = [...(prev[field] as any[])];
      let finalValue = value;
      if (field === 'telephones') finalValue = value.replace(/[^0-9]/g, '');
      if (typeof list[index] === 'object') list[index] = { ...list[index], [subField]: finalValue };
      else list[index] = finalValue;
      return { ...prev, [field]: list };
    });
  };

  const addItem = (field: 'socialLinks' | 'telephones' | 'books', template: any) => { setFormData(prev => ({ ...prev, [field]: [...(prev[field] as any[]), template] })); };
  const removeItem = (field: 'socialLinks' | 'telephones' | 'books', index: number) => { setFormData(prev => ({ ...prev, [field]: (prev[field] as any[]).filter((_, i) => i !== index) })); };
  const removeVoiceClip = (index: number) => {
    setFormData(prev => {
      const clip = prev.voiceClips[index];
      if (clip && clip.url) URL.revokeObjectURL(clip.url);
      return { ...prev, voiceClips: prev.voiceClips.filter((_, i) => i !== index) };
    });
  };

  // NEW FUNCTION TO REMOVE FILE
  const removeFile = (index: number) => {
    setFormData(prev => ({
        ...prev,
        files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setFormData(prev => ({ ...prev, voiceClips: [...prev.voiceClips, { blob, url, name: `Voice Note ${prev.voiceClips.length + 1}` }] }));
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) { alert('Microphone access denied.'); }
  };

  const stopRecording = () => { if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); setIsRecording(false); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) { handleNextStep(); return; }
    if (isSubmitting || !user) { if (!user) onLoginRequest(); return; }
    setIsSubmitting(true);
    try {
      const service = SERVICES.find(s => s.id === formData.serviceType);
      
      const orderId = editOrderId || generateOrderId();
      
      // Upload Assets to Firebase Storage with strict folder structure for Clients
      // RULES: /{userId}/{allPaths=**} requires user to be owner
      const processedFiles = await Promise.all(formData.files.map(async (f) => {
        try {
            // UPDATED PATH: {userId}/uploads/{orderId}/client_uploads/{filename}
            const path = `${user.id}/uploads/${orderId}/client_uploads/${f.name}`;
            const url = await uploadFile(f, path);
            return { name: f.name, type: f.type, data: url };
        } catch (err) {
            console.error(`Failed to upload file ${f.name}:`, err);
            return null;
        }
      }));

      // Filter out failed uploads
      const validFiles = processedFiles.filter(f => f !== null) as { name: string; type: string; data: string }[];

      // Upload Voice Notes to Firebase Storage
      const processedVoiceClips = await Promise.all(formData.voiceClips.map(async (v) => {
        try {
            // UPDATED PATH: {userId}/uploads/{orderId}/client_uploads/voice_notes/{filename}
            const path = `${user.id}/uploads/${orderId}/client_uploads/voice_notes/${v.name}.webm`;
            const url = await uploadFile(v.blob, path);
            return { name: v.name, type: 'audio/webm', data: url };
        } catch (err) {
            console.error("Voice note upload failed:", err);
            return null;
        }
      }));
      
      const validVoiceClips = processedVoiceClips.filter(v => v !== null) as { name: string; type: string; data: string }[];

      // Capture dynamic fields based on non-empty values
      const customFields: Record<string, any> = {};
      const addIf = (key: string, val: any) => {
        if (!val) return;
        if (Array.isArray(val) && val.length === 0) return;
        if (Array.isArray(val) && typeof val[0] === 'object' && !val[0].handle && !val[0].title) return;
        customFields[key] = val;
      };

      addIf('Event Title', formData.eventTitle);
      addIf('Brand Name', formData.brandName);
      if(formData.socialLinks.some(l => l.handle)) customFields['Social Media'] = formData.socialLinks.filter(l => l.handle);
      addIf('Website', formData.websiteUrl);
      addIf('Target Audience', formData.audience); 
      addIf('Venue', formData.venue);
      addIf('Event Date', formData.eventDate);
      addIf('Event Time', formData.eventTime);
      addIf('Recipient', formData.recipient);
      addIf('Subject', formData.subject);
      addIf('Unit Name', formData.unitName);
      addIf('Tutor Name', formData.tutorName);
      addIf('Year', formData.year);
      addIf('Institutes', formData.institutes);
      addIf('Motto', formData.motto);
      addIf('Location', formData.location);
      if(formData.telephones.some(t => t)) customFields['Contact Numbers'] = formData.telephones.filter(t => t);
      if(formData.books.some(b => b.title)) customFields['Books'] = formData.books.filter(b => b.title);
      addIf('Extra Details', formData.extraDetails);

      const orderPayload = {
        clientId: user.id,
        clientName: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        serviceType: service?.title || 'Custom',
        serviceId: formData.serviceType,
        industry: formData.industry || 'Design',
        targetAudience: formData.audience || 'General',
        requirements: formData.requirements || formData.extraDetails || 'See details in summary',
        competitors: '',
        keywords: formData.keywords,
        avoid: '',
        colorPalette: formData.colorPalette,
        files: validFiles,      // Now stores Storage URLs
        voiceClips: validVoiceClips, // Now stores Storage URLs
        status: OrderStatus.PENDING,
        estimatedCompletion: '3-5 Days',
        createdAt: new Date().toISOString(),
        price: service?.price || 0,
        dimensions: formData.dimensions,
        customFields: customFields, // Save the dynamic fields
      };

      if (editOrderId) {
         const updatedOrder = { ...orderPayload, id: editOrderId };
         await updateOrder(updatedOrder);
         navigate(`/tracking?id=${editOrderId}`);
      } else {
         const newOrder = { ...orderPayload, id: orderId };
         await saveOrder(newOrder);
         await sendConfirmationEmail(newOrder);
         navigate(`/tracking?id=${newOrder.id}`);
      }
    } catch (e: any) { 
        console.error(e);
        alert(`Submission failed: ${e.message || "Error saving data."}`); 
    } finally { setIsSubmitting(false); }
  };

  const renderDynamicForm = () => {
    const type = formData.serviceType;
    const inputClass = (errKey: string) => `w-full bg-black/40 border rounded-2xl px-6 py-4 text-white placeholder:text-white/20 outline-none transition-all ${errors[errKey] ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] bg-red-500/5' : 'border-white/10 focus:border-accent-purple'}`;
    const ErrorMsg = ({ name }: { name: string }) => errors[name] ? <div className="text-red-500 text-[10px] font-bold mt-1.5 flex items-center gap-1.5"><AlertCircle size={10} /> {errors[name]}</div> : null;
    
    if (['s_social', 's_banner', 's_flyer'].includes(type)) {
      return (
        <div className="space-y-6">
          <div><input name="eventTitle" value={formData.eventTitle} onChange={handleInputChange} placeholder="Name of the Event *" className={inputClass('eventTitle')} /><ErrorMsg name="eventTitle" /></div>
          <div><textarea name="requirements" rows={3} value={formData.requirements} onChange={handleInputChange} placeholder="Details of the event (What is happening?) *" className={inputClass('requirements')}></textarea><ErrorMsg name="requirements" /></div>
          <div><input name="brandName" value={formData.brandName} onChange={handleInputChange} placeholder="Brand or Company Name *" className={inputClass('brandName')} /><ErrorMsg name="brandName" /></div>
           <div className="space-y-3">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Social Media Links</label>
            {formData.socialLinks.map((link, i) => (
              <div key={i} className="flex gap-3"><select value={link.platform} onChange={(e) => updateList('socialLinks', i, 'platform', e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-xs outline-none"><option>WhatsApp</option><option>Facebook</option><option>Instagram</option><option>TikTok</option><option>LinkedIn</option></select><input value={link.handle} onChange={(e) => updateList('socialLinks', i, 'handle', e.target.value)} placeholder="@handle" className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-xs" />{formData.socialLinks.length > 1 && <button type="button" onClick={() => removeItem('socialLinks', i)} className="text-white/20 hover:text-red-500"><MinusCircle size={20} /></button>}</div>
            ))}
            <button type="button" onClick={() => addItem('socialLinks', { platform: 'WhatsApp', handle: '' })} className="flex items-center gap-2 text-[10px] text-accent-purple font-black uppercase tracking-widest hover:text-white"><PlusCircle size={16} /> Add Another</button>
          </div>
          <input name="websiteUrl" value={formData.websiteUrl} onChange={handleInputChange} placeholder="Website Link (Optional)" className={inputClass('websiteUrl')} />
          <input name="audience" value={formData.audience} onChange={handleInputChange} placeholder="Audience Targeting (Optional)" className={inputClass('audience')} />
          <textarea name="extraDetails" rows={2} value={formData.extraDetails} onChange={handleInputChange} placeholder="Common problems or other things to mention (Optional)" className={inputClass('extraDetails')}></textarea>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <input name="industry" value={formData.industry} onChange={handleInputChange} placeholder="Industry (e.g. Music, Tech)" className={inputClass('industry')} />
        <textarea name="requirements" rows={6} value={formData.requirements} onChange={handleInputChange} placeholder="Describe your vision here..." className={inputClass('requirements')}></textarea>
      </div>
    );
  };

  const getStepClasses = (s: number) => `flex-1 ${step !== s ? 'hidden' : isExiting ? 'opacity-0 -translate-y-4' : 'animate-fade-in'}`;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-7xl mx-auto">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center gap-3 text-white/70 hover:text-white transition-all bg-white/5 border border-white/10 px-5 py-2.5 rounded-full"><HomeIcon size={18} /><span className="text-xs font-black uppercase tracking-widest">Back to Home</span></Link>
      </div>
      <div className="mb-10 text-center"><h1 className="text-5xl md:text-7xl font-display text-white mb-4 uppercase tracking-tighter leading-none">{editOrderId ? 'Edit Project' : selectedServiceTitle}</h1><p className="text-text-muted font-light text-lg">{editOrderId ? 'Update your requirements' : 'Just 4 simple steps to bring your idea to life.'}</p></div>

      <div className="glass-effect rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row min-h-[650px] border border-white/10">
        <div className="hidden md:flex flex-col w-64 bg-black/60 border-r border-white/5 p-10">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`flex items-center gap-4 mb-10 transition-all ${step === s ? 'text-accent-magenta' : step > s ? 'text-white' : 'text-white/20'}`}>
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-sm ${step === s ? 'border-accent-magenta text-accent-magenta' : step > s ? 'border-white bg-white/10' : 'border-white/10'}`}>{step > s ? <Check size={18} strokeWidth={3} /> : s}</div>
              <span className="font-black text-[10px] tracking-widest uppercase">{s === 1 ? 'Basic Info' : s === 2 ? 'Details' : s === 3 ? 'Style' : 'Finish'}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 p-8 md:p-14 relative bg-transparent overflow-y-auto">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            
            {/* STEP 1: BASIC INFO */}
            <div className={getStepClasses(1)}>
              <h3 className="text-3xl font-display text-white mb-8 uppercase tracking-tight border-b border-white/5 pb-4">Basic Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2"><label className="block text-[10px] font-black text-accent-magenta mb-3 uppercase tracking-widest">Service</label><select name="serviceType" value={formData.serviceType} onChange={handleInputChange} disabled={!!editOrderId} className={`w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold cursor-pointer ${editOrderId ? 'opacity-50 cursor-not-allowed' : ''}`}>{SERVICES.map(s => <option key={s.id} value={s.id} className="bg-neutral-900">{s.title} — ${s.price}</option>)}</select></div>
                <div><input name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name *" className={`w-full bg-black/40 border rounded-2xl px-6 py-4 text-white placeholder:text-white/20 ${errors.name ? 'border-red-500 bg-red-500/5' : 'border-white/10'}`} />{errors.name && <div className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.name}</div>}</div>
                <div>
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">WhatsApp Number *</label>
                    <div className="flex gap-2">
                        <select 
                            value={countryCode} 
                            onChange={e => setCountryCode(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-white outline-none focus:border-accent-purple appearance-none text-center min-w-[80px]"
                        >
                            <option value="+94">🇱🇰 +94</option>
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+44">🇬🇧 +44</option>
                            <option value="+61">🇦🇺 +61</option>
                            <option value="+91">🇮🇳 +91</option>
                            <option value="+971">🇦🇪 +971</option>
                            <option value="">Other</option>
                        </select>
                        <input 
                            type="tel" 
                            value={phoneInput} 
                            onChange={e => setPhoneInput(e.target.value.replace(/[^0-9]/g, ''))} 
                            placeholder="77 123 4567" 
                            className={`flex-1 bg-black/40 border rounded-2xl px-6 py-4 text-white placeholder:text-white/20 ${errors.mobile ? 'border-red-500 bg-red-500/5' : 'border-white/10'} outline-none focus:border-accent-purple transition-all`} 
                        />
                    </div>
                    {errors.mobile && <div className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.mobile}</div>}
                </div>
                <div className="md:col-span-2"><input name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address *" className={`w-full bg-black/40 border rounded-2xl px-6 py-4 text-white placeholder:text-white/20 ${errors.email ? 'border-red-500 bg-red-500/5' : 'border-white/10'}`} />{errors.email && <div className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.email}</div>}</div>
              </div>
            </div>

            {/* STEP 2: PROJECT DETAILS */}
            <div className={getStepClasses(2)}>
              <h3 className="text-3xl font-display text-white mb-8 uppercase tracking-tight border-b border-white/5 pb-4">Project Details</h3>
              <div className="space-y-10">
                {renderDynamicForm()}
                <div className="pt-8 border-t border-white/5"><label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 block">Can't describe it in text? Use voice:</label><div className="flex items-center gap-4"><button type="button" onClick={isRecording ? stopRecording : startRecording} className={`flex items-center gap-3 px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${isRecording ? 'bg-accent-magenta text-white animate-pulse' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}>{isRecording ? <><Square size={14} fill="white" /> Stop Recording</> : <><Mic size={14} /> Record Voice</>}</button>{isRecording && <span className="text-accent-magenta text-xs font-bold animate-pulse">Recording...</span>}</div></div>
                {formData.voiceClips.length > 0 && <div className="space-y-3"><label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Voice Notes</label>{formData.voiceClips.map((clip, i) => (<div key={i} className="flex items-center justify-between bg-black/40 border border-white/10 p-3 rounded-2xl"><div className="flex items-center gap-3"><Play size={14} className="text-accent-purple" /><span className="text-xs font-bold text-white/80">{clip.name}</span></div><div className="flex items-center gap-4"><audio src={clip.url} controls className="h-8 max-w-[150px] opacity-60" /><button type="button" onClick={() => removeVoiceClip(i)} className="text-white/20 hover:text-red-500"><Trash2 size={16} /></button></div></div>))}</div>}
              </div>
            </div>

            {/* STEP 3: STYLE & COLORS */}
            <div className={getStepClasses(3)}>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="text-3xl font-display text-white uppercase tracking-tight">Dimension & Layout</h3>
                    <div className="text-[9px] font-black text-accent-magenta bg-accent-magenta/10 px-3 py-1 rounded-full uppercase tracking-widest border border-accent-magenta/20">{selectedServiceTitle} Mode</div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2"><Maximize size={12} className="text-accent-purple" /> Professional Presets</label>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {currentPresets.map(p => {
                        const Icon = p.icon;
                        const isSelected = formData.dimensions.width === p.width && formData.dimensions.height === p.height;
                        return (
                          <button key={p.id} type="button" onClick={() => applyPreset(p.id)} className={`p-4 rounded-2xl text-left transition-all border group relative overflow-hidden ${isSelected ? 'bg-accent-purple/10 border-accent-purple' : 'bg-black/40 border-white/5 hover:border-white/20'}`}>
                            <div className="flex items-center justify-between mb-3"><Icon size={18} className={isSelected ? 'text-accent-purple' : 'text-white/20 group-hover:text-white/40'} />{isSelected && <Check size={14} className="text-accent-purple" />}</div>
                            <div className={`text-[11px] font-black uppercase tracking-wider mb-1 ${isSelected ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{p.name}</div>
                            <div className="text-[10px] font-mono text-white/20 group-hover:text-white/30">{p.width}x{p.height}{p.unit} @ {p.ppi}ppi</div>
                          </button>
                        );
                      })}
                      {currentPresets.length === 0 && <div className="col-span-full py-8 text-center bg-black/20 border border-dashed border-white/5 rounded-2xl"><p className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic">Manual setup required for this mode</p></div>}
                    </div>
                  </div>

                  <div className="bg-black/40 rounded-3xl p-8 border border-white/5 space-y-8 shadow-inner">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="space-y-2"><label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Width</label><input type="number" value={formData.dimensions.width} onChange={(e) => handleDimensionChange('width', e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-white font-mono text-sm focus:border-accent-purple outline-none transition-all shadow-lg" /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Height</label><input type="number" value={formData.dimensions.height} onChange={(e) => handleDimensionChange('height', e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-white font-mono text-sm focus:border-accent-purple outline-none transition-all shadow-lg" /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Unit</label><select value={formData.dimensions.unit} onChange={(e) => handleDimensionChange('unit', e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-4 text-white text-xs outline-none focus:border-accent-purple cursor-pointer"><option value="px">Pixels (px)</option><option value="in">Inches (in)</option><option value="mm">Millimeters (mm)</option><option value="cm">Centimeters (cm)</option><option value="m">Meters (m)</option><option value="pt">Points (pt)</option><option value="pc">Picas (pc)</option><option value="ft">Feet (ft)</option><option value="yd">Yards (yd)</option></select></div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-8 pt-8 border-t border-white/5">
                      <div className="flex items-center gap-10">
                        <div className="space-y-3"><label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Orientation</label><div className="flex bg-black/60 rounded-xl p-1.5 border border-white/10"><button type="button" onClick={toggleOrientation} className={`p-3 rounded-lg transition-all flex items-center justify-center gap-2 ${formData.dimensions.orientation === 'portrait' ? 'bg-accent-purple text-white shadow-[0_0_15px_rgba(213,0,249,0.3)]' : 'text-white/20 hover:text-white'}`}><div className="w-3 h-4 border-2 border-current rounded-sm"></div></button><button type="button" onClick={toggleOrientation} className={`p-3 rounded-lg transition-all flex items-center justify-center gap-2 ${formData.dimensions.orientation === 'landscape' ? 'bg-accent-purple text-white shadow-[0_0_15px_rgba(213,0,249,0.3)]' : 'text-white/20 hover:text-white'}`}><div className="w-4 h-3 border-2 border-current rounded-sm"></div></button></div></div>
                        <div className="space-y-3"><label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Resolution (PPI)</label><select value={formData.dimensions.ppi} onChange={(e) => handleDimensionChange('ppi', e.target.value)} className="bg-black/60 border border-white/10 rounded-xl px-5 py-3 text-white text-xs outline-none block focus:border-accent-purple cursor-pointer h-full"><option value="72">72 (Screen / Web)</option><option value="150">150 (Digital Print)</option><option value="300">300 (Offset Print)</option></select></div>
                      </div>
                      <div className="text-right flex flex-col items-end"><label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Scale Ratio</label><div className="text-accent-magenta font-mono text-3xl font-black drop-shadow-lg">{formData.dimensions.aspectRatio}</div><div className="text-[9px] text-white/20 font-bold uppercase mt-1">calculated scale</div></div>
                    </div>
                  </div>

                  <div><label className="text-[10px] font-black text-white/40 mb-3 block uppercase tracking-widest">Style Keywords</label><input name="keywords" value={formData.keywords} onChange={handleInputChange} placeholder="Modern, Bold, Minimalist, Luxury..." className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-accent-purple transition-all" /></div>
                </div>

                <div className="space-y-8">
                  <h3 className="text-3xl font-display text-white mb-6 uppercase tracking-tight border-b border-white/5 pb-4">Style & Colors</h3>
                  <div className="flex flex-col items-center xl:items-start gap-10">
                    <PhotoshopColorPicker color={customColor} onChange={setCustomColor} onAdd={(c) => formData.colorPalette.length < 5 && !formData.colorPalette.includes(c) && setFormData(p => ({ ...p, colorPalette: [...p.colorPalette, c] }))} isPrintMode={isPrintMode} canAdd={formData.colorPalette.length < 5} />
                    <div className="w-full max-w-sm"><label className="text-[10px] font-black text-white/40 mb-5 block uppercase tracking-widest flex items-center justify-between">Chosen Palette <span className="text-[9px] font-mono text-white/20">{formData.colorPalette.length}/5 Colors</span></label><div className="flex flex-wrap gap-4">{formData.colorPalette.length === 0 && <div className="w-full py-4 text-center border border-dashed border-white/10 rounded-2xl"><span className="text-[10px] text-white/10 uppercase font-black italic tracking-widest">Add colors from picker above</span></div>}{formData.colorPalette.map(c => (<div key={c} className="flex items-center gap-3 bg-white/5 rounded-full px-5 py-2.5 border border-white/10 group animate-fade-in hover:border-white/30 transition-all shadow-lg"><div className="w-4 h-4 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]" style={{ backgroundColor: c }}></div><span className="text-[10px] font-mono font-black uppercase text-white/80">{c}</span><button type="button" onClick={() => setFormData(prev => ({ ...prev, colorPalette: prev.colorPalette.filter(x => x !== c) }))} className="text-white/20 hover:text-red-500 transition-colors ml-2"><X size={14} /></button></div>))}</div></div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 4: UPLOAD & FINISH */}
            <div className={getStepClasses(4)}>
              <h3 className="text-3xl font-display text-white mb-8 uppercase tracking-tight border-b border-white/5 pb-4">Upload Assets</h3>
              <div className="space-y-8">
                <div className="border-2 border-dashed border-white/10 rounded-[2.5rem] p-12 text-center hover:bg-white/5 transition-all relative group cursor-pointer"><input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={(e) => e.target.files?.length && setFormData(p => ({ ...p, files: [...p.files, ...Array.from(e.target.files!)] }))} /><Upload className="mx-auto mb-4 text-accent-magenta" size={40} /><p className="text-lg font-bold uppercase tracking-widest text-white/80 group-hover:text-white">Choose Photos or Logos</p></div>
                {formData.files.length > 0 && <div className="flex gap-2 flex-wrap">{formData.files.map((f, i) => (
                    <div key={i} className="text-[9px] font-bold bg-white/5 border border-white/5 pl-4 pr-2 py-2 rounded-full text-white/40 flex items-center gap-2 group hover:bg-red-500/10 hover:text-red-400 transition-colors">
                        <Check size={10} className="text-accent-green group-hover:hidden" />
                        <Trash2 size={10} className="hidden group-hover:block" />
                        {f.name}
                        <button type="button" onClick={() => removeFile(i)} className="p-1 hover:text-white rounded-full hover:bg-white/10 transition-colors"><X size={12} /></button>
                    </div>
                ))}</div>}
                <div className="bg-black/60 p-8 rounded-[2rem] border border-white/5 backdrop-blur-md"><div className="text-accent-magenta font-black text-[10px] uppercase mb-4 tracking-widest flex items-center gap-2"><ShieldCheck size={14} /> Ready to start</div><div className="grid grid-cols-2 gap-8 text-xs"><div><p className="text-white/20 uppercase text-[9px] mb-2 font-black">Project Type</p><p className="text-white font-bold">{selectedServiceTitle}</p></div><div><p className="text-white/20 uppercase text-[9px] mb-2 font-black">Color Mode</p><p className="text-white font-bold">{isPrintMode ? 'Print Ready (CMYK)' : 'Web (RGB)'}</p></div></div></div>
              </div>
            </div>

            <div className="mt-auto flex justify-between items-center pt-10 border-t border-white/5 sticky bottom-0 bg-transparent pb-4">
               {step > 1 ? <button type="button" onClick={() => changeStep(step - 1)} className="text-white/30 hover:text-white uppercase text-[10px] font-black tracking-widest flex items-center gap-3"><ArrowLeft size={16} /> Go Back</button> : <div />}
               {step < 4 ? <button type="button" onClick={handleNextStep} className="bg-white text-black px-12 py-5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-accent-magenta hover:text-white transition-all shadow-xl">Continue</button> : 
               <button type="submit" disabled={isSubmitting} className="bg-accent-magenta text-white px-14 py-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2">
                 {isSubmitting && <Loader size={14} className="animate-spin" />}
                 {isSubmitting ? 'Processing...' : editOrderId ? 'Update Order' : 'Submit Order'}
               </button>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};