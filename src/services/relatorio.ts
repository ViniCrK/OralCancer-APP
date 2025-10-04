import { supabase } from "@/config/supabase-client";

const RelatorioService = {
  cadastrar: async (
    dados: any
  ): Promise<{ sucesso: boolean; mensagem: string }> => {
    const { error } = await supabase.from("RELATORIOS").insert(dados);

    if (error) {
      return {
        sucesso: false,
        mensagem: "Erro ao criar o relatório!",
      };
    }

    return { sucesso: true, mensagem: "Relatório criado com sucesso!" };
  },

  listar: async (avaliacao_id: string): Promise<any[]> => {
    const { data, error } = await supabase
      .from("RELATORIOS")
      .select(
        `
        id,
        conteudo,
        created_at,
        ESPECIALISTAS ( id, nome, sobrenome )
        `
      )
      .eq("avaliacao_id", avaliacao_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        "Erro ao listar relatórios desta avaliação:",
        error.message
      );
      return [];
    }

    return data || [];
  },

  buscar: async (id: string) => {
    const { data, error } = await supabase
      .from("RELATORIOS")
      .select(
        `
        *,
        ESPECIALISTAS ( id, nome, sobrenome ),
        AVALIACOES ( PACIENTES ( id, nome, sobrenome ) )
        `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar o relatório:", error.message);

      return null;
    }

    return data;
  },

  atualizar: async (
    id: string,
    relatorio: any
  ): Promise<{ sucesso: boolean }> => {
    const { error } = await supabase
      .from("RELATORIOS")
      .update(relatorio)
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar o relatório:", error.message);

      return { sucesso: false };
    }
    return { sucesso: true };
  },
};

export const useRelatorioService = () => RelatorioService;
