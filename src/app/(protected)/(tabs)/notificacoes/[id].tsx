import { useNotificacaoService } from "@/services/notificacao";
import { NotificacaoCompleta } from "@/types/notificacao";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";

const TextoDetalhe = ({
  label,
  value,
}: {
  label: string;
  value: string | undefined | null;
}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || "Não informado"}</Text>
  </View>
);

export default function DetalheNotificacao() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const notificacaoService = useNotificacaoService();

  const [notificacao, setNotificacao] = useState<NotificacaoCompleta | null>(
    null
  );
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!id) return;

    const carregarNotificacao = async () => {
      setCarregando(true);

      try {
        const dados = await notificacaoService.buscar(id);

        setNotificacao(dados);
      } catch (error) {
        console.error("Erro ao buscar detalhes da notificação:", error);
      } finally {
        setCarregando(false);
      }
    };

    carregarNotificacao();
  }, [id]);

  if (carregando) {
    return (
      <View style={styles.containerCentralizado}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!notificacao) {
    return (
      <View style={styles.containerCentralizado}>
        <Text>Notificação não encontrada.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Detalhes da Notificação</Text>

        <TextoDetalhe
          label="Enviada por"
          value={`${notificacao.remetente?.nome ?? ""} ${
            notificacao.remetente?.sobrenome ?? ""
          } (${notificacao.remetente?.registro_profissional})`}
        />

        <TextoDetalhe
          label="Data"
          value={new Date(notificacao.created_at).toLocaleString("pt-BR")}
        />

        <TextoDetalhe
          label="Paciente da Avaliação"
          value={`${notificacao.AVALIACOES?.PACIENTES?.nome ?? ""} ${
            notificacao.AVALIACOES?.PACIENTES?.sobrenome ?? ""
          }`}
        />

        <TextoDetalhe
          label="Avaliação"
          value={`${notificacao.AVALIACOES?.id}`}
        />

        <View style={styles.conteudoContainer}>
          <Text style={styles.detailLabel}>Conteúdo</Text>
          <Text style={styles.conteudoTexto}>{notificacao.conteudo}</Text>
        </View>
      </View>

      {notificacao.AVALIACOES?.id && (
        <TouchableOpacity
          style={styles.botao}
          onPress={() =>
            router.push(`/avaliacao/${notificacao.AVALIACOES!.id}`)
          }
        >
          <Text style={styles.botaoTexto}>Ver Avaliação Relacionada</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f0f0", padding: 16 },
  containerCentralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  detailRow: { marginBottom: 15 },
  detailLabel: { fontSize: 14, color: "gray", fontWeight: "500" },
  detailValue: { fontSize: 18, color: "#333" },
  conteudoContainer: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  conteudoTexto: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
    marginTop: 5,
  },
  botao: {
    backgroundColor: "#10B981",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  botaoTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
