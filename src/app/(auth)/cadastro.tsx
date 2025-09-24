import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Formik } from "formik";
import { useState } from "react";
import { useUsuarioService } from "@/services/usuario";
import { useRouter } from "expo-router";

export default function CadastroPagina() {
  const router = useRouter();
  const usuarioService = useUsuarioService();
  const [mensagem, setMensagem] = useState("");

  const handleCadastrar = async ({ email, password: senha }: any) => {
    const { sucesso, mensagem } = await usuarioService.cadastrar({
      email,
      senha,
    });

    setMensagem(mensagem);

    if (sucesso) {
      router.push("/(auth)/login");
    }
  };

  return (
    <View style={styles.container}>
      <Formik
        initialValues={{
          email: "",
          password: "",
        }}
        onSubmit={(dados) => handleCadastrar(dados)}
      >
        {({ handleChange, handleSubmit }) => (
          <View style={styles.container}>
            <Text style={styles.titulo}>Cadastro de Usuário</Text>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                onChangeText={handleChange("email")}
                placeholder="Email"
                placeholderTextColor={"#000000"}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus={false}
              />

              <TextInput
                style={styles.input}
                onChangeText={handleChange("password")}
                placeholder="Senha"
                placeholderTextColor={"#000000"}
                autoCapitalize="none"
                secureTextEntry
              />

              {mensagem && <Text style={styles.mensagem}>{mensagem}</Text>}

              <TouchableOpacity
                onPress={() => handleSubmit()}
                style={styles.botao}
              >
                <Text style={styles.botaoTexto}>Cadastrar</Text>
              </TouchableOpacity>
            </View>
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
