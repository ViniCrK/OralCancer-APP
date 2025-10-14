import { supabase } from "@/config/supabase-client";
import { usePacienteService } from "@/services/paciente";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import DatePickerInput from "../components/DatePickerInput";
import { MaskedTextInput } from "react-native-mask-text";

export default function EditarPaciente() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const pacienteService = usePacienteService();

  const [initialValues, setInitialValues] = useState<any | null>(null);

  const [sexos, setSexos] = useState<{ id: number; nome: string }[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const buscarSexos = async () => {
      const { data, error } = await supabase.from("SEXOS").select("id, nome");

      if (error) {
        console.error("Erro ao buscar sexos cadastrados:", error.message);
      } else {
        setSexos(data);
      }
    };

    const carregarPaciente = async () => {
      setCarregando(true);

      const paciente = await pacienteService.buscar(id as string);

      if (paciente) {
        setInitialValues({
          ...paciente,
          data_nascimento: paciente.data_nascimento
            ? new Date(paciente.data_nascimento)
            : new Date(),
        });
      }

      setCarregando(false);
    };

    buscarSexos();
    carregarPaciente();
  }, [id]);

  const handleAlterarDados = async (dados: any) => {
    Alert.alert(
      "Alterar dados",
      "Você tem certeza de que deseja alterar os dados do paciente?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim",
          style: "default",
          onPress: async () => {
            setSalvando(true);

            const dadosParaAtualizar = {
              nome: dados.nome,
              sobrenome: dados.sobrenome,
              data_nascimento: dados.data_nascimento,
              registro_hospitalar: dados.registro_hospitalar,
              sexo_id: dados.sexo_id,
            };

            const { sucesso, mensagem } = await pacienteService.atualizar(
              id as string,
              dadosParaAtualizar
            );

            if (!sucesso) {
              Alert.alert("Erro", mensagem);
            } else {
              Alert.alert("Sucesso", mensagem);
              router.replace("/pacientes");
            }

            setSalvando(false);
          },
        },
      ]
    );
  };

  if (carregando || !initialValues) {
    return (
      <ActivityIndicator size="large" color="#10B981" style={{ flex: 1 }} />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Editar Paciente</Text>

      <Formik
        initialValues={initialValues}
        onSubmit={(dados) => handleAlterarDados(dados)}
        enableReinitialize
      >
        {({ handleChange, handleSubmit, setFieldValue, values }) => (
          <View style={styles.container}>
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nome</Text>

                <TextInput
                  style={styles.input}
                  onChangeText={handleChange("nome")}
                  value={values.nome}
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
                  value={values.sobrenome}
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

                <MaskedTextInput
                  style={styles.input}
                  mask="999999999"
                  onChangeText={(registro_hospitalar) => {
                    setFieldValue("registro_hospitalar", registro_hospitalar);
                  }}
                  value={values.registro_hospitalar}
                  placeholder="EX.: 123456789"
                  keyboardType="numeric"
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
          </View>
        )}
      </Formik>
    </ScrollView>
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
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
  },
  label: { fontSize: 16, color: "#333", marginBottom: 5, fontWeight: "500" },
  dropdown: {
    backgroundColor: "#fff",
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
