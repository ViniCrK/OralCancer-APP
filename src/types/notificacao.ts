import { Avaliacao, AvaliacaoClassificacaoRisco } from "./avaliacao";
import { Especialista, EspecialistaBreve } from "./especialista";

type Notificacao = {
  id: number;
  conteudo: string;
  created_at: string;
  lida: boolean;
  remetente: Especialista | null;
  AVALIACOES: AvaliacaoClassificacaoRisco | null;
};

type NotificacaoCompleta = {
  id: number;
  conteudo: string;
  created_at: string;
  remetente: EspecialistaBreve | null;
  destinatario: EspecialistaBreve | null;
  AVALIACOES: (Avaliacao & { id: number }) | null;
};

export { Notificacao, NotificacaoCompleta };
