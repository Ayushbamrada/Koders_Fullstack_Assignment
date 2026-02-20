export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  token?: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: User | string;
  createdBy: User | string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  refreshToken: string;
}

export interface ApiError {
  message: string;
  errors?: Array<{ msg: string }>;
}