import { supabase } from "@/config/supabase-client";
import { usePacienteService } from "@/services/paciente";
import { useRouter } from "expo-router";
import { Field, Formik } from "formik";
import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import DatePickerInput from "./components/DatePickerInput";

export default function CadastroPaciente() {
  const router = useRouter();
  const pacienteService = usePacienteService();
  const [sexos, setSexos] = useState<{ id: number; nome: string }[]>([]);

  useEffect(() => {
    const buscarSexos = async () => {
      const { data, error } = await supabase.from("SEXOS").select("id, nome");

      if (error) {
        console.error("Erro ao buscar sexos cadastrados:", error.message);
      } else {
        setSexos(data);
      }
    };

    buscarSexos();
  }, []);

  const handleSalvarPaciente = async (dados: any) => {
    try {
      const { sucesso, mensagem } = await pacienteService.cadastrar(dados);

      Alert.alert(sucesso ? "Sucesso" : "Erro", mensagem);

      if (sucesso) {
        router.push("/(tabs)/pacientes");
      }
    } catch (error) {
      console.error("Erro ao cadastrar o paciente:", error);
      Alert.alert(
        "Erro inesperado",
        "Ocorreu um erro ao cadastrar o paciente."
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Formik
        initialValues={{
          nome: "",
          sobrenome: "",
          sexo_id: 0,
          registro_hospitalar: "",
          data_nascimento: new Date(),
        }}
        onSubmit={(dados) => handleSalvarPaciente(dados)}
      >
        {({ handleSubmit, handleChange, setFieldValue, values }) => (
          <View style={styles.container}>
            <Text style={styles.titulo}>Cadastrar Paciente</Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nome</Text>

                <TextInput
                  style={styles.input}
                  onChangeText={handleChange("nome")}
                  placeholder="Digite o nome do paciente"
                  keyboardType="default"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Sobrenome</Text>

                <TextInput
                  style={styles.input}
                  onChangeText={handleChange("sobrenome")}
                  placeholder="Digite o sobrenome do paciente"
                  keyboardType="default"
                  autoCapitalize="sentences"
                />
              </View>

              <DatePickerInput
                label="Date de Nascimento"
                value={values.data_nascimento}
                onChange={(novaData) =>
                  setFieldValue("data_nascimento", novaData)
                }
              />

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Sexo</Text>

                <Dropdown
                  style={styles.dropdown}
                  containerStyle={styles.dropdownContainer}
                  placeholderStyle={{ fontSize: 16, color: "gray" }}
                  selectedTextStyle={{ color: "black" }}
                  data={sexos}
                  search
                  searchPlaceholder="Sexo"
                  searchField={"nome"}
                  maxHeight={280}
                  valueField={"id"}
                  labelField={"nome"}
                  placeholder="Selecione o sexo do paciente"
                  value={values.sexo_id}
                  onChange={(sexo) => setFieldValue("sexo_id", sexo.id)}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Registro Hospitalar</Text>

                <TextInput
                  style={styles.input}
                  onChangeText={handleChange("registro_hospitalar")}
                  placeholder="Digite o registro hospitalar do paciente"
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity
                style={styles.botao}
                onPress={() => handleSubmit()}
              >
                <Text style={styles.botaoTexto}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingTop: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  form: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  checkbox: {
    marginRight: 12,
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: "#ccc",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#333",
  },
  observacoesTexto: {
    height: 80,
    textAlignVertical: "top",
  },
  contador: {
    textAlign: "right",
    color: "#6c757d",
    fontSize: 12,
    marginTop: 4,
  },
  botao: {
    backgroundColor: "#10B981",
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
