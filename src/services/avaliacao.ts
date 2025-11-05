import { supabase } from "@/config/supabase-client";

export interface Avaliacao {
  queixa_principal: string;
  tamanho_aproximado: number;
  tempo_evolucao: number;
  carga_tabagica_etilica: number;
  historico_familiar_cancer: boolean;
  observacoes: string;
  rascunho: boolean;
  habito_id: number;
  localizacao_intraoral_id: number;
  aspecto_lesao_id: number;
  superficie_id: number;
  sintoma_associado_id: number;
  bordas_id: number;
  linfonodo_regional_id: number;
  classificacao_risco_id: number;
  conduta_recomendada_id: number;
  area_encaminhamento_id: number;
  especialista_id: string | number;
  paciente_id: string | number;
}

const AvaliacaoService = {
  cadastrar: async (
    dados: Avaliacao
  ): Promise<{ sucesso: boolean; mensagem: string }> => {
    const { error } = await supabase.from("AVALIACOES").insert(dados);

    if (error) {
      return {
        sucesso: false,
        mensagem: `Erro ao cadastrar a Avaliação: ${error.message}`,
      };
    }

    return { sucesso: true, mensagem: "Avaliação cadastrada com sucesso!" };
  },

  listar: async (termoBusca?: string): Promise<any[]> => {
    let query = supabase
      .from("AVALIACOES")
      .select(
        `
      id,
      observacoes,
      created_at,
      PACIENTES!inner ( id, nome, sobrenome, registro_hospitalar ),
      ESPECIALISTAS ( id, nome, sobrenome )
      `
      )
      .eq("rascunho", false);

    if (termoBusca && termoBusca.trim() !== "") {
      const textoBusca = `%${termoBusca.trim()}%`;

      query = query.or(
        `nome.ilike.${textoBusca},sobrenome.ilike.${textoBusca},registro_hospitalar.ilike.${textoBusca}`,
        { foreignTable: "PACIENTES" }
      );
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Erro ao listar as avaliações:", error.message);
      return [];
    }

    return data || [];
  },

  listarRascunhos: async (especialistaId: number): Promise<any[]> => {
    const { data, error } = await supabase
      .from("AVALIACOES")
      .select(
        `
        id,
        observacoes,
        created_at,
        PACIENTES ( id, nome, sobrenome ),
        ESPECIALISTAS ( id, nome, sobrenome )
        `
      )
      .eq("rascunho", true)
      .eq("especialista_id", especialistaId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao listar os rascunhos:", error.message);
      return [];
    }

    return data || [];
  },

  buscar: async (id: string) => {
    const { data, error } = await supabase
      .from("AVALIACOES")
      .select(
        `
        *,
        HABITOS ( id, nome ),
        LOCALIZACOES_INTRAORAIS ( id, nome ),
        ASPECTOS_LESAO ( id, nome ),
        SUPERFICIES ( id, nome ),
        SINTOMAS ( id, nome ),
        BORDAS ( id, nome ),
        LINFONODOS ( id, nome ),
        CLASSIFICACOES_RISCO ( id, nome ),
        CONDUTAS ( id, nome ),
        AREAS_ENCAMINHAMENTO ( id, nome ),
        PACIENTES ( id, nome, sobrenome ),
        ESPECIALISTAS ( id, nome, sobrenome ),
        AVALIACAO_IMAGENS_URL ( id, url ),
        AVALIACAO_FATORES_RISCO ( FATORES_RISCO ( id, nome ) )
        `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar avaliação:", error.message);
    }

    return data;
  },

  atualizar: async (
    id: string,
    avaliacao: any
  ): Promise<{ sucesso: boolean; mensagem: string }> => {
    const { error } = await supabase
      .from("AVALIACOES")
      .update(avaliacao)
      .eq("id", id);

    if (error) {
      return {
        sucesso: false,
        mensagem: `Erro ao atualizar a avaliação:${error.message}`,
      };
    }

    return {
      sucesso: true,
      mensagem: "Dados da avaliação alterados com sucesso!",
    };
  },

  excluir: async (
    id: string
  ): Promise<{ sucesso: boolean; mensagem: string }> => {
    const { error } = await supabase.from("AVALIACOES").delete().eq("id", id);

    if (error) {
      return {
        sucesso: false,
        mensagem: `Erro ao excluir a avaliação: ${error.message}`,
      };
    }

    return {
      sucesso: true,
      mensagem: "Avaliação excluída com sucesso!",
    };
  },
};

export const useAvaliacaoService = () => AvaliacaoService;
