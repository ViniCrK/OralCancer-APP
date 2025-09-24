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
};

export const useEspecialistaService = () => EspecialistaService;
