import { supabase } from "@/config/supabase-client";
import CadastroEspecialistaSchema from "@/schemas/EspecialistaSchema";
import { useEspecialistaService } from "@/services/especialista";
import { useRouter } from "expo-router";
import { Formik } from "formik";
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
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { MaskedTextInput } from "react-native-mask-text";

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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.titulo}>Cadastro de Especialista</Text>

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
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nome</Text>
                <TextInput
                  placeholder="Nome"
                  style={[
                    styles.input,
                    touched.nome && errors.nome ? styles.inputError : null,
                  ]}
                  onChangeText={handleChange("nome")}
                  onBlur={handleBlur("nome")}
                  value={values.nome}
                  autoCapitalize="words"
                />
                {touched.nome && errors.nome && (
                  <Text style={styles.errorText}>{errors.nome}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Sobrenome</Text>
                <TextInput
                  placeholder="Sobrenome"
                  style={[
                    styles.input,
                    touched.sobrenome && errors.sobrenome
                      ? styles.inputError
                      : null,
                  ]}
                  onChangeText={handleChange("sobrenome")}
                  onBlur={handleBlur("sobrenome")}
                  value={values.sobrenome}
                  autoCapitalize="sentences"
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
                  onChangeText={(text, rawText) => {
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
                  maxHeight={280}
                  valueField={"value"}
                  labelField={"label"}
                  placeholder="Selecione a especialidade"
                  search
                  searchPlaceholder="Nome da Especialidade"
                  searchField={"label"}
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
                  <Text style={styles.botaoTexto}>Criar</Text>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
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
  form: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  inputContainer: { marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
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
    marginTop: 20,
  },
  botaoDesabilitado: { backgroundColor: "#a0d8c5" },
  botaoTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
