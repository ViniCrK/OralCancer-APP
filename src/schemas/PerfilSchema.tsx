import * as Yup from "yup";

const EdicaoPerfilSchema = Yup.object().shape({
  nome: Yup.string()
    .min(3, "O nome deve ter pelo menos 3 caracteres")
    .required("O nome é obrigatório."),
  sobrenome: Yup.string().required("O sobrenome é obrigatório."),
  registro_profissional: Yup.string()
    .min(9, "O registro profissional parece estar incompleto.")
    .required("O registro profissional é obrigatório."),
  especialidade_id: Yup.number()
    .nullable()
    .positive("Por favor, selecione uma especialidade.")
    .required("A especialidade é obrigatória."),
});

const AlterarEmailSchema = Yup.object().shape({
  novoEmail: Yup.string()
    .email("Por favor, insira um e-mail válido.")
    .required("O e-mail é obrigatório."),
  confirmarEmail: Yup.string()
    .oneOf([Yup.ref("novoEmail")], "Os e-mails não conferem.")
    .required("A confirmação do e-mail é obrigatória."),
});

const AlterarSenhaSchema = Yup.object().shape({
  novaSenha: Yup.string()
    .min(6, "A senha deve ter no mínimo 6 caracteres.")
    .required("A nova senha é obrigatória."),
  confirmarSenha: Yup.string()
    .oneOf([Yup.ref("novaSenha")], "As senhas não conferem.")
    .required("A confirmação da senha é obrigatória."),
});

export { EdicaoPerfilSchema, AlterarEmailSchema, AlterarSenhaSchema };
