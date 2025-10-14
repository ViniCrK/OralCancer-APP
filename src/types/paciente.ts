import { DropdownItem } from "./avaliacao";

type Paciente = { id: number; nome: string; sobrenome: string };

type PacienteCompleto = {
  id: number;
  nome: string;
  sobrenome: string;
  data_nascimento: string;
  registro_hospitalar: string;
  SEXOS: DropdownItem | null;
};

export { Paciente, PacienteCompleto };
