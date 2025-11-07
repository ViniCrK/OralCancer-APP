import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Formik } from "formik";
import { useUsuarioService } from "@/services/usuario";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import CadastroSchema from "@/schemas/CadastroSchema";
import PasswordInput from "@/components/SenhaInput";
import { useState } from "react";

export default function CadastroPagina() {
  const router = useRouter();
  const usuarioService = useUsuarioService();

  const [isSecurePassword, setIsSecurePassword] = useState(true);
  const [isSecureConfirm, setIsSecureConfirm] = useState(true);

  const handleCadastrar = async (
    dados: any,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    const { sucesso, mensagem } = await usuarioService.cadastrar({
      email: dados.email,
      senha: dados.password,
    });

    if (!sucesso) {
      Alert.alert("Erro", mensagem);
    } else {
      Alert.alert("Cadastro Realizado com sucesso", mensagem);
      router.push("/(auth)/login");
    }

    setSubmitting(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Cadastre-se</Text>
          <Text style={styles.subtitulo}>Crie sua conta</Text>
        </View>

        <Formik
          initialValues={{ email: "", password: "", confirmPassword: "" }}
          validationSchema={CadastroSchema}
          onSubmit={handleCadastrar}
        >
          {({
            handleBlur,
            handleChange,
            handleSubmit,
            values,
            errors,
            touched,
            isSubmitting,
          }) => (
            // 3. Removido o 'formCard'
            <View style={styles.form}>
              {/* 4. Novo Input de Email com Ícone */}
              <View
                style={[
                  styles.inputWrapper,
                  touched.email && errors.email ? styles.inputError : null,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#9ca3af"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  value={values.email}
                  placeholder="Email"
                  placeholderTextColor={"#9ca3af"}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoFocus={true}
                />
              </View>
              {touched.email && errors.email && (
                <Text style={styles.errorText}>{errors.email as string}</Text>
              )}

              {/* 5. Novo Input de Senha com Ícones */}
              <View
                style={[
                  styles.inputWrapper,
                  touched.password && errors.password
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
                  style={styles.input}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  value={values.password}
                  placeholder="Senha"
                  placeholderTextColor={"#9ca3af"}
                  autoCapitalize="none"
                  secureTextEntry={isSecurePassword}
                />
                <TouchableOpacity
                  onPress={() => setIsSecurePassword(!isSecurePassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={isSecurePassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>
              {touched.password && errors.password && (
                <Text style={styles.errorText}>
                  {errors.password as string}
                </Text>
              )}

              {/* 6. Novo Input de Confirmar Senha com Ícones */}
              <View
                style={[
                  styles.inputWrapper,
                  touched.confirmPassword && errors.confirmPassword
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
                  style={styles.input}
                  onChangeText={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  value={values.confirmPassword}
                  placeholder="Confirmar Senha"
                  placeholderTextColor={"#9ca3af"}
                  autoCapitalize="none"
                  secureTextEntry={isSecureConfirm}
                />
                <TouchableOpacity
                  onPress={() => setIsSecureConfirm(!isSecureConfirm)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={isSecureConfirm ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>
              {touched.confirmPassword && errors.confirmPassword && (
                <Text style={styles.errorText}>
                  {errors.confirmPassword as string}
                </Text>
              )}

              {/* 7. Botão Atualizado */}
              <TouchableOpacity
                onPress={() => handleSubmit()}
                style={[styles.botao, isSubmitting && styles.botaoDesabilitado]}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.botaoTexto}>Cadastrar</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Formik>

        {/* 8. Link de Login Atualizado */}
        <View style={styles.linkContainer}>
          <Text style={styles.linkTexto}>Já tem uma conta? </Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text style={styles.linkTextoBold}>Entre</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 30, // Padding geral
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1f2937",
  },
  subtitulo: {
    fontSize: 16,
    color: "#6b7280", // Cinza suave
    textAlign: "center",
    marginTop: 8,
  },
  form: {
    width: "100%",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb", // Cinza claro
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 15, // Espaço entre os inputs
    backgroundColor: "#fff",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
    height: "100%",
  },
  eyeIcon: {
    padding: 5,
  },
  inputError: {
    borderColor: "#ef4444", // Borda vermelha para erro
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 5,
  },
  botao: {
    backgroundColor: "#008C9E", // Cor teal (como na imagem de login)
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20, // Espaço acima do botão
    elevation: 2,
    shadowColor: "#008C9E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  botaoDesabilitado: {
    backgroundColor: "#a5f3fc",
  },
  botaoTexto: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
  linkContainer: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  linkTexto: {
    fontSize: 15,
    color: "#6b7280",
  },
  linkTextoBold: {
    fontWeight: "bold",
    color: "#008C9E", // Cor teal
    fontSize: 15,
  },
});
