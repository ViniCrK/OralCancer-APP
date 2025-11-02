import * as Yup from "yup";

const CadastroEspecialistaSchema = Yup.object().shape({
  nome: Yup.string().required("O nome é obrigatório."),
  sobrenome: Yup.string().required("O sobrenome é obrigatório."),
  registro_profissional: Yup.string()
    .min(9, "O registro profissional parece estar incompleto.")
    .required("O registro profissional é obrigatório."),
  especialidade_id: Yup.number()
    .positive("Por favor, selecione uma especialidade.")
    .required("A especialidade é obrigatória."),
});

export default CadastroEspecialistaSchema;
