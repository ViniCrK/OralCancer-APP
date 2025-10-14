import { supabase } from "@/config/supabase-client";

const PacienteService = {
  cadastrar: async (
    dados: any
  ): Promise<{ sucesso: boolean; mensagem: string }> => {
    const { error } = await supabase.from("PACIENTES").insert(dados);

    if (error) {
      return {
        sucesso: false,
        mensagem: `Erro ao cadastrar o paciente: ${error.message}`,
      };
    }

    return { sucesso: true, mensagem: "Paciente cadastrado com sucesso!" };
  },

  listar: async (): Promise<any[]> => {
    const { data, error } = await supabase
      .from("PACIENTES")
      .select(
        `
        *,
        SEXOS ( id, nome )
        `
      )
      .order("nome");

    if (error) {
      console.error("Erro ao listar os pacientes:", error.message);
      return [];
    }

    return data || [];
  },

  buscar: async (id: string) => {
    const { data, error } = await supabase
      .from("PACIENTES")
      .select(
        `
        *,
        SEXOS ( id, nome )
        `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar o paciente:", error.message);
    }

    return data;
  },

  atualizar: async (
    id: string,
    paciente: any
  ): Promise<{ sucesso: boolean; mensagem: string }> => {
    const { error } = await supabase
      .from("PACIENTES")
      .update(paciente)
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar os dados do paciente:", error.message);

      return {
        sucesso: false,
        mensagem:
          "Erro ao tentar atualizar os dados desse paciente, tente novamente!",
      };
    }

    return {
      sucesso: true,
      mensagem: "Os dados do paciente foram atualizados com sucesso!",
    };
  },
};

export const usePacienteService = () => PacienteService;
