import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaskedTextInput } from "react-native-mask-text";
import { Formik } from "formik";
import { useUsuarioService } from "@/services/usuario";
import { useEffect, useState } from "react";
import { supabase } from "@/config/supabase-client";
import { Picker } from "@react-native-picker/picker";

export default function CadastroPagina() {
  const usuarioService = useUsuarioService();
  const [erro, setErro] = useState<boolean>(false);

  const [especialidades, setEspecialidades] = useState<
    { id: number; nome: string }[]
  >([]);

  useEffect(() => {
    const buscarEspecialidades = async () => {
      const { data, error } = await supabase
        .from("ESPECIALIDADES")
        .select("id, nome");

      if (error) {
        console.error("Erro ao buscar as especialidades:", error.message);
      } else {
        setEspecialidades(data);
      }
    };

    buscarEspecialidades();
  }, [especialidades.length]);

  const handleCadastrar = async ({
    email,
    password: senha,
    nome,
    sobrenome,
    registro_profissional,
    especialidade,
  }: any) => {
    const { sucesso } = await usuarioService.cadastrar({
      email,
      senha,
      nome,
      sobrenome,
      registro_profissional,
      especialidade,
    });

    if (!sucesso) {
      setErro(true);
    }
  };

  return (
    <View style={styles.container}>
      <Formik
        initialValues={{
          email: "",
          password: "",
          nome: "",
          sobrenome: "",
          registro_profissional: "",
          especialidade_id: null,
        }}
        onSubmit={(dados) => handleCadastrar(dados)}
      >
        {({ handleChange, handleSubmit, values, setFieldValue }) => (
          <View style={styles.formContainer}>
            <Text>Cadastrar Usuário/Especialista</Text>

            <View style={styles.formInputs}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputTexto}
                  onChangeText={handleChange("email")}
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

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputTexto}
                  onChangeText={handleChange("nome")}
                  placeholder="Nome"
                  placeholderTextColor={"#000000"}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputTexto}
                  onChangeText={handleChange("sobrenome")}
                  placeholder="Sobrenome"
                  placeholderTextColor={"#000000"}
                />
              </View>

              <View style={styles.inputContainer}>
                <MaskedTextInput
                  mask="AAA-AA 999999"
                  onChangeText={(registro_profissional) => {
                    setFieldValue(
                      "registro_profissional",
                      registro_profissional
                    );
                  }}
                  placeholder="EX.: CRM-AL 123456"
                  autoCapitalize="characters"
                />
              </View>

              <Picker
                style={styles.inputContainer}
                selectedValue={values.especialidade_id}
                onValueChange={(especialidade) =>
                  setFieldValue("especialidade_id", especialidade)
                }
              >
                <Picker.Item
                  label="Selecione a sua especialidade"
                  value={null}
                />
                {especialidades.map((especialidade) => (
                  <Picker.Item
                    key={especialidade.id}
                    label={especialidade.nome}
                    value={especialidade.id}
                  />
                ))}
              </Picker>

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
