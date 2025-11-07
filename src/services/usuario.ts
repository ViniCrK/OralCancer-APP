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

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (error) {
      console.error("Erro ao cadastrar usuário:", error.message);

      return {
        sucesso: false,
        mensagem: "Erro ao tentar cadastrar o seu usuário, tente novamente",
      };
    }

    return {
      sucesso: true,
      mensagem:
        "Verifique seu e-mail para confirmar a conta antes de fazer o login.",
    };
  },

  entrar: async (
    email: string,
    senha: string
  ): Promise<{ sucesso: boolean; mensagem: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      console.error("Erro ao tentar logar o usuário:", error.message);

      return {
        sucesso: false,
        mensagem: "E-mail ou senha incorretos. Tente novamente mais tarde!",
      };
    }

    return { sucesso: true, mensagem: "Login realizado com sucesso!" };
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

  recuperarSenha: async (
    email: string
  ): Promise<{ sucesso: boolean; mensagem: string }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "exp+OralCancer://recuperar-senha",
    });

    if (error) {
      console.error("Erro ao recuperar a senha do usuário:", error.message);

      return {
        sucesso: false,
        mensagem: "Erro ao recuperar sua senha, tente novamente!",
      };
    }
    return {
      sucesso: true,
      mensagem: "Enviamos um link ao seu e-mail para redefinir sua senha.",
    };
  },

  redefinirSenha: async (
    novaSenha: string
  ): Promise<{ sucesso: boolean; mensagem: string }> => {
    const { error } = await supabase.auth.updateUser({ password: novaSenha });

    if (error) {
      console.error("Erro ao redefinir a senha do usuário:", error.message);

      return {
        sucesso: false,
        mensagem: "Erro ao tentar redifinir sua senha, tente novamente.",
      };
    }

    return {
      sucesso: true,
      mensagem: "Sua senha foi redefinida! Por favor, faça o login novamente.",
    };
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
