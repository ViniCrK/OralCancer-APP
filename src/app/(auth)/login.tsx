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
import { useAuth } from "@/context/authContext";
import { useState } from "react";

export default function LoginPagina() {
  const usuarioService = useUsuarioService();
  const { setUsuario } = useAuth();

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
          <View style={styles.formContainer}>
            <Text>Logar Especialista</Text>

            <View style={styles.formInputs}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputTexto}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  placeholder="Email"
                  placeholderTextColor={"#000000"}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoFocus={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputTexto}
                  onChangeText={handleChange("password")}
                  placeholder="Senha"
                  placeholderTextColor={"#000000"}
                  autoCapitalize="none"
                  secureTextEntry
                />
              </View>

              {erro && (
                <Text style={styles.textoErro}>Email ou senha incorretos</Text>
              )}

              <TouchableOpacity
                onPress={() => handleSubmit()}
                style={styles.botao}
              >
                <Text style={styles.textoBotao}>Entrar</Text>
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
  container: {
    paddingTop: 50,
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  form: {
    gap: 10,
    marginBottom: 10,
  },
  input: {
    width: "100%",
    marginBottom: 5,
    padding: 5,
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 240,
    height: 140,
    resizeMode: "contain",
    marginTop: 32,
    marginBottom: 16,
  },
  formContainer: {
    flex: 3,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  titulo: {
    fontSize: 42,
    fontWeight: "medium",
    textAlign: "center",
    paddingVertical: 30,
  },
  formInputs: {
    gap: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    width: 320,
    backgroundColor: "#FFF",
    borderRadius: 10,
    elevation: 10,
  },
  inputIcone: {
    paddingLeft: 10,
  },
  inputTexto: {
    fontSize: 16,
    paddingLeft: 10,
    fontWeight: "regular",
  },
  textoErro: {
    color: "red",
    fontSize: 12,
  },
  botao: {
    alignSelf: "flex-end",
    width: 120,
    padding: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    backgroundColor: "#3B82F6",
    borderRadius: 10,
  },
  textoBotao: {
    alignSelf: "center",
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  rodapeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textoRodape: {
    fontSize: 16,
    color: "#3B82F6",
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
    textDecorationColor: "#2547A0",
  },
});
