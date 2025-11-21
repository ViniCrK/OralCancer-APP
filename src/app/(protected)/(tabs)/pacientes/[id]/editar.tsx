import { supabase } from "@/config/supabase-client";
import { usePacienteService } from "@/services/paciente";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Formik, FormikErrors } from "formik";
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
  Platform,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import DatePickerInput from "../components/DatePickerInput";
import { PacienteDados } from "@/types/paciente";
import PacienteSchema from "@/schemas/PacienteSchema";
import { Ionicons } from "@expo/vector-icons";

type InputProps = {
  label: string;
  children: React.ReactNode;
  errorMessage?: string | string[] | FormikErrors<any> | FormikErrors<any>[];
  isTouched?: boolean;
};
const FormInput = ({
  label,
  children,
  errorMessage,
  isTouched,
}: InputProps) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <View
      style={[
        styles.inputBase,
        isTouched && errorMessage ? styles.inputError : null,
      ]}
    >
      {children}
    </View>
    {isTouched && errorMessage && (
      <Text style={styles.errorText}>{String(errorMessage)}</Text>
    )}
  </View>
);

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
      <ActivityIndicator size="large" color="#008C9E" style={{ flex: 1 }} />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Paciente</Text>
        <View style={{ width: 40 }} />
      </View>

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
          <View style={styles.form}>
            <FormInput
              label="Nome"
              isTouched={touched.nome}
              errorMessage={errors.nome}
            >
              <TextInput
                style={styles.inputText}
                onChangeText={handleChange("nome")}
                onBlur={handleBlur("nome")}
                value={values.nome}
                placeholder="Digite o nome do paciente"
                placeholderTextColor="#9ca3af"
                keyboardType="default"
                autoCapitalize="words"
              />
            </FormInput>

            <FormInput
              label="Sobrenome"
              isTouched={touched.sobrenome}
              errorMessage={errors.sobrenome}
            >
              <TextInput
                style={styles.inputText}
                onChangeText={handleChange("sobrenome")}
                onBlur={handleBlur("sobrenome")}
                value={values.sobrenome}
                placeholder="Digite o sobrenome do paciente"
                placeholderTextColor="#9ca3af"
                keyboardType="default"
                autoCapitalize="sentences"
              />
            </FormInput>

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

            <FormInput
              label="Sexo"
              isTouched={touched.sexo_id}
              errorMessage={errors.sexo_id}
            >
              <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.inputText}
                iconStyle={styles.dropdownIcon}
                data={sexos}
                search
                searchPlaceholder="Sexo"
                searchField={"label"}
                maxHeight={280}
                valueField={"value"}
                labelField={"label"}
                placeholder="Selecionar"
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
            </FormInput>

            <FormInput
              label="Registro Hospitalar"
              isTouched={touched.registro_hospitalar}
              errorMessage={errors.registro_hospitalar}
            >
              <TextInput
                style={styles.inputText}
                onChangeText={handleChange("registro_hospitalar")}
                onBlur={handleBlur("registro_hospitalar")}
                value={values.registro_hospitalar}
                placeholder="Digite o registro hospitalar"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
              />
            </FormInput>

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
        )}
      </Formik>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  customHeader: {
    paddingTop: Platform.OS === "android" ? 20 : 40,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },

  form: {
    paddingVertical: 20,
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

  inputBase: {
    backgroundColor: "#fff",
    borderRadius: 10,
    minHeight: 52,
    paddingHorizontal: 15,
    justifyContent: "center",
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  inputText: {
    fontSize: 16,
    color: "#1e293b",
    padding: 0,
    paddingVertical: 12,
  },

  dropdown: {
    height: 52,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: "#9ca3af",
  },
  dropdownIcon: {
    width: 22,
    height: 22,
    tintColor: "#64748b",
  },
  dropdownContainer: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },

  inputError: {
    borderColor: "#EF4444",
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
    backgroundColor: "#a5f3fc",
    shadowOpacity: 0.1,
    elevation: 2,
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
