import {
  ActivityIndicator,
  Alert,
  Dimensions,
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
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import LoginSchema from "@/schemas/LoginSchema";
import { useState } from "react";

const { height } = Dimensions.get("window");

export default function LoginPagina() {
  const usuarioService = useUsuarioService();
  const [isSecure, setIsSecure] = useState(true);

  const handleLogin = async (
    { email, password: senha }: any,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    const { sucesso, mensagem } = await usuarioService.entrar(email, senha);

    if (!sucesso) {
      Alert.alert("Erro", mensagem);
      console.error("Erro ao fazer login:", mensagem);
    } else {
      Alert.alert("Sucesso", mensagem);
    }
    setSubmitting(false);
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerBackground} />

      <View style={styles.whiteSheet}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.titulo}>Bem-vindo de volta</Text>
              <Text style={styles.subtitulo}>Entre para continuar</Text>
            </View>

            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={LoginSchema}
              onSubmit={handleLogin}
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
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color="#9ca3af"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor="#9ca3af"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={values.email}
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                    />
                  </View>
                  {touched.email && errors.email && (
                    <Text style={styles.errorText}>
                      {errors.email as string}
                    </Text>
                  )}

                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#9ca3af"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Senha"
                      placeholderTextColor="#9ca3af"
                      autoCapitalize="none"
                      secureTextEntry={isSecure}
                      value={values.password}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                    />
                    <TouchableOpacity
                      onPress={() => setIsSecure(!isSecure)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={isSecure ? "eye-off-outline" : "eye-outline"}
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

                  <Link href="/esqueci-senha" asChild>
                    <TouchableOpacity style={styles.forgotContainer}>
                      <Text style={styles.forgotPasswordLink}>
                        Esqueceu a senha?
                      </Text>
                    </TouchableOpacity>
                  </Link>

                  <TouchableOpacity
                    onPress={() => handleSubmit()}
                    style={[
                      styles.botao,
                      isSubmitting && styles.botaoDesabilitado,
                    ]}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.botaoTexto}>Entrar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </Formik>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Não tem cadastro? </Text>
              <Link href="/cadastro" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkCadastro}>Crie uma conta</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#0a8ea0",
  },
  headerBackground: {
    height: height * 0.25,
  },
  whiteSheet: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 67,
    paddingHorizontal: 25,
    paddingTop: 40,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerTextContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: "#6b7280",
  },
  form: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 15,
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
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 5,
  },
  forgotContainer: {
    alignSelf: "flex-end",
    marginBottom: 30,
  },
  forgotPasswordLink: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
  },
  botao: {
    backgroundColor: "#008C9E",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
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
    fontSize: 18,
    fontWeight: "bold",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 38,
    paddingBottom: 30,
  },
  footerText: {
    fontSize: 15,
    color: "#6b7280",
  },
  linkCadastro: {
    fontSize: 15,
    color: "#008C9E",
    fontWeight: "bold",
  },
});
