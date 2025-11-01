import CadastroRelatorioSchema from "@/schemas/RelatorioSchema";
import { useRelatorioService } from "@/services/relatorio";
import { useEspecialistaStore } from "@/store/especialista";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Formik } from "formik";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";

export default function CadastroRelatorio() {
  const router = useRouter();
  const { id: avaliacao_id } = useLocalSearchParams<{ id: string }>();
  const { especialista } = useEspecialistaStore();
  const relatorioService = useRelatorioService();

  const handleSalvarRelatorio = async (
    dados: { conteudo: string },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    if (!especialista || !avaliacao_id) {
      Alert.alert(
        "Erro",
        "Não foi possível identificar o especialista ou a avaliação."
      );

      setSubmitting(false);
      return;
    }

    try {
      const { sucesso, mensagem } = await relatorioService.cadastrar({
        ...dados,
        avaliacao_id: Number(avaliacao_id),
        especialista_id: especialista.id,
      });

      Alert.alert(sucesso ? "Sucesso" : "Erro", mensagem);

      if (sucesso) {
        router.back();
      }
    } catch (error) {
      console.error("Falha ao salvar relatório:", error);
      Alert.alert(
        "Erro inesperado",
        "Ocorreu uma falha ao tentar salvar o relatório"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Formik
          initialValues={{ conteudo: "" }}
          validationSchema={CadastroRelatorioSchema}
          onSubmit={handleSalvarRelatorio}
        >
          {({
            handleSubmit,
            handleChange,
            handleBlur,
            values,
            errors,
            touched,
            isSubmitting,
          }) => (
            <>
              <Text style={styles.titulo}>Geração de Relatório</Text>

              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Conteúdo do Relatório</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.textArea, // Aplicar estilo de área de texto
                      touched.conteudo && errors.conteudo
                        ? styles.inputError
                        : null,
                    ]}
                    onChangeText={handleChange("conteudo")}
                    onBlur={handleBlur("conteudo")} // Adicionar onBlur
                    value={values.conteudo} // Adicionar value
                    placeholder="Descreva o conteúdo do relatório"
                    keyboardType="default"
                    autoCapitalize="sentences"
                    multiline={true} // 10. Tornar o campo multiline
                    numberOfLines={10} // Sugestão de altura
                  />

                  {touched.conteudo && errors.conteudo && (
                    <Text style={styles.errorText}>{errors.conteudo}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.botao,
                    isSubmitting && styles.botaoDesabilitado,
                  ]} // 12. Usar isSubmitting
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.botaoTexto}>Salvar Relatório</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </Formik>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  form: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9fafb",
  },
  textArea: {
    height: 200, // Altura maior para o conteúdo do relatório
    textAlignVertical: "top", // Começa a digitar do topo
  },
  inputError: {
    borderColor: "#ef4444",
    borderWidth: 2,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  botao: {
    backgroundColor: "#10B981",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  botaoDesabilitado: {
    backgroundColor: "#a0d8c5",
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
