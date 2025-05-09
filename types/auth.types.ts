export interface LoginCredentials {
  Email: string;
  Password: string;
}

export interface RegisterData {
  Name: string;
  Email: string;
  Password: string;
  Birth_Date: string;
  User_Type: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  userType: string;
} 