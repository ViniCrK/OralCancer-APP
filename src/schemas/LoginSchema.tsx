import * as Yup from "yup";

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Por favor, insira um e-mail válido.")
    .required("O e-mail é obrigatório."),
  password: Yup.string()
    .min(6, "A senha deve ter pelo menos 6 caracteres.")
    .required("A senha é obrigatória."),
});

export default LoginSchema;
