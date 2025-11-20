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
  Platform,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import DatePickerInput from "./components/DatePickerInput";
import PacienteSchema from "@/schemas/PacienteSchema";
import { Ionicons } from "@expo/vector-icons";

export default function CadastroPaciente() {
  const router = useRouter();
  const pacienteService = usePacienteService();
  const [sexos, setSexos] = useState<{ value: number; label: string }[]>([]);

  useEffect(() => {
    const buscarSexos = async () => {
      const { data, error } = await supabase.from("SEXOS").select("id, nome");

      if (error) {
        console.error("Erro ao buscar sexos cadastrados:", error.message);
      } else {
        const dadosFormatados = data.map((item) => ({
          value: item.id,
          label: item.nome,
        }));

        setSexos(dadosFormatados);
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
      setSubmitting(false);
    }
  };

  return (
    <>
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Cadastro de Pacientes</Text>

        <View style={{ width: 40 }}></View>
      </View>
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
            <View style={styles.formContent}>
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
                  placeholder=""
                  placeholderTextColor="#9ca3af"
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
                  placeholder=""
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="sentences"
                />
                {touched.sobrenome && errors.sobrenome && (
                  <Text style={styles.errorText}>{errors.sobrenome}</Text>
                )}
              </View>

              <DatePickerInput
                label="Data de Nascimento"
                value={values.data_nascimento}
                onChange={(novaData) =>
                  setFieldValue("data_nascimento", novaData)
                }
                errorMessage={
                  touched.data_nascimento && errors.data_nascimento
                    ? (errors.data_nascimento as string)
                    : undefined
                }
              />

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Sexo</Text>

                <Dropdown
                  style={[
                    styles.dropdown,

                    touched.sexo_id && errors.sexo_id && styles.inputError,
                  ]}
                  containerStyle={styles.dropdownContainer}
                  placeholderStyle={{ fontSize: 16, color: "gray" }}
                  selectedTextStyle={{ color: "black" }}
                  data={sexos}
                  maxHeight={280}
                  valueField={"value"}
                  labelField={"label"}
                  placeholder="Selecione o sexo do paciente"
                  search
                  searchPlaceholder="Sexo"
                  searchField={"label"}
                  value={values.sexo_id}
                  onChange={(sexo) => setFieldValue("sexo_id", sexo.value)}
                  onBlur={() => handleBlur("sexo_id")}
                  renderRightIcon={() => {
                    if (values.sexo_id != null && !isSubmitting) {
                      return (
                        <TouchableOpacity
                          onPress={() => setFieldValue("sexo_id", null)}
                        >
                          <Ionicons
                            name="close-circle"
                            size={22}
                            color="#9ca3af"
                          />
                        </TouchableOpacity>
                      );
                    }

                    return (
                      <Ionicons name="chevron-down" size={22} color="gray" />
                    );
                  }}
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
                  placeholder=""
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />

                {touched.registro_hospitalar && errors.registro_hospitalar && (
                  <Text style={styles.errorText}>
                    {errors.registro_hospitalar}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.botao, isSubmitting && styles.botaoDesabilitado]}
                onPress={() => handleSubmit()}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.botaoTexto}>Salvar</Text>
                )}
              </TouchableOpacity>
              <View style={{ height: 60 }} />
            </View>
          )}
        </Formik>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  customHeader: {
    backgroundColor: "#008C9E",
    paddingTop: Platform.OS === "android" ? 40 : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  formContent: {
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#334155",
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: Platform.OS === "ios" ? 50 : 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  dropdownContainer: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderColor: "#ccc",
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: "#9ca3af",
  },
  dropdownSelectedText: {
    fontSize: 16,
    color: "#000",
  },
  dropdownIcon: {
    width: 20,
    height: 20,
    tintColor: "#64748b",
  },
  inputError: {
    borderColor: "#EF4444",
    borderWidth: 2,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 5,
  },
  botao: {
    backgroundColor: "#008C9E",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#008C9E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  botaoDesabilitado: {
    backgroundColor: "#7DD3FC",
    shadowOpacity: 0.1,
    elevation: 2,
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
