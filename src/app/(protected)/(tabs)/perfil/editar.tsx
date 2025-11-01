import { supabase } from "@/config/supabase-client";
import { EdicaoPerfilSchema } from "@/schemas/PerfilSchema";
import { useEspecialistaService } from "@/services/especialista";
import { useEspecialistaStore } from "@/store/especialista";
import { DropdownItem } from "@/types/avaliacao";
import { DadosPerfil } from "@/types/especialista";
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
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { MaskedTextInput } from "react-native-mask-text";

export default function EditarPerfil() {
  const router = useRouter();
  const { especialista } = useEspecialistaStore();
  const especialistaService = useEspecialistaService();

  const [initialValues, setInitialValues] = useState<DadosPerfil | null>(null);
  const [especialidades, setEspecialidades] = useState<DropdownItem[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!especialista?.id) return;

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
          setEspecialidades(especialidadesData.data);
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
            const dadosParaAtualizar = {
              nome: dados.nome,
              sobrenome: dados.sobrenome,
              registro_profissional: dados.registro_profissional,
              especialidade_id: dados.especialidade_id,
            };

            if (!especialista?.id) return;

            const { sucesso, mensagem } = await especialistaService.atualizar(
              especialista?.id,
              dadosParaAtualizar
            );

            if (!sucesso) {
              Alert.alert("Erro", mensagem);
            } else {
              Alert.alert("Sucesso", mensagem);
              router.replace("/(tabs)/perfil");
            }

            setSubmitting(false);
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
      <View style={styles.container}>
        <Text style={styles.titulo}>Editar Perfil</Text>

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
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nome</Text>

                <TextInput
                  value={values.nome}
                  placeholder="Nome"
                  style={[
                    styles.input,
                    touched.nome && errors.nome ? styles.inputError : null,
                  ]}
                  onChangeText={handleChange("nome")}
                  onBlur={handleBlur("nome")}
                  autoCapitalize="words"
                />

                {touched.nome && errors.nome && (
                  <Text style={styles.errorText}>{errors.nome}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Sobrenome</Text>

                <TextInput
                  value={values.sobrenome}
                  placeholder="Sobrenome"
                  style={[
                    styles.input,
                    touched.sobrenome && errors.sobrenome
                      ? styles.inputError
                      : null,
                  ]}
                  onChangeText={handleChange("sobrenome")}
                  onBlur={handleBlur("sobrenome")}
                />

                {touched.sobrenome && errors.sobrenome && (
                  <Text style={styles.errorText}>{errors.sobrenome}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Registro Profissional</Text>

                <MaskedTextInput
                  style={[
                    styles.input,
                    touched.registro_profissional &&
                    errors.registro_profissional
                      ? styles.inputError
                      : null,
                  ]}
                  mask="AAA-AA 999999"
                  onChangeText={(text) => {
                    setFieldValue("registro_profissional", text);
                  }}
                  onBlur={handleBlur("registro_profissional")}
                  value={values.registro_profissional}
                  placeholder="EX.: CRM-AL 123456"
                  autoCapitalize="characters"
                />

                {touched.registro_profissional &&
                  errors.registro_profissional && (
                    <Text style={styles.errorText}>
                      {errors.registro_profissional}
                    </Text>
                  )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Especialidade</Text>

                <Dropdown
                  style={[
                    styles.dropdown,
                    touched.especialidade_id && errors.especialidade_id
                      ? styles.inputError
                      : null,
                  ]}
                  containerStyle={styles.dropdownContainer}
                  placeholderStyle={{ fontSize: 16, color: "gray" }}
                  selectedTextStyle={{ color: "black" }}
                  data={especialidades}
                  search
                  searchPlaceholder="Nome da Especialidade"
                  searchField={"label"}
                  maxHeight={280}
                  valueField={"id"}
                  labelField={"nome"}
                  placeholder="Selecione a especialidade"
                  value={values.especialidade_id}
                  onChange={(item) =>
                    setFieldValue("especialidade_id", item.value)
                  }
                  onBlur={() => handleBlur("especialidade_id")}
                />
                {touched.especialidade_id && errors.especialidade_id && (
                  <Text style={styles.errorText}>
                    {errors.especialidade_id}
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
          )}
        </Formik>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: "center" },
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  form: { padding: 20, backgroundColor: "#fff", borderRadius: 10 },
  inputContainer: { marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9fafb",
  },
  label: { fontSize: 16, color: "#333", marginBottom: 5, fontWeight: "500" },
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
  errorText: { color: "#ef4444", fontSize: 12, marginTop: 4 },
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
