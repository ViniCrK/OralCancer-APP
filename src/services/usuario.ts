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

  alterarSenha: async (
    novaSenha: string
  ): Promise<{ sucesso: boolean; mensagem: string }> => {
    const { error } = await supabase.auth.updateUser({
      password: novaSenha,
    });

    if (error) {
      console.error("Erro ao alterar a senha do usuário:", error.message);

      return {
        sucesso: false,
        mensagem: "Erro ao alterar a sua senha!",
      };
    }

    return { sucesso: true, mensagem: "Sua senha foi alterada com sucesso!" };
  },

  alterarEmail: async (
    novoEmail: string
  ): Promise<{ sucesso: boolean; mensagem: string }> => {
    const { error } = await supabase.auth.updateUser({
      email: novoEmail,
    });

    if (error) {
      console.error("Erro ao atualizar o email do usuário:", error.message);
      return {
        sucesso: false,
        mensagem: "Erro ao atualizar o seu e-mail!",
      };
    }
    return { sucesso: true, mensagem: "Seu e-mail alterado com sucesso!" };
  },
};

export const useUsuarioService = () => UsuarioService;
