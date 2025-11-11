import { usePacienteService } from "@/services/paciente";
import { PacienteCompleto } from "@/types/paciente";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TextInput,
} from "react-native";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";

const getAvatarColor = (nome: string) => {
  const colors = [
    "#00897B", // Teal (como na imagem)
    "#00BFA5", // Verde água
    "#FFA000", // Âmbar/Laranja (como na imagem)
    "#F57C00", // Laranja mais escuro
    "#43A047", // Verde
    "#1E88E5", // Azul
  ];
  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function ListaPacientes() {
  const router = useRouter();
  const pacienteService = usePacienteService();

  const [pacientes, setPacientes] = useState<PacienteCompleto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [recarregando, setRecarregando] = useState(false);

  const [termoBusca, setTermoBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("");

  const carregarPacientes = useCallback(
    async (busca: string) => {
      if (!recarregando) {
        setCarregando(true);
      }
      try {
        const dados = await pacienteService.listar(busca);
        setPacientes(dados || []);
      } catch (error) {
        console.error("Erro ao listar os pacientes:", error);
      } finally {
        setCarregando(false);
        setRecarregando(false);
      }
    },
    [pacienteService]
  );

  useEffect(() => {
    carregarPacientes(filtroAtivo);
  }, [filtroAtivo, carregarPacientes]);

  const handleBuscar = () => {
    setFiltroAtivo(termoBusca);
  };

  const handleLimparBusca = () => {
    setTermoBusca("");
    setFiltroAtivo("");
  };

  const handleRecarregar = () => {
    setRecarregando(true);
    handleLimparBusca();
  };

  const renderItem = ({ item: paciente }: { item: PacienteCompleto }) => {
    const avatarColor = getAvatarColor(paciente.nome + paciente.sobrenome);
    const iniciais =
      `${paciente.nome[0]}${paciente.sobrenome[0]}`.toUpperCase();
    const dataNascimento = new Date(
      paciente.data_nascimento
    ).toLocaleDateString("pt-BR");

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/pacientes/${paciente.id}`)}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{iniciais}</Text>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>
            {paciente.nome} {paciente.sobrenome}
          </Text>

          <Text style={styles.cardSubtitle}>
            Registro: {paciente.registro_hospitalar}
          </Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color="#9ca3af"
                style={styles.metaIcon}
              />
              <Text style={styles.metaText}>{dataNascimento}</Text>
            </View>

            <Text style={styles.metaSeparator}>•</Text>

            <View style={styles.metaItem}>
              <Ionicons
                name="person-outline"
                size={14}
                color="#9ca3af"
                style={styles.metaIcon}
              />
              <Text style={styles.metaText}>
                {paciente.SEXOS?.nome ?? "N/A"}
              </Text>
            </View>
          </View>
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
        <View style={{ width: 40 }} />

        <Text style={styles.headerTitle}>Listagem de Pacientes</Text>

        <Menu>
          <MenuTrigger style={styles.menuTrigger}>
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </MenuTrigger>
          <MenuOptions customStyles={optionsStyles}>
            <MenuOption
              style={{ flexDirection: "row", alignItems: "center" }}
              onSelect={() => router.push("/pacientes/cadastrar")}
            >
              <Ionicons name="add" size={24} color="#008C9E" />
              <Text style={styles.menuOptionText}>Adicionar Novo Paciente</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>

      <FlatList
        data={pacientes}
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
                <Ionicons name="search" size={24} color="#008C9E" />
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.containerCentralizado}>
            <Text style={styles.titulo}>
              {filtroAtivo
                ? "Nenhum resultado encontrado."
                : "Nenhum paciente cadastrado."}
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
    backgroundColor: "#F8FAFC", // Fundo cinza bem claro
    paddingBottom: 70,
  },
  containerCentralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  customHeader: {
    backgroundColor: "#008C9E",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: "row", // Alinha itens horizontalmente
    justifyContent: "space-between", // Espaça os itens
    alignItems: "center", // Centraliza verticalmente
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  menuTrigger: {
    padding: 5, // Aumenta a área de toque
    width: 40, // Define uma largura fixa
    alignItems: "flex-end", // Alinha o ícone à direita
  },
  menuOptionText: {
    fontSize: 16,
    padding: 10,
    color: "#333",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20, // Aumentado o espaço superior
    paddingBottom: 80,
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
    width: 50,
    height: 50,
    borderRadius: 25,
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
    color: "#9ca3af", // Cinza claro para metadados
  },
  metaSeparator: {
    marginHorizontal: 8,
    color: "#cbd5e1",
    fontSize: 16,
    lineHeight: 16, // Alinha verticalmente com o texto
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
  },
  botaoFlutuante: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#008C9E", // Mesmo Teal do header
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#008C9E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    height: 52,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 5, // Área de toque maior
  },
  finalSearchButton: {
    borderRadius: 12, // Bordas arredondadas
    width: 48, // Largura fixa
    height: 48, // Altura fixa
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
});

const optionsStyles = {
  optionsContainer: {
    borderRadius: 8,
    marginTop: 40, // Desce o menu para baixo do cabeçalho
    width: 250, // Define uma largura
    elevation: 5,
  },
  optionWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
};
