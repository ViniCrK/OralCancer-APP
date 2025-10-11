import { useUsuarioService } from "@/services/usuario";
import { Link } from "expo-router";
import { Formik } from "formik";
import { useState } from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

export default function EsqueciSenha() {
  const usuarioService = useUsuarioService();
  const [salvando, setSalvando] = useState(false);

  const handleRecuperarSenha = async ({ email }: { email: string }) => {
    setSalvando(true);

    const { sucesso, mensagem } = await usuarioService.recuperarSenha(email);

    if (!sucesso) {
      Alert.alert("Erro", mensagem);
    } else {
      Alert.alert("Verifique seu e-mail", mensagem);
    }

    setSalvando(false);
  };
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Recuperar Senha</Text>
      <Text style={styles.subtitulo}>
        Digite seu e-mail para receber o link de recuperação.
      </Text>

      <Formik
        initialValues={{ email: "" }}
        onSubmit={(dados) => handleRecuperarSenha(dados)}
      >
        {({ handleChange, handleSubmit, values }) => (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-mail</Text>

              <TextInput
                style={styles.input}
                placeholder="Digite seu e-mail"
                value={values.email}
                onChangeText={handleChange("email")}
                autoCapitalize="none"
                keyboardType="email-address"
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.botao, salvando && styles.botaoDesabilitado]}
              onPress={() => handleSubmit()}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.botaoTexto}>Enviar Confirmação</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </Formik>

      <Link href="/login" asChild>
        <TouchableOpacity style={{ marginTop: 20 }}>
          <Text style={{ textAlign: "center", color: "#10B981" }}>
            Voltar para o Login
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: "center",
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginBottom: 30,
  },
  form: { padding: 20 },
  inputContainer: { marginBottom: 15 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5 },
  label: { fontSize: 16, color: "#333", marginBottom: 5, fontWeight: "500" },
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
