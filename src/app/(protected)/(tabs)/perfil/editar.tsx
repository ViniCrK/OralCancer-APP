import { supabase } from "@/config/supabase-client";
import { EdicaoPerfilSchema } from "@/schemas/PerfilSchema";
import { useEspecialistaService } from "@/services/especialista";
import { useEspecialistaStore } from "@/store/especialista";
import { DadosPerfil } from "@/types/especialista";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { MaskedTextInput } from "react-native-mask-text";

type InputProps = {
  label: string;
  children: React.ReactNode;
  errorMessage?: string;
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
      <Text style={styles.errorText}>{errorMessage}</Text>
    )}
  </View>
);

export default function EditarPerfil() {
  const router = useRouter();
  const { especialista } = useEspecialistaStore();
  const especialistaService = useEspecialistaService();

  const [initialValues, setInitialValues] = useState<DadosPerfil | null>(null);
  const [especialidades, setEspecialidades] = useState<
    { value: number; label: string }[]
  >([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!especialista?.id) {
      setCarregando(false);
      return;
    }

    const carregarDados = async () => {
      setCarregando(true);

      try {
        const [dadosPerfil, especialidadesData] = await Promise.all([
          especialistaService.buscar(especialista.id),
          supabase.from("ESPECIALIDADES").select("id, nome"),
        ]);

        if (especialidadesData.error) {
          console.error(
            "Erro ao buscar especialidades:",
            especialidadesData.error.message
          );
        } else {
          const dadosFormatados = especialidadesData.data.map((item) => ({
            value: item.id,
            label: item.nome,
          }));

          setEspecialidades(dadosFormatados);
        }

        if (dadosPerfil) {
          setInitialValues({
            nome: dadosPerfil.nome || "",
            sobrenome: dadosPerfil.sobrenome || "",
            registro_profissional: dadosPerfil.registro_profissional || "",
            especialidade_id: dadosPerfil.ESPECIALIDADES?.id || null,
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
  }, [especialista]);

  const handleAlterarDados = async (
    dados: any,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    Alert.alert(
      "Alterar Dados",
      "Você tem certeza de que deseja alterar os seus dados?",
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
              const dadosParaAtualizar = {
                nome: dados.nome,
                sobrenome: dados.sobrenome,
                registro_profissional: dados.registro_profissional,
                especialidade_id: dados.especialidade_id,
              };

              if (!especialista?.id)
                throw new Error("ID do especialista não encontrado.");

              const { sucesso, mensagem } = await especialistaService.atualizar(
                especialista.id,
                dadosParaAtualizar
              );

              if (!sucesso) {
                Alert.alert("Erro", mensagem);
              } else {
                Alert.alert("Sucesso", mensagem);
                router.replace("/(tabs)/perfil");
              }
            } catch (error) {
              console.error("Erro ao atualizar:", error);
              Alert.alert("Erro", "Falha ao salvar as alterações.");
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#008C9E" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
    >
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alterar Meus Dados</Text>
        <View style={{ width: 40 }} />
      </View>

      <Formik
        initialValues={initialValues}
        validationSchema={EdicaoPerfilSchema}
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
              errorMessage={errors.nome as string}
            >
              <TextInput
                value={values.nome}
                placeholder=""
                style={styles.inputText}
                placeholderTextColor="#9ca3af"
                onChangeText={handleChange("nome")}
                onBlur={handleBlur("nome")}
                autoCapitalize="words"
              />
            </FormInput>

            <FormInput
              label="Sobrenome"
              isTouched={touched.sobrenome}
              errorMessage={errors.sobrenome as string}
            >
              <TextInput
                value={values.sobrenome}
                placeholder=""
                style={styles.inputText}
                placeholderTextColor="#9ca3af"
                onChangeText={handleChange("sobrenome")}
                onBlur={handleBlur("sobrenome")}
                autoCapitalize="words"
              />
            </FormInput>

            <FormInput
              label="Especialidade"
              isTouched={touched.especialidade_id}
              errorMessage={errors.especialidade_id as string}
            >
              <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.inputText}
                iconStyle={styles.dropdownIcon}
                data={especialidades}
                valueField={"value"}
                labelField={"label"}
                placeholder="Selecionar"
                value={values.especialidade_id}
                onChange={(item) =>
                  setFieldValue("especialidade_id", item.value)
                }
                onBlur={() => handleBlur("especialidade_id")}
                renderRightIcon={() => {
                  if (values.especialidade_id != null && !isSubmitting) {
                    return (
                      <TouchableOpacity
                        onPress={() => setFieldValue("especialidade_id", null)}
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
              label="Registro Profissional"
              isTouched={touched.registro_profissional}
              errorMessage={errors.registro_profissional as string}
            >
              <MaskedTextInput
                style={styles.inputText}
                mask="AAA-AA 999999"
                onChangeText={(text) => {
                  setFieldValue("registro_profissional", text);
                }}
                onBlur={handleBlur("registro_profissional")}
                value={values.registro_profissional}
                placeholder="EX.: CRM-AL 123456"
                placeholderTextColor="#9ca3af"
                autoCapitalize="characters"
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
    paddingTop: Platform.OS === "android" ? 20 : 0,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? 40 : 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  form: {},
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
    height: 52,
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
  },

  dropdown: {
    height: "100%",
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
