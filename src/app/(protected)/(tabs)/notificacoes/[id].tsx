import { useNotificacaoService } from "@/services/notificacao";
import { NotificacaoCompleta } from "@/types/notificacao";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string | undefined | null;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || "Não informado"}</Text>
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
        <ActivityIndicator size="large" color="#008C9E" />
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
    <View style={styles.container}>
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Notificação</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="notifications-circle-outline"
              size={40}
              color="#008C9E"
            />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.cardTitle}>Nova Mensagem</Text>
              <Text style={styles.timestamp}>
                {new Date(notificacao.created_at).toLocaleString("pt-BR")}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <InfoRow
            label="Enviada por"
            value={`Dr. ${notificacao.remetente?.nome ?? ""} ${
              notificacao.remetente?.sobrenome ?? ""
            }`}
          />

          {notificacao.remetente?.registro_profissional && (
            <InfoRow
              label="Registro"
              value={notificacao.remetente.registro_profissional}
            />
          )}

          <InfoRow
            label="Paciente"
            value={`${notificacao.AVALIACOES?.PACIENTES?.nome ?? ""} ${
              notificacao.AVALIACOES?.PACIENTES?.sobrenome ?? ""
            }`}
          />

          <View style={styles.conteudoContainer}>
            <Text style={styles.conteudoLabel}>Conteúdo</Text>
            <Text style={styles.conteudoTexto}>"{notificacao.conteudo}"</Text>
          </View>
        </View>

        {notificacao.AVALIACOES?.id && (
          <TouchableOpacity
            style={styles.botao}
            onPress={() =>
              router.push(`/avaliacao/${notificacao.AVALIACOES!.id}`)
            }
          >
            <Ionicons
              name="document-text-outline"
              size={20}
              color="#fff"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.botaoTexto}>Ver Avaliação Relacionada</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  containerCentralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  customHeader: {
    backgroundColor: "#008C9E",
    paddingTop: Platform.OS === "android" ? 40 : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  headerButton: {
    padding: 5,
    width: 40,
    alignItems: "center",
  },
  scrollContent: {
    padding: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#334155",
  },
  timestamp: {
    fontSize: 13,
    color: "#9ca3af",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 15,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 15,
    color: "#64748b",
  },
  infoValue: {
    fontSize: 15,
    color: "#334155",
    fontWeight: "500",
  },

  conteudoContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  conteudoLabel: {
    fontSize: 14,
    color: "#008C9E",
    fontWeight: "bold",
    marginBottom: 5,
    textTransform: "uppercase",
  },
  conteudoTexto: {
    fontSize: 16,
    lineHeight: 24,
    color: "#475569",
    fontStyle: "italic",
  },

  botao: {
    backgroundColor: "#008C9E",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#008C9E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
