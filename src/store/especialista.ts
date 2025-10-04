import { create } from "zustand";

type Especialista = {
  id: string | number;
  email: string;
  nome: string;
  sobrenome: string;
  registro_profissional: string;
  especialidade_id: number;
};

type EspecialistaStore = {
  especialista: Especialista | null;
  setEspecialista: (espec: Especialista) => void;
};

export const useEspecialistaStore = create<EspecialistaStore>((set) => ({
  especialista: null,
  setEspecialista: (novoEspecialista) =>
    set({ especialista: novoEspecialista }),
}));
