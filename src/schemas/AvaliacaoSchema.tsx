import * as Yup from "yup";

const msgObrigatorio = "Este campo é obrigatório";

export const PaginaUmSchema = Yup.object().shape({
  paciente_id: Yup.number()
    .positive("Por favor, selecione um paciente.")
    .required(msgObrigatorio),

  queixa_principal: Yup.string()
    .optional()
    .max(200, "Máximo de 200 caracteres."),

  tamanho_aproximado: Yup.number()
    .nullable()
    .typeError("Deve ser um número")
    .min(0, "O valor não pode ser negativo."),

  tempo_evolucao: Yup.number()
    .nullable()
    .typeError("Deve ser um número")
    .integer("Deve ser um número inteiro")
    .min(0, "O valor não pode ser negativo."),

  habito_id: Yup.number().nullable().positive("Selecione uma opção válida."),

  carga_tabagica_etilica: Yup.number()
    .nullable()
    .typeError("Deve ser um número")
    .integer("Deve ser um número inteiro")
    .min(0, "O valor não pode ser negativo."),

  historico_familiar_cancer: Yup.boolean(),
});

export const PaginaDoisSchema = Yup.object().shape({
  localizacao_intraoral_id: Yup.number()
    .nullable()
    .positive("Selecione uma opção válida."),

  aspecto_lesao_id: Yup.number()
    .nullable()
    .positive("Selecione uma opção válida."),

  superficie_id: Yup.number()
    .nullable()
    .positive("Selecione uma opção válida."),

  sintoma_associado_id: Yup.number()
    .nullable()
    .positive("Selecione uma opção válida."),

  bordas_id: Yup.number().nullable().positive("Selecione uma opção válida."),

  linfonodo_regional_id: Yup.number()
    .nullable()
    .positive("Selecione uma opção válida."),
});

export const PaginaTresSchema = Yup.object().shape({
  classificacao_risco_id: Yup.number()
    .nullable()
    .positive("Selecione uma opção válida."),

  conduta_recomendada_id: Yup.number()
    .nullable()
    .positive("Selecione uma opção válida."),

  area_encaminhamento_id: Yup.number()
    .nullable()
    .positive("Selecione uma opção válida."),

  fatores_risco_ids: Yup.array()
    .of(Yup.number())
    .min(0, "Selecione pelo menos um fator de risco.")
    .nullable(),

  imagens: Yup.array().of(Yup.object()).nullable(),

  observacoes: Yup.string().max(200, "Máximo de 200 caracteres.").nullable(),
});

export const CadastrodeAvaliacaoSchemas = [
  PaginaUmSchema,
  PaginaDoisSchema,
  PaginaTresSchema,
];
