import { Especialista } from "./especialista";
import { Paciente } from "./paciente";

type Avaliacao = { PACIENTES: Paciente | null };

type AvaliacaoCompleta = {
  id: number;
  queixa_principal: string;
  tamanho_aproximado: number;
  tempo_evolucao: number;
  carga_tabagica_etilica: number;
  historico_familiar_cancer: boolean;
  observacoes: string | null;
  rascunho: boolean;
  created_at: string;
  HABITOS: DropdownItem | null;
  LOCALIZACOES_INTRAORAIS: DropdownItem | null;
  ASPECTOS_LESAO: DropdownItem | null;
  SUPERFICIES: DropdownItem | null;
  SINTOMAS: DropdownItem | null;
  BORDAS: DropdownItem | null;
  LINFONODOS: DropdownItem | null;
  CLASSIFICACOES_RISCO: DropdownItem | null;
  CONDUTAS: DropdownItem | null;
  AREAS_ENCAMINHAMENTO: DropdownItem | null;
  ESPECIALISTAS: Especialista | null;
  PACIENTES: Paciente | null;
};

type AvaliacaoBreve = {
  id: number;
  observacoes: string | null;
  created_at: string;
  PACIENTES: Paciente | null;
  ESPECIALISTAS: Especialista | null;
};

type AvaliacaoClassificacaoRisco = {
  id: number;
  CLASSIFICACOES_RISCO: DropdownItem | null;
};

type DropdownItem = { id: number; nome: string };

export {
  Avaliacao,
  AvaliacaoBreve,
  AvaliacaoClassificacaoRisco,
  AvaliacaoCompleta,
  DropdownItem,
};
