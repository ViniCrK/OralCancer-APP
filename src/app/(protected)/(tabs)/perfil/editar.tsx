import { supabase } from "@/config/supabase-client";
import { useEspecialistaService } from "@/services/especialista";
import { useEspecialistaStore } from "@/store/especialista";
import { DropdownItem } from "@/types/avaliacao";
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

  const [initialValues, setInitialValues] = useState<any | null>(null);

  const [especialidades, setEspecialidades] = useState<DropdownItem[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!especialista?.id) return;

    const carregarEspecialidades = async () => {
      const { data, error } = await supabase
        .from("ESPECIALIDADES")
        .select("id, nome");

      if (error) {
        console.error("Erro ao buscar as especialidades:", error.message);
      } else {
        setEspecialidades(data);
      }
    };

    const carregarDadosPerfil = async () => {
      setCarregando(true);
      const dadosPerfil = await especialistaService.buscar(
        especialista.id as string
      );

      if (dadosPerfil) {
        setInitialValues({
          nome: dadosPerfil.nome || "",
          sobrenome: dadosPerfil.sobrenome || "",
          registro_profissional: dadosPerfil.registro_profissional || "",
          especialidade_id: dadosPerfil.especialidade_id || null,
        });
      }
      setCarregando(false);
    };

    carregarEspecialidades();
    carregarDadosPerfil();
  }, [especialista]);

  const handleAlterarDados = async (dados: any) => {
    Alert.alert(
      "Alterar Dados",
      "Você tem certeza de que deseja alterar os seus dados?",
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
              registro_profissional: dados.registro_profissional,
              especialidade_id: dados.especialidade_id,
            };

            const { sucesso, mensagem } = await especialistaService.atualizar(
              especialista?.id as string,
              dadosParaAtualizar
            );

            if (!sucesso) {
              Alert.alert("Erro", mensagem);
            } else {
              Alert.alert("Sucesso", mensagem);
              router.replace("/(tabs)/perfil");
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
      <Text style={styles.titulo}>Editar Perfil</Text>

      <Formik
        initialValues={initialValues}
        onSubmit={(dados) => handleAlterarDados(dados)}
        enableReinitialize
      >
        {({ handleChange, handleSubmit, setFieldValue, values }) => (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome</Text>

              <TextInput
                value={values.nome}
                placeholder="Nome"
                style={styles.input}
                onChangeText={handleChange("nome")}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Sobrenome</Text>

              <TextInput
                value={values.sobrenome}
                placeholder="Sobrenome"
                style={styles.input}
                onChangeText={handleChange("sobrenome")}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Registro Profissional</Text>

              <MaskedTextInput
                style={styles.input}
                mask="AAA-AA 999999"
                onChangeText={(registro_profissional) => {
                  setFieldValue("registro_profissional", registro_profissional);
                }}
                value={values.registro_profissional}
                placeholder="EX.: CRM-AL 123456"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Especialidade</Text>

              <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                placeholderStyle={{ fontSize: 16, color: "gray" }}
                selectedTextStyle={{ color: "black" }}
                data={especialidades}
                search
                searchPlaceholder="Nome da Especialidade"
                searchField={"nome"}
                maxHeight={280}
                valueField={"id"}
                labelField={"nome"}
                placeholder="Selecione a especialidade"
                value={values.especialidade_id}
                onChange={(especialidade) =>
                  setFieldValue("especialidade_id", especialidade.id)
                }
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
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5 },
  label: { fontSize: 16, color: "#333", marginBottom: 5, fontWeight: "500" },
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
