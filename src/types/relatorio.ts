import { Avaliacao } from "./avaliacao";
import { Especialista, EspecialistaCompleto } from "./especialista";

type RelatorioComEspecialista = {
  id: number;
  conteudo: string;
  created_at: string;
  ESPECIALISTAS: Especialista | null;
};

type RelatorioCompleto = {
  id: number;
  conteudo: string;
  created_at: string;
  ESPECIALISTAS: Especialista | null;
  AVALIACOES: Avaliacao | null;
};

export { RelatorioComEspecialista, RelatorioCompleto };
