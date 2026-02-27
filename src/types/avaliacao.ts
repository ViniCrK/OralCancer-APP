import { Especialista } from "./especialista";
import { Paciente, PacienteDados } from "./paciente";

type Estadiamento = {
  id: number;
  avaliacao_id: number;
  especialista_id: string;
  tnm_clinico: string | null;
  tnm_patologico: string | null;
  observacoes: string | null;
  ESPECIALISTAS?: { nome: string; sobrenome: string }; // Para saber quem preencheu
};

type Avaliacao = { PACIENTES: Paciente | null };

type AvaliacaoSimples = { id: number; rascunho: boolean; created_at: string };

type AvaliacaoCompleta = {
  id: number;
  queixa_principal: string;
  tamanho_aproximado: number;
  tempo_evolucao: number;
  habito_tabagismo_id?: number | null;
  HABITO_TABAGISMO?: DropdownItem | null; // Objeto retornado pelo relacionamento (Alias)
  carga_tabagica?: number | null;
  habito_etilismo_id?: number | null;
  HABITO_ETILISMO?: DropdownItem | null; // Objeto retornado pelo relacionamento (Alias)
  carga_etilica?: number | null;
  historico_familiar_cancer: boolean;
  observacoes: string | null;
  rascunho: boolean;
  created_at: string;
  HABITOS?: DropdownItem | null;
  LOCALIZACOES_INTRAORAIS: DropdownItem | null;
  ASPECTOS_LESAO: DropdownItem | null;
  SUPERFICIES: DropdownItem | null;
  SINTOMAS: DropdownItem | null;
  BORDAS: DropdownItem | null;
  LINFONODOS: DropdownItem | null;
  CLASSIFICACOES_RISCO: DropdownItem | null;
  CONDUTAS: DropdownItem | null;
  ESPECIALISTAS: Especialista | null;
  PACIENTES: Paciente | null;
  AVALIACAO_IMAGENS_URL: ImagemUrl[] | null;
  AVALIACAO_FATORES_RISCO: RelacaoFatorRisco[] | null;
  AVALIACAO_METASTASES: RelacaoMetastase[] | null;
  ESTADIAMENTOS?: Estadiamento | null;
};

type AvaliacaoBreve = {
  id: number;
  observacoes: string | null;
  created_at: string;
  PACIENTES: PacienteDados | null;
  ESPECIALISTAS: Especialista | null;
  CLASSIFICACOES_RISCO: DropdownItem | null;
};

type AvaliacaoClassificacaoRisco = {
  id: number;
  CLASSIFICACOES_RISCO: DropdownItem | null;
};

type DropdownItem = { id: number; nome: string };

type ImagemUrl = { id: number; url: string };

type FatorRisco = { id: number; nome: string };

type RelacaoFatorRisco = { FATORES_RISCO: FatorRisco | null };

type Metastase = { id: number; nome: string };

type RelacaoMetastase = { METASTASES: Metastase | null };

export {
  Avaliacao,
  AvaliacaoSimples,
  AvaliacaoBreve,
  AvaliacaoClassificacaoRisco,
  AvaliacaoCompleta,
  DropdownItem,
  ImagemUrl,
  FatorRisco,
  RelacaoFatorRisco,
  Metastase,
  RelacaoMetastase,
  Estadiamento,
};
