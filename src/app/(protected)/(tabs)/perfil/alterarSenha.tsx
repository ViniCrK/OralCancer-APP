import PasswordInput from "@/components/SenhaInput";
import { AlterarSenhaSchema } from "@/schemas/PerfilSchema";
import { useUsuarioService } from "@/services/usuario";
import { AlterarSenhaDados } from "@/types/especialista";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { useState } from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  TextInput,
} from "react-native";

export default function AlterarSenha() {
  const router = useRouter();
  const usuarioService = useUsuarioService();

  const [isSecureNova, setIsSecureNova] = useState(true);
  const [isSecureConfirmar, setIsSecureConfirmar] = useState(true);

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alterar Senha</Text>
        <View style={{ width: 40 }} />
      </View>

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
          <View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nova Senha</Text>
              <View
                style={[
                  styles.inputBase,
                  touched.novaSenha && errors.novaSenha
                    ? styles.inputError
                    : null,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#9ca3af"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.inputText}
                  placeholder=""
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={isSecureNova}
                  value={values.novaSenha}
                  onChangeText={handleChange("novaSenha")}
                  onBlur={handleBlur("novaSenha")}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setIsSecureNova((prev) => !prev)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={isSecureNova ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>
              {touched.novaSenha && errors.novaSenha && (
                <Text style={styles.errorText}>
                  {errors.novaSenha as string}
                </Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar Nova Senha</Text>
              <View
                style={[
                  styles.inputBase,
                  touched.confirmarSenha && errors.confirmarSenha
                    ? styles.inputError
                    : null,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#9ca3af"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.inputText}
                  placeholder=""
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={isSecureConfirmar}
                  value={values.confirmarSenha}
                  onChangeText={handleChange("confirmarSenha")}
                  onBlur={handleBlur("confirmarSenha")}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setIsSecureConfirmar((prev) => !prev)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={isSecureConfirmar ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>
              {touched.confirmarSenha && errors.confirmarSenha && (
                <Text style={styles.errorText}>
                  {errors.confirmarSenha as string}
                </Text>
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
                <Text style={styles.botaoTexto}>Salvar Nova Senha</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </ScrollView>
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
    paddingTop: Platform.OS === "android" ? 20 : 0,
    paddingBottom: 40,
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 40,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    height: 52,
    paddingHorizontal: 15,
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  inputIcon: {
    marginRight: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    padding: 0,
  },
  eyeIcon: {
    padding: 5,
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
