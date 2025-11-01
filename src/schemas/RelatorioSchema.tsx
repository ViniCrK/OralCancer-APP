import * as Yup from "yup";

const CadastroRelatorioSchema = Yup.object().shape({
  conteudo: Yup.string()
    .min(10, "O relatório deve ter pelo menos 10 caracteres.")
    .required("O conteúdo do relatório é obrigatório."),
});

export default CadastroRelatorioSchema;
