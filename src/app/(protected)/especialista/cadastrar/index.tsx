import { supabase } from "@/config/supabase-client";
import { useEspecialistaService } from "@/services/especialista";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { MaskedTextInput } from "react-native-mask-text";

export default function CadastroEspecialista() {
  const router = useRouter();
  const especialistaService = useEspecialistaService();
  const [especialidades, setEspecialidades] = useState<
    { id: number; nome: string }[]
  >([]);
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    const buscarEspecialidades = async () => {
      const { data, error } = await supabase
        .from("ESPECIALIDADES")
        .select("id, nome");

      if (error) {
        console.error(error.message);
      } else {
        setEspecialidades(data);
      }
    };

    buscarEspecialidades();
  }, []);

  const handleCadastrar = async (dados: any) => {
    const { sucesso, mensagem } = await especialistaService.cadastrar(dados);

    setMensagem(mensagem);

    if (sucesso) {
      router.replace("/(tabs)/pagina_inicial");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Cadastro de Especialista</Text>

      <Formik
        initialValues={{
          nome: "",
          sobrenome: "",
          registro_profissional: "",
          especialidade_id: null,
        }}
        onSubmit={(dados) => handleCadastrar(dados)}
      >
        {({ handleChange, handleSubmit, setFieldValue, values }) => (
          <View style={styles.form}>
            <TextInput
              placeholder="Nome"
              style={styles.input}
              onChangeText={handleChange("nome")}
            />

            <TextInput
              placeholder="Sobrenome"
              style={styles.input}
              onChangeText={handleChange("sobrenome")}
            />

            <MaskedTextInput
              style={styles.input}
              mask="AAA-AA 999999"
              onChangeText={(registro_profissional) => {
                setFieldValue("registro_profissional", registro_profissional);
              }}
              placeholder="EX.: CRM-AL 123456"
              autoCapitalize="characters"
            />

            <Picker
              selectedValue={values.especialidade_id}
              onValueChange={(especialidade) =>
                setFieldValue("especialidade_id", especialidade)
              }
            >
              <Picker.Item label="Selecione a especialidade" value={null} />
              {especialidades.map((especialidade) => (
                <Picker.Item
                  key={especialidade.id}
                  label={especialidade.nome}
                  value={especialidade.id}
                />
              ))}
            </Picker>

            {mensagem && <Text style={styles.mensagem}>{mensagem}</Text>}

            <TouchableOpacity
              style={styles.botao}
              onPress={() => handleSubmit()}
            >
              <Text style={styles.botaoTexto}>Salvar</Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  titulo: { fontSize: 22, marginBottom: 20, textAlign: "center" },
  form: { gap: 12 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5 },
  botao: { backgroundColor: "#10B981", padding: 15, borderRadius: 5 },
  botaoTexto: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  mensagem: { marginTop: 15, textAlign: "center" },
});
