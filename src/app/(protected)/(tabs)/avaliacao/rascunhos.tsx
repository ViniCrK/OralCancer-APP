import { useAvaliacaoService } from "@/services/avaliacao";
import { useEspecialistaStore } from "@/store/especialista";
import { AvaliacaoBreve } from "@/types/avaliacao";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
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

export default function ListaRascunhos() {
  const router = useRouter();
  const avaliacaoService = useAvaliacaoService();
  const { especialista } = useEspecialistaStore();

  const [rascunhos, setRascunhos] = useState<AvaliacaoBreve[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [recarregando, setRecarregando] = useState(false);

  const carregarRascunhos = useCallback(async () => {
    if (!especialista?.id) return;

    try {
      setCarregando(true);

      const dados = await avaliacaoService.listarRascunhos(especialista.id);

      setRascunhos(dados);
    } catch (error) {
      console.error("Erro ao listar as avaliaçãoes em rascunho:", error);
    } finally {
      setCarregando(false);
      setRecarregando(false);
    }
  }, [especialista]);

  useEffect(() => {
    setCarregando(true);
    carregarRascunhos();
  }, [carregarRascunhos]);

  const handleRecarregar = () => {
    setRecarregando(true);
    carregarRascunhos();
  };

  const renderItem = ({ item: avaliacao }: { item: AvaliacaoBreve }) => {
    const pacienteNome = avaliacao.PACIENTES?.nome || "Paciente";
    const pacienteSobrenome = avaliacao.PACIENTES?.sobrenome || "Não Vinculado";
    const nomeCompleto = `${pacienteNome} ${pacienteSobrenome}`;

    const iniciais = `${pacienteNome[0] || "?"}${
      pacienteSobrenome[0] || ""
    }`.toUpperCase();
    const avatarColor = getAvatarColor(pacienteNome);
    const dataCriacao = new Date(avaliacao.created_at).toLocaleDateString(
      "pt-BR"
    );

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/avaliacao/${avaliacao.id}/editar`)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.avatar,
            { backgroundColor: avatarColor, opacity: 0.6 },
          ]}
        >
          <Text style={styles.avatarText}>{iniciais}</Text>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {nomeCompleto}
          </Text>
          <Text style={styles.cardSubtitle}>Rascunho #{avaliacao.id}</Text>
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color="#9ca3af"
                style={styles.metaIcon}
              />
              <Text style={styles.metaText}>Salvo em: {dataCriacao}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.statusTag, { backgroundColor: "#FEF9C3" }]}>
          <Text style={[styles.statusText, { color: "#F97316" }]}>
            Rascunho
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (carregando) {
    return (
      <View style={styles.container}>
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

        <Text style={styles.headerTitle}>Rascunhos</Text>

        <View style={styles.headerButton} />
      </View>

      <FlatList
        data={rascunhos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color="#cbd5e1" />
            <Text style={styles.emptyText}>Nenhum rascunho encontrado.</Text>
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
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: {
    fontSize: 13,
    color: "#9ca3af",
    fontWeight: "500",
  },
  statusTag: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
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
    textAlign: "center",
  },
});
