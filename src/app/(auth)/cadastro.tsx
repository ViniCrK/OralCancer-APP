import {
  ActivityIndicator,
  Alert,
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

export default function CadastroPagina() {
  const router = useRouter();
  const usuarioService = useUsuarioService();

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
      Alert.alert("Cadastro Realizado", mensagem);
      router.push("/(auth)/login");
    }

    setSubmitting(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="person-add-outline" size={60} color="#10B981" />
          <Text style={styles.titulo}>Crie sua Conta</Text>
          <Text style={styles.subtitulo}>
            Preencha os dados para começar a usar o aplicativo.
          </Text>
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
            <View style={styles.formCard}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput
                  style={[
                    styles.input,
                    touched.email && errors.email ? styles.inputError : null,
                  ]}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  value={values.email}
                  placeholder="seu.email@exemplo.com"
                  placeholderTextColor={"#9ca3af"}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoFocus={true}
                />

                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <PasswordInput
                  label="Senha"
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  value={values.password}
                  placeholder="Senha"
                  errorMessage={
                    touched.password && errors.password
                      ? errors.password
                      : undefined
                  }
                />
              </View>

              <View style={styles.inputContainer}>
                <PasswordInput
                  label="Confirmar Senha"
                  onChangeText={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  value={values.confirmPassword}
                  placeholder="Confirmar Senha"
                  errorMessage={
                    touched.confirmPassword && errors.confirmPassword
                      ? errors.confirmPassword
                      : undefined
                  }
                />
              </View>

              <TouchableOpacity
                onPress={() => handleSubmit()}
                style={[styles.botao, isSubmitting && styles.botaoDesabilitado]}
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

        <Link href="/login" asChild>
          <TouchableOpacity style={styles.linkContainer}>
            <Text style={styles.linkTexto}>
              Já tem uma conta?{" "}
              <Text style={styles.linkTextoBold}>Faça o login</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f0f2f5",
  },
  header: { alignItems: "center", marginBottom: 30 },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1f2937",
    marginTop: 10,
  },
  subtitulo: { fontSize: 16, color: "gray", textAlign: "center", marginTop: 5 },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 16, color: "#374151", marginBottom: 5, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#f9fafb",
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
  forgotPasswordLink: {
    textAlign: "right",
    color: "#10B981",
    fontWeight: "500",
    marginBottom: 20,
  },
  botao: {
    backgroundColor: "#10B981",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  botaoDesabilitado: { backgroundColor: "#a0d8c5" },
  botaoTexto: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  linkContainer: { marginTop: 25, alignItems: "center" },
  linkTexto: { fontSize: 14, color: "gray" },
  linkTextoBold: { fontWeight: "bold", color: "#10B981" },
});
