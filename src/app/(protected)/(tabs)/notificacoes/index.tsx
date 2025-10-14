import { useNotificacaoService } from "@/services/notificacao";
import { useEspecialistaStore } from "@/store/especialista";
import { Notificacao } from "@/types/notificacao";
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
} from "react-native";

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

      const dados = await notificacaoService.listar(especialista.id as string);

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

  const renderItem = ({ item }: { item: Notificacao }) => (
    <TouchableOpacity
      style={[styles.card, !item.lida && styles.cardNaoLida]}
      onPress={() => handleNotificationPress(item)}
    >
      {!item.lida && <View style={styles.unreadDot} />}
      <View style={styles.cardContent}>
        <Text style={styles.cardHeader}>
          Nova notificação de{" "}
          <Text style={styles.boldText}>
            {item.remetente?.nome ?? "Sistema"} {item.remetente?.sobrenome}
          </Text>
        </Text>
        <Text style={styles.cardBody}>{item.conteudo}</Text>
        {item.AVALIACOES?.id && (
          <Text style={styles.cardFooter}>
            Ref. Avaliação: "{item.AVALIACOES.id}"
          </Text>
        )}
        <Text style={styles.cardTimestamp}>
          {new Date(item.created_at).toLocaleString("pt-BR")}
        </Text>
      </View>
    </TouchableOpacity>
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
        data={notificacoes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={<Text style={styles.titulo}>Notificações</Text>}
        ListEmptyComponent={
          <View style={styles.containerCentralizado}>
            <Text>Você não tem nenhuma notificação.</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={recarregando}
            onRefresh={handleRecarregar}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  containerCentralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardNaoLida: {
    backgroundColor: "#e0f2f1", // Um tom de verde bem claro
    borderLeftWidth: 5,
    borderLeftColor: "#10B981",
    paddingLeft: 15,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    fontSize: 16,
    color: "#555",
  },
  boldText: {
    fontWeight: "bold",
    color: "#333",
  },
  cardBody: {
    fontSize: 15,
    marginVertical: 8,
  },
  cardFooter: {
    fontSize: 14,
    color: "gray",
    fontStyle: "italic",
  },
  cardTimestamp: {
    fontSize: 12,
    color: "gray",
    marginTop: 10,
    textAlign: "right",
  },
});
