export interface User {
  id: string;
  nome: string;
  email: string;
  fotoPerfil?: string;
  nomeLoja: string;
  cnpj?: string;
  cpf?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUserProfile: (user: Partial<User>) => void;
}
