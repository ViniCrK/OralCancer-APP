import { supabase } from "@/config/supabase-client";
import CadastroEspecialistaSchema from "@/schemas/EspecialistaSchema";
import { useEspecialistaService } from "@/services/especialista";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Formik, FormikErrors } from "formik";
import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { MaskedTextInput } from "react-native-mask-text";

type InputProps = {
  label: string;
  children: React.ReactNode;
  errorMessage?: string | string[] | FormikErrors<any>;
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

export default function CadastroEspecialista() {
  const router = useRouter();
  const especialistaService = useEspecialistaService();
  const [especialidades, setEspecialidades] = useState<
    { value: number; label: string }[]
  >([]);

  useEffect(() => {
    const buscarEspecialidades = async () => {
      const { data, error } = await supabase
        .from("ESPECIALIDADES")
        .select("id, nome");

      if (error) {
        console.error(error.message);
      } else {
        const dadosFormatados = data.map((item) => ({
          value: item.id,
          label: item.nome,
        }));

        setEspecialidades(dadosFormatados);
      }
    };

    buscarEspecialidades();
  }, []);

  const handleCadastrar = async (
    dados: any,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    const { sucesso, mensagem } = await especialistaService.cadastrar(dados);

    if (!sucesso) {
      Alert.alert("Erro ao cadastrar", mensagem);
    } else {
      Alert.alert("Sucesso", "Seu perfil foi criado com sucesso.");
      router.replace("/(tabs)/pagina_inicial");
    }

    setSubmitting(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cadastro de Especialista</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Formik
          initialValues={{
            nome: "",
            sobrenome: "",
            registro_profissional: "",
            especialidade_id: null,
          }}
          validationSchema={CadastroEspecialistaSchema}
          onSubmit={handleCadastrar}
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
                  placeholder="Seu nome"
                  placeholderTextColor="#9ca3af"
                  style={styles.inputText}
                  onChangeText={handleChange("nome")}
                  onBlur={handleBlur("nome")}
                  value={values.nome}
                  autoCapitalize="words"
                />
              </FormInput>

              <FormInput
                label="Sobrenome"
                isTouched={touched.sobrenome}
                errorMessage={errors.sobrenome}
              >
                <TextInput
                  placeholder="Seu sobrenome"
                  placeholderTextColor="#9ca3af"
                  style={styles.inputText}
                  onChangeText={handleChange("sobrenome")}
                  onBlur={handleBlur("sobrenome")}
                  value={values.sobrenome}
                  autoCapitalize="words"
                />
              </FormInput>

              <FormInput
                label="Registro Profissional"
                isTouched={touched.registro_profissional}
                errorMessage={errors.registro_profissional}
              >
                <MaskedTextInput
                  style={styles.inputText}
                  mask="AAA-AA 999999"
                  onChangeText={(text) =>
                    setFieldValue("registro_profissional", text)
                  }
                  onBlur={handleBlur("registro_profissional")}
                  value={values.registro_profissional}
                  placeholder="EX.: CRM-AL 123456"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="characters"
                />
              </FormInput>

              <FormInput
                label="Especialidade"
                isTouched={touched.especialidade_id}
                errorMessage={errors.especialidade_id}
              >
                <Dropdown
                  style={styles.dropdown}
                  containerStyle={styles.dropdownContainer}
                  placeholderStyle={styles.dropdownPlaceholder}
                  selectedTextStyle={styles.inputText}
                  iconStyle={styles.dropdownIcon}
                  data={especialidades}
                  search
                  searchPlaceholder="Buscar..."
                  searchField={"label"}
                  maxHeight={280}
                  valueField={"value"}
                  labelField={"label"}
                  placeholder="Selecione sua especialidade"
                  value={values.especialidade_id}
                  onChange={(item) =>
                    setFieldValue("especialidade_id", item.value)
                  }
                  onBlur={() => handleBlur("especialidade_id")}
                  renderRightIcon={() => {
                    if (values.especialidade_id && !isSubmitting) {
                      return (
                        <TouchableOpacity
                          onPress={() =>
                            setFieldValue("especialidade_id", null)
                          }
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
                      <Ionicons name="chevron-down" size={22} color="#64748b" />
                    );
                  }}
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
                  <Text style={styles.botaoTexto}>Criar Perfil</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC", // Fundo cinza claro
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  // Cabeçalho Customizado
  customHeader: {
    backgroundColor: "#008C9E", // Teal
    paddingTop: Platform.OS === "android" ? 40 : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  headerButton: {
    padding: 5,
    width: 40,
    alignItems: "center",
  },
  // Formulário
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
  // Estilo base do input (Card branco elevado)
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
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 5,
  },
  // Dropdown Styles
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
  // Botão
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
