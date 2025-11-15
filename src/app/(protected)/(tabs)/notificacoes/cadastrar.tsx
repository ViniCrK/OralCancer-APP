import CadastroNotificacaoSchema from "@/schemas/NotificacaoSchema";
import { useNotificacaoService } from "@/services/notificacao";
import { useEspecialistaStore } from "@/store/especialista";
import { Ionicons } from "@expo/vector-icons";
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
  Platform,
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
    <View style={styles.container}>
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerar Notificação</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
            <View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Conteúdo da Mensagem</Text>

                <View
                  style={[
                    styles.inputBase,
                    styles.textArea,
                    touched.conteudo && errors.conteudo
                      ? styles.inputError
                      : null,
                  ]}
                >
                  <TextInput
                    style={styles.inputText}
                    onChangeText={handleChange("conteudo")}
                    onBlur={handleBlur("conteudo")}
                    value={values.conteudo}
                    placeholder="Descreva o conteúdo da notificação..."
                    placeholderTextColor="#9ca3af"
                    keyboardType="default"
                    autoCapitalize="sentences"
                    multiline={true}
                    numberOfLines={8}
                    maxLength={250}
                  />
                </View>

                {touched.conteudo && errors.conteudo && (
                  <Text style={styles.errorText}>{errors.conteudo}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.botao, isSubmitting && styles.botaoDesabilitado]}
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
          )}
        </Formik>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  customHeader: {
    backgroundColor: "#008C9E",
    paddingTop: Platform.OS === "android" ? 40 : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  headerButton: {
    padding: 5,
    width: 40,
    alignItems: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#334155",
    marginBottom: 8,
    fontWeight: "600",
  },
  inputBase: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    justifyContent: "flex-start",
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  inputText: {
    fontSize: 16,
    color: "#1e293b",
    padding: 0,
    textAlignVertical: "top",
  },
  textArea: {
    height: 200,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 5,
  },
  botao: {
    backgroundColor: "#008C9E",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#008C9E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  botaoDesabilitado: {
    backgroundColor: "#a5f3fc",
    shadowOpacity: 0.1,
    elevation: 2,
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
