import { DropdownItem } from "./avaliacao";

type Especialista = { id: number; nome: string; sobrenome: string };

type EspecialistaBreve = {
  id: number;
  nome: string;
  sobrenome: string;
  registro_profissional: string;
};

type EspecialistaCompleto = {
  id: string | number;
  email: string;
  nome: string;
  sobrenome: string;
  registro_profissional: string;
  especialidade_id: number;
};

type PerfilCompleto = {
  id: number;
  email: string;
  nome: string;
  sobrenome: string;
  registro_profissional: string;
  ESPECIALIDADES: DropdownItem | null;
};

export {
  Especialista,
  EspecialistaBreve,
  EspecialistaCompleto,
  PerfilCompleto,
};
