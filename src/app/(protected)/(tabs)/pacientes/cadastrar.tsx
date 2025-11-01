import { supabase } from "@/config/supabase-client";
import { usePacienteService } from "@/services/paciente";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import DatePickerInput from "./components/DatePickerInput";
import PacienteSchema from "@/schemas/PacienteSchema";

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

  const handleSalvarPaciente = async (
    dados: any,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
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
    } finally {
      setSubmitting(false); // Garante que o estado de submissão é resetado
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Formik
        initialValues={{
          nome: "",
          sobrenome: "",
          sexo_id: null,
          registro_hospitalar: "",
          data_nascimento: new Date(),
        }}
        validationSchema={PacienteSchema}
        onSubmit={handleSalvarPaciente}
      >
        {({
          handleSubmit,
          handleChange,
          setFieldValue,
          values,
          errors,
          touched,
          handleBlur,
          isSubmitting,
        }) => (
          <View style={styles.container}>
            <Text style={styles.titulo}>Cadastrar Paciente</Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nome</Text>

                <TextInput
                  style={[
                    styles.input,
                    touched.nome && errors.nome ? styles.inputError : null,
                  ]}
                  onChangeText={handleChange("nome")}
                  onBlur={handleBlur("nome")}
                  value={values.nome}
                  placeholder="Digite o nome do paciente"
                  keyboardType="default"
                  autoCapitalize="words"
                />

                {touched.nome && errors.nome && (
                  <Text style={styles.errorText}>{errors.nome}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Sobrenome</Text>

                <TextInput
                  style={[
                    styles.input,
                    touched.sobrenome && errors.sobrenome
                      ? styles.inputError
                      : null,
                  ]}
                  onChangeText={handleChange("sobrenome")}
                  onBlur={handleBlur("sobrenome")}
                  value={values.sobrenome}
                  placeholder="Digite o sobrenome do paciente"
                  keyboardType="default"
                  autoCapitalize="sentences"
                />

                {touched.sobrenome && errors.sobrenome && (
                  <Text style={styles.errorText}>{errors.sobrenome}</Text>
                )}
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
                  style={[
                    styles.dropdown,
                    touched.sexo_id && errors.sexo_id
                      ? styles.inputError
                      : null,
                  ]}
                  containerStyle={styles.dropdownContainer}
                  placeholderStyle={{ fontSize: 16, color: "gray" }}
                  selectedTextStyle={{ color: "black" }}
                  data={sexos}
                  search
                  searchPlaceholder="Sexo"
                  searchField={"label"}
                  maxHeight={280}
                  valueField={"id"}
                  labelField={"nome"}
                  placeholder="Selecione o sexo do paciente"
                  value={values.sexo_id}
                  onChange={(sexo) => setFieldValue("sexo_id", sexo.value)}
                  onBlur={() => handleBlur("sexo_id")}
                />

                {touched.sexo_id && errors.sexo_id && (
                  <Text style={styles.errorText}>{errors.sexo_id}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Registro Hospitalar</Text>

                <TextInput
                  style={[
                    styles.input,
                    touched.registro_hospitalar && errors.registro_hospitalar
                      ? styles.inputError
                      : null,
                  ]}
                  onChangeText={handleChange("registro_hospitalar")}
                  onBlur={handleBlur("registro_hospitalar")}
                  value={values.registro_hospitalar}
                  placeholder="Digite o registro hospitalar do paciente"
                  keyboardType="numeric"
                />
                {touched.registro_hospitalar && errors.registro_hospitalar && (
                  <Text style={styles.errorText}>
                    {errors.registro_hospitalar}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.botao, isSubmitting && styles.botaoDesabilitado]} // 9. Usar isSubmitting
                onPress={() => handleSubmit()}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.botaoTexto}>Salvar Paciente</Text>
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
  scrollContainer: { flexGrow: 1, justifyContent: "center", paddingTop: 20 },
  container: { flex: 1, padding: 20, backgroundColor: "#f0f0f0" },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  form: { backgroundColor: "#fff", padding: 20, borderRadius: 10 },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 16, color: "#333", marginBottom: 5, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9fafb",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#f9fafb",
    height: 50,
  },
  dropdownContainer: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderColor: "#ccc",
  },
  inputError: {
    borderColor: "#ef4444",
    borderWidth: 2,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  botao: {
    backgroundColor: "#10B981",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  botaoDesabilitado: { backgroundColor: "#a0d8c5" },
  botaoTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
