import { useRelatorioService } from "@/services/relatorio";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

type Especialista = { id: number; nome: string; sobrenome: string };
type RelatorioComEspecialista = {
  id: number;
  conteudo: string;
  created_at: string;
  ESPECIALISTAS: Especialista | null;
};

export default function ListaRelatorios() {
  const { id: avaliacao_id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const relatorioService = useRelatorioService();
  const [relatorios, setRelatorios] = useState<RelatorioComEspecialista[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!avaliacao_id) return;

    const carregarRelatorios = async () => {
      setCarregando(true);

      const dados = await relatorioService.listar(avaliacao_id);

      setRelatorios(dados);
      setCarregando(false);
    };

    carregarRelatorios();
  }, [avaliacao_id]);

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

      {/* 4. A navegação agora aponta para a rota de detalhe do relatório aninhada */}
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
        <ActivityIndicator size="large" color="#10B981" />
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
      />
      {/* 5. Botão para criar um novo relatório para ESTA avaliação */}
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
