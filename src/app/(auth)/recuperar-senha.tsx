import { supabase } from "@/config/supabase-client";
import { useUsuarioService } from "@/services/usuario";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

export default function RecuperarSenha() {
  const router = useRouter();
  const usuarioService = useUsuarioService();
  const [sessaoValida, setSessaoValida] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessaoValida(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleRedefinirSenha = async ({ novaSenha }: { novaSenha: string }) => {
    setSalvando(true);

    const { sucesso, mensagem } = await usuarioService.redefinirSenha(
      novaSenha
    );

    if (!sucesso) {
      Alert.alert("Erro", mensagem);
    } else {
      Alert.alert("Sucesso", mensagem);
      router.replace("/(auth)/login");
    }

    setSalvando(false);
  };

  if (!sessaoValida) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          Link inválido ou expirado. Por favor, solicite um novo link de
          recuperação.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Crie sua Nova Senha</Text>

      <Formik
        initialValues={{ novaSenha: "" }}
        onSubmit={(dados) => handleRedefinirSenha(dados)}
      >
        {({ handleChange, handleSubmit, values }) => (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nova Senha</Text>

              <TextInput
                style={styles.input}
                placeholder="Digite a nova senha"
                value={values.novaSenha}
                onChangeText={handleChange("novaSenha")}
                secureTextEntry
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
