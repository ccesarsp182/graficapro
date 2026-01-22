
export enum OrderStatus {
  PENDING = 'Pendente',
  IN_PROCESS = 'Em Processo',
  DELIVERED = 'Entregue'
}

export enum BudgetStatus {
  WAITING = 'Aguardando',
  APPROVED = 'Aprovado',
  EXPIRED = 'Expirado'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  provider?: 'email' | 'google';
  avatar?: string;
}

export interface Attachment {
  name: string;
  data: string;
  type: string;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  unit: string;
}

export interface Designer {
  id: string;
  name: string;
  specialty: string;
  email: string;
  status: 'Ativo' | 'Inativo';
}

export interface Budget {
  id: string;
  date: string;
  clientName: string;
  email: string;
  phone: string;
  materialType: string;
  measurements: string;
  quantity: number;
  totalValue: number;
  status: BudgetStatus;
  deliveryDeadline: string;
  validUntil: string;
  notes: string;
}

export interface Order {
  id: string;
  date: string;
  clientName: string;
  phone: string;
  materialType: string;
  measurements: string;
  quantity: number;
  color: string;
  additionalInfo: string;
  entryValue: number;
  remainingValue: number;
  status: OrderStatus;
  designerId?: string;
  attachments?: Attachment[]; 
  archived?: boolean;
}

export interface DashboardStats {
  totalOrders: number;
  pendingCount: number;
  inProcessCount: number;
  deliveredCount: number;
  totalRevenue: number;
  pendingBudgets: number;
}
