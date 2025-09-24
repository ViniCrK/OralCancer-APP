import { supabase } from "@/config/supabase-client";

interface Usuario {
  email: string;
  senha: string;
}

const UsuarioService = {
  cadastrar: async (
    dados: Usuario
  ): Promise<{ sucesso: boolean; mensagem: string }> => {
    const { email, senha } = dados;

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (error || !data.user)
      return {
        sucesso: false,
        mensagem: error?.message || "Erro desconhecido.",
      };

    return {
      sucesso: true,
      mensagem:
        "Usuário criado com sucesso! Verifique seu email para confirmar a conta.",
    };
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
