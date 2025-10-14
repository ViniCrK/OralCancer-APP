import { supabase } from "@/config/supabase-client";
import { useEspecialistaService } from "@/services/especialista";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { MaskedTextInput } from "react-native-mask-text";

export default function CadastroEspecialista() {
  const router = useRouter();
  const especialistaService = useEspecialistaService();
  const [especialidades, setEspecialidades] = useState<
    { id: number; nome: string }[]
  >([]);
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    const buscarEspecialidades = async () => {
      const { data, error } = await supabase
        .from("ESPECIALIDADES")
        .select("id, nome");

      if (error) {
        console.error(error.message);
      } else {
        setEspecialidades(data);
      }
    };

    buscarEspecialidades();
  }, []);

  const handleCadastrar = async (dados: any) => {
    const { sucesso, mensagem } = await especialistaService.cadastrar(dados);

    setMensagem(mensagem);

    if (sucesso) {
      router.replace("/pagina_inicial");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Cadastro de Especialista</Text>

      <Formik
        initialValues={{
          nome: "",
          sobrenome: "",
          registro_profissional: "",
          especialidade_id: null,
        }}
        onSubmit={(dados) => handleCadastrar(dados)}
      >
        {({ handleChange, handleSubmit, setFieldValue, values }) => (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                placeholder="Nome"
                style={styles.input}
                onChangeText={handleChange("nome")}
                autoCapitalize="sentences"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Sobrenome</Text>
              <TextInput
                placeholder="Sobrenome"
                style={styles.input}
                onChangeText={handleChange("sobrenome")}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Registro Profisional</Text>
              <MaskedTextInput
                style={styles.input}
                mask="AAA-AA 999999"
                onChangeText={(registro_profissional) => {
                  setFieldValue("registro_profissional", registro_profissional);
                }}
                placeholder="EX.: CRM-AL 123456"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Especialidade</Text>

              <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                placeholderStyle={{ fontSize: 16, color: "gray" }}
                selectedTextStyle={{ color: "black" }}
                data={especialidades}
                search
                searchPlaceholder="Nome da Especialidade"
                searchField={"nome"}
                maxHeight={280}
                valueField={"id"}
                labelField={"nome"}
                placeholder="Selecione a especialidade"
                value={values.especialidade_id}
                onChange={(especialidade) =>
                  setFieldValue("especialidade_id", especialidade.id)
                }
              />
            </View>

            <TouchableOpacity
              style={styles.botao}
              onPress={() => handleSubmit()}
            >
              <Text style={styles.botaoTexto}>Criar</Text>
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
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  dropdownContainer: {
    borderStartEndRadius: 10,
    borderEndEndRadius: 10,
  },
  errorText: { color: "red", fontSize: 12, marginTop: 4 },
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
