import { useRelatorioService } from "@/services/relatorio";
import { RelatorioComEspecialista } from "@/types/relatorio";
import { Ionicons } from "@expo/vector-icons";
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
  Platform,
} from "react-native";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";

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
    index,
  }: {
    item: RelatorioComEspecialista;
    index: number;
  }) => (
    <TouchableOpacity
      onPress={() =>
        router.push(`/avaliacao/${avaliacao_id}/relatorios/${relatorio.id}`)
      }
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            Relatório # {String(relatorio.id).padStart(3, "0")}
          </Text>
          <Text style={styles.cardTimestamp}>
            {new Date(relatorio.created_at).toLocaleDateString("pt-BR")}
          </Text>
        </View>
        <View style={styles.especialistaInfo}>
          <Text style={styles.especialistaNome}>
            Dr. {relatorio.ESPECIALISTAS?.nome}{" "}
            {relatorio.ESPECIALISTAS?.sobrenome}
          </Text>
        </View>
        <Text style={styles.cardContent}>"{relatorio.conteudo}"</Text>
      </View>
    </TouchableOpacity>
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
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Relatórios</Text>

        <Menu>
          <MenuTrigger style={styles.headerButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </MenuTrigger>
          <MenuOptions customStyles={optionsStyles}>
            <MenuOption
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingLeft: 10,
              }}
              onSelect={() =>
                router.push(`/avaliacao/${avaliacao_id}/relatorios/cadastrar`)
              }
            >
              <Ionicons name="add" size={24} color="#008C9E" />
              <Text style={styles.menuOptionText}>Novo Relatório</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>

      <FlatList
        data={relatorios}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color="#cbd5e1" />
            <Text style={styles.emptyText}>Nenhum relatório cadastrado.</Text>
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
    backgroundColor: "#F8FAFC", // Fundo cinza claro
  },
  containerCentralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  // Cabeçalho
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
  // Conteúdo da Lista
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  // Seção de Contexto (Header da Lista)
  contextHeader: {
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 10,
  },
  contextText: {
    fontSize: 16,
    color: "#64748b",
  },
  contextBold: {
    fontWeight: "bold",
    color: "#334155",
  },
  // Card do Relatório
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20, // Mais arredondado
    padding: 24,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#008C9E", // Azul Teal
  },
  cardTimestamp: {
    fontSize: 13,
    color: "#9ca3af",
  },
  especialistaInfo: {
    marginBottom: 15,
  },
  especialistaNome: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
  },
  especialistaTitulo: {
    fontSize: 14,
    color: "#64748b",
  },
  cardContent: {
    fontSize: 15,
    color: "#334155",
    fontStyle: "italic",
    lineHeight: 22,
    marginBottom: 20,
  },
  botaoDownload: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    alignSelf: "flex-start", // Alinha o botão à esquerda
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  downloadIcon: {
    marginRight: 8,
  },
  downloadTexto: {
    color: "#008C9E",
    fontWeight: "bold",
    fontSize: 14,
  },
  // Lista Vazia
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: "20%",
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
    marginTop: 10,
    textAlign: "center",
  },
});

const optionsStyles = {
  optionsContainer: {
    borderRadius: 8,
    marginTop: 40,
    width: 200,
  },
};
