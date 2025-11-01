import PasswordInput from "@/components/SenhaInput";
import { AlterarSenhaSchema } from "@/schemas/PerfilSchema";
import { useUsuarioService } from "@/services/usuario";
import { AlterarSenhaDados } from "@/types/especialista";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";

export default function AlterarSenha() {
  const router = useRouter();
  const usuarioService = useUsuarioService();

  const hanldeAlterarSenha = async (
    dados: AlterarSenhaDados,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    Alert.alert(
      "Alterar Senha",
      "Você tem certeza de que deseja alterar a sua senha?",
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => setSubmitting(false),
        },
        {
          text: "Sim",
          style: "default",
          onPress: async () => {
            try {
              const { sucesso, mensagem } = await usuarioService.alterarSenha(
                dados.novaSenha
              );

              if (!sucesso) {
                Alert.alert("Erro", mensagem);
              } else {
                Alert.alert("Sucesso", mensagem);
                router.replace("/(tabs)/perfil");
              }
            } catch (error) {
              console.error("Erro ao alterar senha:", error);
              Alert.alert("Erro", "Ocorreu uma falha inesperada.");
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.titulo}>Alterar Senha</Text>
        <Formik
          initialValues={{ novaSenha: "", confirmarSenha: "" }}
          validationSchema={AlterarSenhaSchema}
          onSubmit={hanldeAlterarSenha}
        >
          {({
            handleChange,
            handleSubmit,
            handleBlur,
            values,
            errors,
            touched,
            isSubmitting,
          }) => (
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <PasswordInput
                  label="Nova Senha"
                  onChangeText={handleChange("novaSenha")}
                  onBlur={handleBlur("novaSenha")}
                  value={values.novaSenha}
                  placeholder="••••••••"
                  errorMessage={
                    touched.novaSenha && errors.novaSenha
                      ? errors.novaSenha
                      : undefined
                  }
                />
              </View>

              <View style={styles.inputContainer}>
                <PasswordInput
                  label="Confirmar Nova Senha"
                  onChangeText={handleChange("confirmarSenha")}
                  onBlur={handleBlur("confirmarSenha")}
                  value={values.confirmarSenha}
                  placeholder="••••••••"
                  errorMessage={
                    touched.confirmarSenha && errors.confirmarSenha
                      ? errors.confirmarSenha
                      : undefined
                  }
                />
              </View>

              <TouchableOpacity
                style={[styles.botao, isSubmitting && styles.botaoDesabilitado]}
                onPress={() => handleSubmit()}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.botaoTexto}>Salvar Alterações</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: "center" },
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingTop: 20,
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  form: { backgroundColor: "#fff", borderRadius: 10, padding: 20 },
  inputContainer: { marginBottom: 15 },
  botao: {
    backgroundColor: "#10B981",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  botaoDesabilitado: { backgroundColor: "#a0d8c5" },
  botaoTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
