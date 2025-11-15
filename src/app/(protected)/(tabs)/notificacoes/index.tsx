import { useNotificacaoService } from "@/services/notificacao";
import { useEspecialistaStore } from "@/store/especialista";
import { Notificacao } from "@/types/notificacao";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Platform,
} from "react-native";

const getAvatarColor = (nome: string) => {
  const colors = [
    "#00897B",
    "#00BFA5",
    "#FFA000",
    "#F57C00",
    "#1E88E5",
    "#43A047",
  ];
  let hash = 0;
  if (nome.length === 0) return colors[0];
  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const formatarDataNotificacao = (dataString: string) => {
  const data = new Date(dataString);
  const agora = new Date();
  const diffMs = agora.getTime() - data.getTime();
  const diffSeg = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSeg / 60);
  const diffHoras = Math.round(diffMin / 60);
  const diffDias = Math.round(diffHoras / 24);

  if (diffMin < 60)
    return `${data.getHours()}:${String(data.getMinutes()).padStart(2, "0")}`;
  if (diffHoras < 24)
    return `${data.getHours()}:${String(data.getMinutes()).padStart(2, "0")}`;
  if (diffDias === 1) return "Ontem";
  return `${diffDias} dias atrás`;
};

export default function ListaNotificacoes() {
  const router = useRouter();
  const notificacaoService = useNotificacaoService();
  const { especialista } = useEspecialistaStore();

  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [recarregando, setRecarregando] = useState(false);

  const carregarNotificacoes = useCallback(async () => {
    if (!especialista) return;

    try {
      setCarregando(true);

      const dados = await notificacaoService.listar(especialista.id);

      setNotificacoes(dados || []);
    } catch (error) {
      console.error("Erro ao listar as notificações:", error);
    } finally {
      setCarregando(false);
      setRecarregando(false);
    }
  }, [especialista]);

  useEffect(() => {
    setCarregando(true);
    carregarNotificacoes();
  }, [carregarNotificacoes]);

  const handleRecarregar = () => {
    setRecarregando(true);
    carregarNotificacoes();
  };

  const handleNotificationPress = async (notificacao: Notificacao) => {
    if (notificacao.AVALIACOES?.id) {
      router.push(`/notificacoes/${notificacao.id}`);
    }

    if (!notificacao.lida) {
      setNotificacoes((prev) =>
        prev.map((n) => (n.id === notificacao.id ? { ...n, lida: true } : n))
      );

      await notificacaoService.marcarComoLida(notificacao.id);
    }
  };

  const renderItem = ({ item }: { item: Notificacao }) => {
    const timestamp = formatarDataNotificacao(item.created_at);
    const iniciais = `${item.remetente?.nome[0] || ""}${
      item.remetente?.sobrenome?.[0] || ""
    }`.toUpperCase();

    const avatarColor = getAvatarColor(item.remetente?.nome || "S");

    return (
      <TouchableOpacity
        style={[styles.card, !item.lida ? styles.cardNaoLida : styles.cardLida]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{iniciais}</Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.remetenteNome} numberOfLines={1}>
              Dr. {item.remetente?.nome} {item.remetente?.sobrenome}
            </Text>
            <Text style={styles.timestamp}>{timestamp}</Text>
          </View>

          <View style={styles.cardBodyRow}>
            <Text style={styles.conteudoText} numberOfLines={2}>
              {item.conteudo}
            </Text>
            {!item.lida && <View style={styles.statusDot} />}
          </View>

          {item.AVALIACOES?.id && (
            <Text style={styles.cardFooter}>
              Ref. Avaliação: "{item.AVALIACOES.id}"
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (carregando) {
    return (
      <View style={styles.containerCentralizado}>
        <ActivityIndicator size="large" color="#008C9E" />
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

        <Text style={styles.headerTitle}>Notificações</Text>

        <View style={{ width: 40 }}></View>
      </View>

      <FlatList
        data={notificacoes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-off-outline"
              size={60}
              color="#cbd5e1"
            />
            <Text style={styles.emptyText}>
              Você não tem nenhuma notificação.
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={recarregando}
            onRefresh={handleRecarregar}
            colors={["#008C9E"]}
          />
        }
      />
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
  menuOptionText: {
    fontSize: 16,
    padding: 10,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  card: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardLida: {
    backgroundColor: "#FFFFFF",
  },
  cardNaoLida: {
    backgroundColor: "#E0F2F1",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16, // Espaço entre o avatar e o bloco de texto
  },
  avatarText: {
    fontSize: 16, // Tamanho da fonte menor
    fontWeight: "bold",
    color: "#fff",
  },
  cardContent: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  remetenteNome: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    flexShrink: 1,
  },
  timestamp: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 10,
  },
  cardBodyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  conteudoText: {
    fontSize: 14,
    color: "#64748b",
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007AFF",
    marginLeft: 15,
  },
  cardFooter: {
    // Estilo mantido do seu código original
    fontSize: 14,
    color: "gray",
    fontStyle: "italic",
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: "30%",
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
    marginTop: 10,
  },
});
