export enum OrderStatus {
  PENDING = 'Pending',
  REVIEWING = 'Reviewing',
  IN_PROGRESS = 'In Progress',
  DRAFT_SENT = 'Draft Sent',
  REVISION = 'Revision',
  WAITING_PAYMENT = 'Waiting Payment',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export interface Order {
  id: string; // The unique tracking code
  clientId: string;
  clientName: string;
  email: string;
  mobile: string;
  serviceType: string;
  serviceId?: string; 
  
  industry: string;
  targetAudience: string;
  requirements: string;
  competitors: string;
  keywords: string;
  avoid: string;
  
  dimensions?: {
    width: string;
    height: string;
    unit: string;
    ppi: string;
    orientation: 'portrait' | 'landscape' | 'square';
    aspectRatio: string;
  };

  colorPalette: string[];
  
  files: { name: string; type: string; data: string }[]; 
  voiceClips: { name: string; type: string; data: string }[];
  
  draftImg?: string; 
  draftMessage?: string;
  finalUrl?: string; 
  finalFiles?: { name: string; type: string; data: string }[]; 
  
  revisionNotes?: string;
  revisionFiles?: string[];

  status: OrderStatus;
  estimatedCompletion: string;
  createdAt: string;
  price: number;
  isDeletedByAdmin?: boolean; // New: Tracks if admin has "deleted" (archived) the order
  
  customFields?: { [key: string]: any }; // Flexible storage for service-specific inputs
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  features: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: 'google' | 'apple' | 'facebook' | 'guest' | 'email';
}