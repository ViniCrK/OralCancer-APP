import { StatusBar } from "expo-status-bar";
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
import { useState } from "react";
import { useUsuarioService } from "@/services/usuario";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function CadastroPagina() {
  const router = useRouter();
  const usuarioService = useUsuarioService();
  const [salvando, setSalvando] = useState(false);

  const handleCadastrar = async ({ email, password: senha }: any) => {
    setSalvando(true);

    const { sucesso, mensagem } = await usuarioService.cadastrar({
      email,
      senha,
    });

    if (!sucesso) {
      Alert.alert("Erro", mensagem);
    } else {
      Alert.alert("Cadastro Realizado", mensagem);
      router.push("/(auth)/login");
    }

    setSalvando(false);
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
          initialValues={{
            email: "",
            password: "",
          }}
          onSubmit={handleCadastrar}
        >
          {({ handleChange, handleSubmit, values }) => (
            <View style={styles.formCard}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange("email")}
                  value={values.email}
                  placeholder="seu.email@exemplo.com"
                  placeholderTextColor={"#9ca3af"}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoFocus={true}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Senha</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange("password")}
                  value={values.password}
                  placeholder="••••••••"
                  placeholderTextColor={"#9ca3af"}
                  autoCapitalize="none"
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                onPress={() => handleSubmit()}
                style={[styles.botao, salvando && styles.botaoDesabilitado]}
                disabled={salvando}
              >
                {salvando ? (
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
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f0f2f5",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1f2937",
    marginTop: 10,
  },
  subtitulo: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginTop: 5,
  },
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
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#f9fafb",
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
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  linkContainer: {
    marginTop: 25,
    alignItems: "center",
  },
  linkTexto: {
    fontSize: 14,
    color: "gray",
  },
  linkTextoBold: {
    fontWeight: "bold",
    color: "#10B981",
  },
});
