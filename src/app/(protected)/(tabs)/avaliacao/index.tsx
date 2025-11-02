import { Avaliacao, useAvaliacaoService } from "@/services/avaliacao";
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

export default function ListaAvaliacoes() {
  const router = useRouter();
  const avaliacaoService = useAvaliacaoService();
  const [avaliacoes, setAvaliacaoes] = useState<AvaliacaoBreve[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarAvaliacoes = async () => {
    setCarregando(true);

    const dados = await avaliacaoService.listar();

    setAvaliacaoes(dados);
    setCarregando(false);
  };

  useEffect(() => {
    carregarAvaliacoes();
  }, []);

  const renderItem = ({ item: avaliacao }: { item: AvaliacaoBreve }) => (
    <View style={styles.card}>
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

      <Link href={`/avaliacao/${avaliacao.id}`} asChild>
        <TouchableOpacity style={styles.botaoVerMais}>
          <Text style={styles.botaoTexto}>Ver Detalhes</Text>
        </TouchableOpacity>
      </Link>
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
        data={avaliacoes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 50 }}
        ListHeaderComponent={
          <Text style={styles.titulo}>Minhas Avaliações</Text>
        }
        ListEmptyComponent={
          <View style={styles.containerCentralizado}>
            <Text>Nenhuma avaliação cadastrada.</Text>
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
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
