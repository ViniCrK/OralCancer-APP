import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Button,
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useUsuarioService } from "@/services/usuario";
import { Formik } from "formik";
import { useEspecialistaService } from "@/services/especialista";
import { useEspecialistaStore } from "@/store/especialista";

export default function AlterarEmail() {
  const router = useRouter();
  const usuarioService = useUsuarioService();
  const { especialista } = useEspecialistaStore();
  const especialistaService = useEspecialistaService();

  const [salvando, setSalvando] = useState(false);

  const handleAlterarEmail = async ({ novoEmail }: { novoEmail: string }) => {
    setSalvando(true);

    const { sucesso, mensagem } = await usuarioService.alterarEmail(novoEmail);
    await especialistaService.atualizar(especialista?.id as string, {
      email: novoEmail,
    });

    setSalvando(false);

    if (!sucesso) {
      Alert.alert("Erro", mensagem);
    } else {
      Alert.alert(
        "Confirmação Necessária",
        `Enviamos um link de confirmação para o seu NOVO e-mail (${novoEmail}).`
      );
      router.replace("/perfil");
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Alterar E-mail</Text>
      <Formik initialValues={{ novoEmail: "" }} onSubmit={handleAlterarEmail}>
        {({ handleChange, handleBlur, handleSubmit, values }) => (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Novo Endereço de E-mail</Text>

              <TextInput
                style={styles.input}
                placeholder="seunovoemail@exemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={handleChange("novoEmail")}
                onBlur={handleBlur("novoEmail")}
                value={values.novoEmail}
                autoFocus={true}
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
