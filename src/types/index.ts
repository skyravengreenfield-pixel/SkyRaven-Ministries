export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'supporter';
  createdAt: string;
}

export interface Donation {
  id: string;
  amount: number;
  donorName: string;
  donorEmail: string;
  message?: string;
  date: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  addedBy?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}
