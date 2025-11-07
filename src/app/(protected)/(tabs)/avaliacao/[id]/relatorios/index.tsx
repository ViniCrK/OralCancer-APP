import { useRelatorioService } from "@/services/relatorio";
import { RelatorioComEspecialista } from "@/types/relatorio";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from "react-native";

export default function ListaRelatorios() {
  const { id: avaliacao_id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const relatorioService = useRelatorioService();

  const [relatorios, setRelatorios] = useState<RelatorioComEspecialista[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [recarregando, setRecarregando] = useState(false);

  const carregarRelatorios = useCallback(async () => {
    if (!avaliacao_id) return;

    try {
      setCarregando(true);

      const dados = await relatorioService.listar(avaliacao_id);

      setRelatorios(dados);
    } catch (error) {
      console.error(
        "Erro ao listar os relatórios da avaliação:",
        error + avaliacao_id
      );
    } finally {
      setCarregando(false);
      setRecarregando(false);
    }
  }, []);

  useEffect(() => {
    setCarregando(true);
    carregarRelatorios();
  }, [carregarRelatorios]);

  const handleRecarregar = () => {
    setRecarregando(true);
    carregarRelatorios();
  };

  const renderItem = ({
    item: relatorio,
  }: {
    item: RelatorioComEspecialista;
  }) => (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Relatório Criado em:</Text>
      <Text style={styles.cardText}>
        {new Date(relatorio.created_at).toLocaleString("pt-BR")}
      </Text>

      <Text style={styles.cardLabel}>Especialista:</Text>
      <Text style={styles.cardText}>
        {relatorio.ESPECIALISTAS?.nome ?? "Não identificado"}{" "}
        {relatorio.ESPECIALISTAS?.sobrenome}
      </Text>

      <Text style={styles.cardLabel}>Conteúdo:</Text>
      <Text style={styles.cardContent} numberOfLines={3}>
        {relatorio.conteudo}
      </Text>

      <TouchableOpacity
        style={styles.botaoVerMais}
        onPress={() =>
          router.push(`/avaliacao/${avaliacao_id}/relatorios/${relatorio.id}`)
        }
      >
        <Text style={styles.botaoTexto}>Ver Detalhes do Relatório</Text>
      </TouchableOpacity>
    </View>
  );

  if (carregando) {
    return (
      <View style={styles.containerCentralizado}>
        <ActivityIndicator size="large" color="#008C9E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={relatorios}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <Text style={styles.titulo}>Relatórios da Avaliação</Text>
        }
        ListEmptyComponent={
          <View style={styles.containerCentralizado}>
            <Text>Nenhum relatório cadastrado para esta avaliação.</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={recarregando}
            onRefresh={handleRecarregar}
          />
        }
      />
      <TouchableOpacity
        style={styles.botaoFlutuante}
        onPress={() =>
          router.push(`/avaliacao/${avaliacao_id}/relatorios/cadastrar`)
        }
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
    padding: 20,
    textAlign: "center",
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
  cardLabel: { fontSize: 14, color: "gray", marginTop: 10 },
  cardText: { fontSize: 16 },
  cardContent: { fontSize: 16, fontStyle: "italic", color: "#555" },
  botaoVerMais: {
    backgroundColor: "#008C9E",
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
    backgroundColor: "#008C9E",
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
