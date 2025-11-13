import { DropdownItem } from "./avaliacao";

type Especialista = {
  id: number;
  nome: string;
  sobrenome: string;
  ESPECIALIDADES: DropdownItem | null;
};

type EspecialistaBreve = {
  id: number;
  nome: string;
  sobrenome: string;
  registro_profissional: string;
};

type EspecialistaCompleto = {
  id: number;
  email: string;
  nome: string;
  sobrenome: string;
  registro_profissional: string;
  especialidade_id: number;
};

type DadosPerfil = {
  nome: string;
  sobrenome: string;
  registro_profissional: string;
  especialidade_id: number | null;
};

type AlterarEmailDados = {
  novoEmail: string;
  confirmarEmail: string;
};

type AlterarSenhaDados = {
  novaSenha: string;
  confirmarSenha: string;
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
  DadosPerfil,
  AlterarEmailDados,
  AlterarSenhaDados,
  PerfilCompleto,
};
