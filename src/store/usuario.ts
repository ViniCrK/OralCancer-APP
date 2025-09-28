import { create } from "zustand";

type Usuario = {
  id: string | number;
  email: string;
  nome: string;
  sobrenome: string;
  registro_profissional: string;
  especialidade_id: number;
};

type UsuarioStore = {
  usuario: Usuario | null;
  setUsuario: (usuario: Usuario) => void;
};

export const useUsuarioStore = create<UsuarioStore>((set) => ({
  usuario: null,
  setUsuario: (usuario) => set({ usuario }),
}));
