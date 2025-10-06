import { useRelatorioService } from "@/services/relatorio";
import { useEspecialistaStore } from "@/store/especialista";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";

export default function CadastroRelatorio() {
  const router = useRouter();
  const { id: avaliacao_id } = useLocalSearchParams();
  const { especialista } = useEspecialistaStore();
  const relatorioService = useRelatorioService();

  const handleSalvarRelatorio = async (dados: { conteudo: string }) => {
    if (!especialista || !avaliacao_id) {
      Alert.alert(
        "Erro",
        "Não foi possível identificar o especialista ou a avaliação."
      );
      return;
    }

    try {
      const { sucesso, mensagem } = await relatorioService.cadastrar({
        ...dados,
        avaliacao_id: Number(avaliacao_id),
        especialista_id: especialista.id,
      });

      Alert.alert(sucesso ? "Sucesso" : "Erro", mensagem);

      if (sucesso) {
        router.push(`/(tabs)/avaliacao/${avaliacao_id}/relatorios`);
      }
    } catch (error) {
      console.error("Falha ao salvar relatório:", error);
      Alert.alert(
        "Erro inesperado",
        "Ocorreu uma falha ao tentar salvar o relatório"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Formik
        initialValues={{
          conteudo: "",
        }}
        onSubmit={(dados) => handleSalvarRelatorio(dados)}
      >
        {({ handleSubmit, handleChange }) => (
          <View style={styles.container}>
            <Text style={styles.titulo}>Geração de Relatório</Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Conteúdo</Text>

                <TextInput
                  style={styles.input}
                  onChangeText={handleChange("conteudo")}
                  placeholder="Descreva o conteúdo do relatório"
                  keyboardType="default"
                  autoCapitalize="sentences"
                />
              </View>

              <TouchableOpacity
                style={styles.botao}
                onPress={() => handleSubmit()}
              >
                <Text style={styles.botaoTexto}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  form: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  checkbox: {
    marginRight: 12,
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: "#ccc",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#333",
  },
  observacoesTexto: {
    height: 80,
    textAlignVertical: "top",
  },
  contador: {
    textAlign: "right",
    color: "#6c757d",
    fontSize: 12,
    marginTop: 4,
  },
  botao: {
    backgroundColor: "#10B981",
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
