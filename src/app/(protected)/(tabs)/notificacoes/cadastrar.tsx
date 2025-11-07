import CadastroNotificacaoSchema from "@/schemas/NotificacaoSchema";
import { useNotificacaoService } from "@/services/notificacao";
import { useEspecialistaStore } from "@/store/especialista";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Formik } from "formik";
import {
  Alert,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";

export default function CadastroNotificacao() {
  const router = useRouter();
  const { avaliacaoId, destinatarioId } = useLocalSearchParams<{
    avaliacaoId: string;
    destinatarioId: string;
  }>();
  const { especialista } = useEspecialistaStore();
  const notificacaoService = useNotificacaoService();

  const handleSalvarNotificacao = async (
    dados: { conteudo: string },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    if (!especialista) {
      Alert.alert(
        "Erro",
        "Não foi possível identificar o especialista remetente."
      );

      setSubmitting(false);
      return;
    }

    if (!avaliacaoId || !destinatarioId) {
      Alert.alert(
        "Erro",
        "Não foi possível identificar a avaliação ou o destinatário."
      );
      setSubmitting(false);
      return;
    }

    try {
      const { sucesso, mensagem } = await notificacaoService.cadastrar({
        ...dados,
        remetente_id: especialista.id,
        destinatario_id: Number(destinatarioId),
        avaliacao_id: Number(avaliacaoId),
      });

      Alert.alert(sucesso ? "Sucesso" : "Erro", mensagem);

      if (sucesso) {
        router.back();
      }
    } catch (error) {
      console.error("Falha ao salvar a notificação:", error);
      Alert.alert(
        "Erro inesperado",
        "Ocorreu uma falha ao tentar salvar a notificação"
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
          validationSchema={CadastroNotificacaoSchema}
          onSubmit={handleSalvarNotificacao}
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
              <Text style={styles.titulo}>Gerar Notificação</Text>

              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Conteúdo da Mensagem</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.textArea,
                      touched.conteudo && errors.conteudo
                        ? styles.inputError
                        : null,
                    ]}
                    onChangeText={handleChange("conteudo")}
                    onBlur={handleBlur("conteudo")}
                    value={values.conteudo}
                    placeholder="Descreva o conteúdo da notificação..."
                    keyboardType="default"
                    autoCapitalize="sentences"
                    multiline={true}
                    numberOfLines={6}
                    maxLength={250}
                  />

                  {touched.conteudo && errors.conteudo && (
                    <Text style={styles.errorText}>{errors.conteudo}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.botao,
                    isSubmitting && styles.botaoDesabilitado,
                  ]}
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.botaoTexto}>Enviar Notificação</Text>
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
    height: 150,
    textAlignVertical: "top",
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
    backgroundColor: "#008C9E",
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
