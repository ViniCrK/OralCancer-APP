import { useUsuarioService } from "@/services/usuario";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { useState } from "react";
import {
  Alert,
  TextInput,
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

export default function AlterarSenha() {
  const router = useRouter();
  const usuarioService = useUsuarioService();

  const [salvando, setSalvando] = useState(false);

  const hanldeAlterarSenha = async ({ novaSenha }: { novaSenha: string }) => {
    setSalvando(true);

    const { sucesso, mensagem } = await usuarioService.alterarSenha(novaSenha);

    if (!sucesso) {
      Alert.alert("Erro", mensagem);
      return;
    } else {
      Alert.alert("Sucesso", mensagem);
      router.replace("/perfil");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Alterar Senha</Text>
      <Formik initialValues={{ novaSenha: "" }} onSubmit={hanldeAlterarSenha}>
        {({ handleChange, handleBlur, handleSubmit, values }) => (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nova Senha</Text>

              <TextInput
                style={styles.input}
                keyboardType="default"
                autoCapitalize="none"
                onChangeText={handleChange("novaSenha")}
                value={values.novaSenha}
                autoFocus={true}
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
                <Text style={styles.botaoTexto}>Salvar Alterações</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f0f0", paddingTop: 20 },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
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
