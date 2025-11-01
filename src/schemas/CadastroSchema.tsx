import * as Yup from "yup";

const CadastroSchema = Yup.object().shape({
  email: Yup.string()
    .email("Por favor, insira um e-mail válido.")
    .required("O e-mail é obrigatório."),

  password: Yup.string()
    .min(6, "A senha deve ter no mínimo 6 caracteres.")
    .required("A senha é obrigatória."),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "As senhas não conferem.")
    .required("A confirmação da senha é obrigatória."),
});

export default CadastroSchema;
