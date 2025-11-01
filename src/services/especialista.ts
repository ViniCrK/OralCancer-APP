import { supabase } from "@/config/supabase-client";

interface Especialista {
  nome: string;
  sobrenome: string;
  registro_profissional: string;
  especialidade_id: number;
  email: string;
  user_id: string;
}

const EspecialistaService = {
  cadastrar: async (
    dados: Especialista
  ): Promise<{ sucesso: boolean; mensagem: string }> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { sucesso: false, mensagem: "Usuário não autenticado." };
    }

    const { error } = await supabase.from("ESPECIALISTAS").insert([
      {
        nome: dados.nome,
        sobrenome: dados.sobrenome,
        registro_profissional: dados.registro_profissional,
        especialidade_id: dados.especialidade_id,
        email: user.email,
        user_id: user.id,
      },
    ]);

    if (error) {
      return { sucesso: false, mensagem: error.message };
    }

    return { sucesso: true, mensagem: "Especialista cadastrado com sucesso!" };
  },

  buscar: async (id: number) => {
    const { data, error } = await supabase
      .from("ESPECIALISTAS")
      .select(
        `
        *,
        ESPECIALIDADES ( id, nome )
        `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar o especialista:", error.message);

      return null;
    }

    return data;
  },

  atualizar: async (
    id: number,
    especialista: any
  ): Promise<{ sucesso: boolean; mensagem: string }> => {
    const { error } = await supabase
      .from("ESPECIALISTAS")
      .update(especialista)
      .eq("id", id);

    if (error) {
      console.error(
        "Erro ao atualizar os dados do especialista:",
        error.message
      );

      return {
        sucesso: false,
        mensagem: "Erro ao atualizar os dados do especialista.",
      };
    }

    return { sucesso: true, mensagem: "Os dados foram atualizados!" };
  },
};

export const useEspecialistaService = () => EspecialistaService;
