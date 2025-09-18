import { supabase } from "@/config/supabase-client";

interface DadosEspecialista {
  email: string;
  senha: string;
  nome: string;
  sobrenome: string;
  registro_profissional: string;
  especialidade: number;
}

const UsuarioService = {
  cadastrar: async (
    dados: DadosEspecialista
  ): Promise<{ sucesso: boolean }> => {
    const { email, senha } = dados;

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (error || !data.user) return { sucesso: false };

    const { error: insertError } = await supabase.from("ESPECIALISTAS").insert([
      {
        user_id: data.user.id,
        nome: dados.nome,
        sobrenome: dados.sobrenome,
        registro_profissional: dados.registro_profissional,
        especialidade_id: dados.especialidade,
      },
    ]);

    return { sucesso: !insertError };
  },

  entrar: async (
    email: string,
    senha: string
  ): Promise<{ sucesso: boolean }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error || !data.user) return { sucesso: false };

    return { sucesso: true };
  },

  sair: async () => {
    await supabase.auth.signOut();
  },
};

export const useUsuarioService = () => UsuarioService;
