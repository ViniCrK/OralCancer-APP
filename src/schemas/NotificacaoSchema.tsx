import * as Yup from "yup";

const CadastroNotificacaoSchema = Yup.object().shape({
  conteudo: Yup.string()
    .min(10, "A notificação deve ter pelo menos 10 caracteres.")
    .max(250, "A notificação não pode exceder 250 caracteres.")
    .required("O conteúdo é obrigatório."),
});

export default CadastroNotificacaoSchema;
