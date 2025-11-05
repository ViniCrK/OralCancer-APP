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
import { PacienteDados } from "@/types/paciente";
import PacienteSchema from "@/schemas/PacienteSchema";
import { Ionicons } from "@expo/vector-icons";

export default function EditarPaciente() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const pacienteService = usePacienteService();

  const [initialValues, setInitialValues] = useState<PacienteDados | null>(
    null
  );
  const [sexos, setSexos] = useState<{ value: number; label: string }[]>([]);

  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!id) return;

    const carregarDados = async () => {
      setCarregando(true);

      try {
        const [dadosPaciente, sexosData] = await Promise.all([
          pacienteService.buscar(id),
          supabase.from("SEXOS").select("id, nome"),
        ]);

        if (sexosData.error) {
          console.error("Erro ao buscar os dados:", sexosData.error.message);
        } else {
          const dadosFormatados = sexosData.data.map((item) => ({
            value: item.id,
            label: item.nome,
          }));

          setSexos(dadosFormatados);
        }

        if (dadosPaciente) {
          setInitialValues({
            nome: dadosPaciente.nome || "",
            sobrenome: dadosPaciente.sobrenome || "",
            data_nascimento: dadosPaciente.data_nascimento
              ? new Date(dadosPaciente.data_nascimento)
              : new Date(),
            registro_hospitalar: dadosPaciente.registro_hospitalar || "",
            sexo_id: dadosPaciente.SEXOS?.id || null,
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados para edição.");
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, [id]);

  const handleAlterarDados = async (
    dados: PacienteDados,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    Alert.alert(
      "Alterar dados",
      "Você tem certeza de que deseja alterar os dados do paciente?",
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => setSubmitting(false),
        },
        {
          text: "Sim",
          style: "default",
          onPress: async () => {
            try {
              const { sucesso, mensagem } = await pacienteService.atualizar(
                id as string,
                dados
              );

              if (!sucesso) {
                Alert.alert("Erro", mensagem);
              } else {
                Alert.alert("Sucesso", mensagem);
                router.replace("/(tabs)/pacientes");
              }
            } catch (error) {
              console.error("Erro ao atualizar paciente:", error);
              Alert.alert("Erro", "Ocorreu uma falha ao salvar as alterações.");
            } finally {
              setSubmitting(false);
            }
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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Formik
        initialValues={initialValues}
        validationSchema={PacienteSchema}
        onSubmit={handleAlterarDados}
        enableReinitialize
      >
        {({
          handleChange,
          handleSubmit,
          setFieldValue,
          values,
          errors,
          touched,
          handleBlur,
          isSubmitting,
        }) => (
          <View style={styles.container}>
            <Text style={styles.titulo}>Editar Paciente</Text>

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
                    touched.sexo_id && errors.sexo_id
                      ? styles.inputError
                      : null,
                  ]}
                  containerStyle={styles.dropdownContainer}
                  placeholderStyle={{ fontSize: 16, color: "gray" }}
                  selectedTextStyle={{ color: "black" }}
                  data={sexos}
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
                style={[styles.botao, isSubmitting && styles.botaoDesabilitado]}
                onPress={() => handleSubmit()}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
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
