import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Formik } from "formik";
import { useUsuarioService } from "@/services/usuario";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function LoginPagina() {
  const router = useRouter();
  const usuarioService = useUsuarioService();
  const [erro, setErro] = useState<boolean>(false);

  const handleLogin = async ({ email, password: senha }: any) => {
    const { sucesso } = await usuarioService.entrar(email, senha);

    if (!sucesso) {
      setErro(true);
    }
  };

  return (
    <View style={styles.container}>
      <Formik
        initialValues={{ email: "", password: "" }}
        onSubmit={(dados) => handleLogin(dados)}
      >
        {({ handleBlur, handleChange, handleSubmit }) => (
          <View style={styles.form}>
            <Text style={styles.titulo}>Acessar sua Conta</Text>

            <TextInput
              style={styles.input}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              placeholder="Email"
              placeholderTextColor={"#000000"}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus={true}
            />

            <TextInput
              style={styles.input}
              onChangeText={handleChange("password")}
              placeholder="Senha"
              placeholderTextColor={"#000000"}
              autoCapitalize="none"
              secureTextEntry
            />

            {erro && (
              <Text style={styles.mensagem}>Email ou senha incorretos</Text>
            )}

            <TouchableOpacity
              onPress={() => handleSubmit()}
              style={styles.botao}
            >
              <Text style={styles.botaoTexto}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace("/cadastro")}
              style={styles.botao}
            >
              <Text style={styles.botaoTexto}>Cadastrar</Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  titulo: { fontSize: 22, marginBottom: 20, textAlign: "center" },
  form: { gap: 12 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5 },
  botao: { backgroundColor: "#3B82F6", padding: 15, borderRadius: 5 },
  botaoTexto: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  mensagem: { marginTop: 15, textAlign: "center" },
});
