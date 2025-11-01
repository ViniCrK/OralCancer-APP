import { AvaliacaoSimples, DropdownItem } from "./avaliacao";

type Paciente = { id: number; nome: string; sobrenome: string };

type PacienteDados = {
  nome: string;
  sobrenome: string;
  data_nascimento: Date;
  sexo_id: number | null;
  registro_hospitalar: string;
};

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

export { Paciente, PacienteDados, PacienteItem, PacienteCompleto };
