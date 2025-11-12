import { useAvaliacaoService } from "@/services/avaliacao";
import { AvaliacaoBreve } from "@/types/avaliacao";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  RefreshControl,
  TextInput,
} from "react-native";

const getAvatarColor = (nome: string) => {
  const colors = [
    "#00897B", // Teal
    "#00BFA5", // Verde água
    "#FFA000", // Âmbar/Laranja
    "#F57C00", // Laranja escuro
    "#43A047", // Verde
    "#1E88E5", // Azul
  ];
  let hash = 0;
  if (nome.length === 0) return colors[0];
  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function ListaAvaliacoes() {
  const router = useRouter();
  const avaliacaoService = useAvaliacaoService();

  const [avaliacoes, setAvaliacaoes] = useState<AvaliacaoBreve[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [recarregando, setRecarregando] = useState(false);

  const [termoBusca, setTermoBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("");

  useEffect(() => {
    const carregar = async () => {
      if (!recarregando) {
        setCarregando(true);
      }
      try {
        const dados = await avaliacaoService.listar(filtroAtivo);
        setAvaliacaoes(dados);
      } catch (error) {
        console.error("Erro ao listar as avaliaçãoes:", error);
      } finally {
        setCarregando(false);
        setRecarregando(false);
      }
    };

    carregar();
  }, [filtroAtivo, avaliacaoService]);

  const handleBuscar = () => setFiltroAtivo(termoBusca);

  const handleLimparBusca = () => {
    setTermoBusca("");
    setFiltroAtivo("");
  };

  const handleRecarregar = () => {
    setRecarregando(true);
    handleLimparBusca();
  };

  const renderItem = ({ item: avaliacao }: { item: AvaliacaoBreve }) => {
    const pacienteNome = avaliacao.PACIENTES?.nome || "";
    const pacienteSobrenome = avaliacao.PACIENTES?.sobrenome || "";
    const nomeCompleto = `${pacienteNome} ${pacienteSobrenome}`.trim();

    const avatarColor = getAvatarColor(nomeCompleto);
    const iniciais = `${pacienteNome[0] || ""}${
      pacienteSobrenome[0] || ""
    }`.toUpperCase();

    const dataAvaliacao = new Date(avaliacao.created_at).toLocaleDateString(
      "pt-BR"
    );
    const nomeEspecialista = `Dr. ${avaliacao.ESPECIALISTAS?.nome || "N/A"}`;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/avaliacao/${avaliacao.id}`)}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{iniciais || "?"}</Text>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {nomeCompleto || "Paciente não vinculado"}
          </Text>

          <Text style={styles.cardSubtitle}>Avaliação # {avaliacao.id}</Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color="#9ca3af"
                style={styles.metaIcon}
              />
              <Text style={styles.metaText}>{dataAvaliacao}</Text>
            </View>

            <Text style={styles.metaSeparator}>•</Text>

            <View style={styles.metaItem}>
              <Ionicons
                name="person-outline"
                size={14}
                color="#9ca3af"
                style={styles.metaIcon}
              />
              <Text style={styles.metaText} numberOfLines={1}>
                {nomeEspecialista}
              </Text>
            </View>
          </View>
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
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Avaliações</Text>

        <View style={{ width: 40 }}></View>
      </View>
      <FlatList
        data={avaliacoes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 40 }}
        ListHeaderComponent={
          <>
            <View style={styles.searchBarContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Pesquisar por paciente ou ID..."
                placeholderTextColor="#9ca3af"
                value={termoBusca}
                onChangeText={setTermoBusca}
                autoCapitalize="none"
                returnKeyType="search"
                onSubmitEditing={handleBuscar}
              />
              {termoBusca.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleLimparBusca}
                >
                  <Ionicons name="close-circle" size={24} color="#9ca3af" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.finalSearchButton}
                onPress={handleBuscar}
              >
                <Ionicons name="search" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.containerCentralizado}>
            <Text style={styles.titulo}>
              {filtroAtivo
                ? "Nenhum resultado encontrado."
                : "Nenhuma avaliação cadastrada."}
            </Text>
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
    backgroundColor: "#F8FAFC",
    paddingBottom: 70,
  },
  containerCentralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  customHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: "row", // Alinha itens horizontalmente
    justifyContent: "space-between", // Espaça os itens
    alignItems: "center",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    paddingLeft: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 8, // Área de toque maior
  },
  finalSearchButton: {
    backgroundColor: "#008C9E", // Cor de fundo do botão
    borderRadius: 12, // Bordas arredondadas
    width: 48, // Largura fixa
    height: 48, // Altura fixa
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10, // Espaçamento entre o ícone de fechar e o botão
  },
  card: {
    flexDirection: "row", // Layout horizontal
    backgroundColor: "#FFFFFF",
    borderRadius: 16, // Bordas mais arredondadas
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
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
    flex: 1, // Ocupa o espaço disponível
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b", // Cinza escuro, quase preto
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#64748b", // Cinza médio
    marginBottom: 8,
  },
  cardLabel: { fontSize: 14, color: "gray" },
  cardText: { fontSize: 16, marginTop: 4 },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1, // Permite que o item diminua se o nome for longo
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: {
    fontSize: 13,
    color: "#9ca3af", // Cinza claro para metadados
    fontWeight: "500",
    flexShrink: 1, // Garante que o texto quebre ou diminua
  },
  metaSeparator: {
    marginHorizontal: 8,
    color: "#cbd5e1",
    fontSize: 16,
    lineHeight: 16,
  },
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
