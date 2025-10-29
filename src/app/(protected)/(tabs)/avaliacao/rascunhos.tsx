import { useAvaliacaoService } from "@/services/avaliacao";
import { useEspecialistaStore } from "@/store/especialista";
import { AvaliacaoBreve } from "@/types/avaliacao";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";

export default function ListaRascunhos() {
  const router = useRouter();
  const avaliacaoService = useAvaliacaoService();
  const { especialista } = useEspecialistaStore();

  const [rascunhos, setRascunhos] = useState<AvaliacaoBreve[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarRascunhos = async () => {
    if (!especialista?.id) return;

    setCarregando(true);

    const dados = await avaliacaoService.listarRascunhos(especialista.id);

    setRascunhos(dados);
    setCarregando(false);
  };

  useEffect(() => {
    carregarRascunhos();
  }, [especialista]);

  const renderItem = ({ item: avaliacao }: { item: AvaliacaoBreve }) => (
    <View style={styles.cardRascunho}>
      <View style={{ marginTop: 8 }}>
        <Text style={styles.cardLabel}>Paciente:</Text>

        <Text style={styles.cardTitle}>
          {avaliacao.PACIENTES?.nome ?? "Não informado"}{" "}
          {avaliacao.PACIENTES?.sobrenome}
        </Text>
      </View>

      <View style={{ marginTop: 8 }}>
        <Text style={styles.cardLabel}>Especialista:</Text>

        <Text style={styles.cardTitle}>
          {avaliacao.ESPECIALISTAS?.nome ?? "Não informado"}{" "}
          {avaliacao.ESPECIALISTAS?.sobrenome}
        </Text>
      </View>

      <View style={{ marginTop: 8 }}>
        <Text style={styles.cardLabel}>Data da Avaliação:</Text>

        <Text style={styles.cardText}>
          {new Date(avaliacao.created_at).toLocaleDateString("pt-BR")}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.botaoContinuar}
        onPress={() => router.push(`/(tabs)/avaliacao/${avaliacao.id}/editar`)}
      >
        <Text style={styles.botaoTexto}>Continuar Editando</Text>
      </TouchableOpacity>
    </View>
  );

  if (carregando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={rascunhos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 50 }}
        ListHeaderComponent={
          <Text style={styles.titulo}>Avaliações em Rascunho</Text>
        }
        ListEmptyComponent={
          <View style={styles.containerCentralizado}>
            <Text>Nenhuma rascunho encontrado.</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.botaoFlutuante}
        onPress={() => router.push("/avaliacao/cadastrar")}
      >
        <Text style={styles.botaoFlutuanteTexto}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f0f0" },
  containerCentralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  cardRascunho: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
    elevation: 3, // Sombra para Android
    shadowColor: "#000", // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold" },
  cardLabel: { fontSize: 14, color: "gray" },
  cardText: { fontSize: 16, marginTop: 4 },
  botaoVerMais: {
    backgroundColor: "#10B981",
    padding: 12,
    borderRadius: 5,
    marginTop: 16,
    alignItems: "center",
  },
  botaoTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  botaoContinuar: {
    // Estilo específico para o botão de rascunho
    backgroundColor: "#f97316", // Laranja para indicar edição/continuação
    padding: 12,
    borderRadius: 5,
    marginTop: 16,
    alignItems: "center",
  },
  botaoFlutuante: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#10B981",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  botaoFlutuanteTexto: {
    color: "#fff",
    fontSize: 30,
    lineHeight: 32,
  },
});
