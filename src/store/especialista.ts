import { EspecialistaCompleto } from "@/types/especialista";
import { create } from "zustand";

type EspecialistaStore = {
  especialista: EspecialistaCompleto | null;
  setEspecialista: (espec: EspecialistaCompleto) => void;
};

export const useEspecialistaStore = create<EspecialistaStore>((set) => ({
  especialista: null,
  setEspecialista: (novoEspecialista) =>
    set({ especialista: novoEspecialista }),
}));
