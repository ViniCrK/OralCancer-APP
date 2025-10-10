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
} from "react-native";

export default function CadastroNotificacao() {
  const router = useRouter();
  const { avaliacaoId, destinatarioId } = useLocalSearchParams<{
    avaliacaoId: string;
    destinatarioId: string;
  }>();
  const { especialista } = useEspecialistaStore();
  const notificacaoService = useNotificacaoService();

  const handleSalvarNotificacao = async (dados: any) => {
    if (!especialista) {
      Alert.alert(
        "Erro",
        "Não foi possível identificar o especialista ou a avaliação."
      );
      return;
    }

    try {
      const { sucesso, mensagem } = await notificacaoService.cadastrar({
        ...dados,
        remetente_id: especialista.id,
        destinatario_id: destinatarioId,
        avaliacao_id: avaliacaoId,
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
    }
  };

  return (
    <View style={styles.container}>
      <Formik
        initialValues={{
          conteudo: "",
        }}
        onSubmit={(dados) => handleSalvarNotificacao(dados)}
      >
        {({ handleSubmit, handleChange }) => (
          <View style={styles.container}>
            <Text style={styles.titulo}>Gerar Notificação</Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Conteúdo</Text>

                <TextInput
                  style={styles.input}
                  onChangeText={handleChange("conteudo")}
                  placeholder="Descreva o conteúdo da notificação"
                  keyboardType="default"
                  autoCapitalize="sentences"
                />
              </View>

              <TouchableOpacity
                style={styles.botao}
                onPress={() => handleSubmit()}
              >
                <Text style={styles.botaoTexto}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  dropdownContainer: {
    borderStartEndRadius: 10,
    borderEndEndRadius: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  checkbox: {
    marginRight: 12,
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: "#ccc",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#333",
  },
  observacoesTexto: {
    height: 80,
    textAlignVertical: "top",
  },
  contador: {
    textAlign: "right",
    color: "#6c757d",
    fontSize: 12,
    marginTop: 4,
  },
  botao: {
    backgroundColor: "#10B981",
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
