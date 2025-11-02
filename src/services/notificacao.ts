import { supabase } from "@/config/supabase-client";

const NotificacaoService = {
  cadastrar: async (
    dados: any
  ): Promise<{ sucesso: boolean; mensagem: string }> => {
    const { error } = await supabase.from("NOTIFICACOES").insert(dados);

    if (error) {
      console.error("Erro ao criar a notificação:", error.message);
      return {
        sucesso: false,
        mensagem: "Erro ao criar a notificação.",
      };
    }

    return { sucesso: true, mensagem: "Notificação criada com sucesso!" };
  },

  listar: async (destinatarioId: number): Promise<any[]> => {
    const { data, error } = await supabase
      .from("NOTIFICACOES")
      .select(
        `
        id,
        conteudo,
        created_at,
        lida,
        remetente:ESPECIALISTAS!remetente_id ( id, nome, sobrenome ), 
        AVALIACOES ( id, CLASSIFICACOES_RISCO ( id, nome ) )
        `
      )
      .eq("destinatario_id", destinatarioId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar as notificações:", error.message);
      return [];
    }

    return data || [];
  },

  buscar: async (id: string) => {
    const { data, error } = await supabase
      .from("NOTIFICACOES")
      .select(
        `
        *,
        remetente:ESPECIALISTAS!remetente_id ( id, nome, sobrenome, registro_profissional ),
        destinatario:ESPECIALISTAS!destinatario_id ( id, nome, sobrenome ),
        AVALIACOES ( id, CLASSIFICACOES_RISCO ( id, nome ), PACIENTES ( id, nome, sobrenome, registro_hospitalar ) )
        `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar os dados da notificação:", error.message);
    }

    return data;
  },

  marcarComoLida: async (
    notificacaoId: number
  ): Promise<{ sucesso: boolean; mensagem: string }> => {
    const { error } = await supabase
      .from("NOTIFICACOES")
      .update({ lida: true })
      .eq("id", notificacaoId);

    if (error) {
      console.error("Erro ao marcar notificação como lida:", error.message);
      return {
        sucesso: false,
        mensagem: "Não foi possível atualizar a notificação.",
      };
    }

    return { sucesso: true, mensagem: "Notificação marcada como lida." };
  },
};

export const useNotificacaoService = () => NotificacaoService;
