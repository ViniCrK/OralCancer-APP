import { useRelatorioService } from "@/services/relatorio";
import { RelatorioCompleto } from "@/types/relatorio";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";

export default function DetalheRelatorio() {
  const { relatorioId } = useLocalSearchParams<{ relatorioId: string }>();

  const [relatorio, setRelatorio] = useState<RelatorioCompleto | null>(null);
  const [carregando, setCarregando] = useState(true);

  const relatorioService = useRelatorioService();

  useEffect(() => {
    if (!relatorioId) return;

    const buscarRelatorio = async () => {
      setCarregando(true);

      const relatorio = await relatorioService.buscar(relatorioId as string);

      if (relatorio) {
        setRelatorio(relatorio);
        setCarregando(false);
      }
    };

    buscarRelatorio();
  }, [relatorioId]);

  if (carregando) {
    return (
      <View style={styles.containerCentralizado}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!relatorio) {
    return (
      <View style={styles.containerCentralizado}>
        <Text>Relatório não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Relatório de Avaliação</Text>
        <Text style={styles.subtitulo}>
          Paciente: {relatorio.AVALIACOES?.PACIENTES?.nome ?? "N/A"}{" "}
          {relatorio.AVALIACOES?.PACIENTES?.sobrenome}
        </Text>
      </View>

      <View style={styles.metaInfoContainer}>
        <View>
          <Text style={styles.metaLabel}>Criado por</Text>
          <Text style={styles.metaValue}>
            {relatorio.ESPECIALISTAS?.nome ?? "N/A"}{" "}
            {relatorio.ESPECIALISTAS?.sobrenome}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.metaLabel}>Data de Emissão</Text>
          <Text style={styles.metaValue}>
            {new Date(relatorio.created_at).toLocaleDateString("pt-BR")}
          </Text>
        </View>
      </View>

      <View style={styles.conteudoContainer}>
        <Text style={styles.conteudoLabel}>Conteúdo do Relatório</Text>
        <Text style={styles.conteudoTexto}>{relatorio.conteudo}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  containerCentralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#f8f9fa",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitulo: {
    fontSize: 16,
    color: "#555",
    marginTop: 4,
  },
  metaInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  metaLabel: {
    fontSize: 14,
    color: "gray",
  },
  metaValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  conteudoContainer: {
    padding: 20,
  },
  conteudoLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  conteudoTexto: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
});
