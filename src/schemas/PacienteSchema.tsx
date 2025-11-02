import * as Yup from "yup";

const PacienteSchema = Yup.object().shape({
  nome: Yup.string()
    .min(3, "O nome deve ter pelo menos 3 caracteres")
    .required("O nome é obrigatório."),
  sobrenome: Yup.string()
    .min(3, "O sobrenome deve ter pelo menos 3 caracteres")
    .required("O sobrenome é obrigatório."),
  data_nascimento: Yup.date()
    .max(new Date(), "A data de nascimento não pode ser uma data futura.")
    .required("A data de nascimento é obrigatória."),
  sexo_id: Yup.number()
    .nullable()
    .positive("Por favor, selecione o sexo.")
    .required("O sexo é obrigatório."),
  registro_hospitalar: Yup.string()
    .min(9, "O registro hospitalar deve ter 9 dígitos.")
    .required("O registro hospitalar é obrigatório."),
});

export default PacienteSchema;
