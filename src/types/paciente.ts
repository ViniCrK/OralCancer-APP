import { AvaliacaoSimples, DropdownItem } from "./avaliacao";

type Paciente = { id: number; nome: string; sobrenome: string };

type PacienteItem = {
  id: number;
  nome: string;
  sobrenome: string;
  registro_hospitalar: string;
  data_nascimento: string;
};

type PacienteCompleto = {
  id: number;
  nome: string;
  sobrenome: string;
  data_nascimento: string;
  registro_hospitalar: string;
  SEXOS: DropdownItem | null;
  AVALIACOES: AvaliacaoSimples[] | null;
};

export { Paciente, PacienteItem, PacienteCompleto };
