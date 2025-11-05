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

  const renderItem = ({ item: paciente }: { item: PacienteCompleto }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/pacientes/${paciente.id}`)}
    >
      <Text style={styles.cardTitle}>
        {paciente.nome} {paciente.sobrenome}
      </Text>

      <Text style={styles.cardSubtitle}>
        Registro: {paciente.registro_hospitalar}
      </Text>

      <View style={styles.cardInfoContainer}>
        <Text style={styles.cardInfo}>
          Nascimento:{" "}
          {new Date(paciente.data_nascimento).toLocaleDateString("pt-BR")}
        </Text>

        <Text style={styles.cardInfo}>
          Sexo: {paciente.SEXOS?.nome ?? "Não informado"}
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
        data={pacientes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 50 }}
        ListHeaderComponent={
          <>
            <Text style={styles.titulo}>Pacientes</Text>

            <View style={styles.searchBarContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nome ou registro..."
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
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleBuscar}
              >
                <Ionicons name="search" size={20} color="#fff" />
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

      <TouchableOpacity
        style={styles.botaoFlutuante}
        onPress={() => router.push("/pacientes/cadastrar")}
      >
        <Text style={styles.botaoFlutuanteTexto}>+</Text>
      </TouchableOpacity>
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
    paddingTop: 30,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  searchBarContainer: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fff",
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  clearButton: {
    width: 50,
    height: 50,
    backgroundColor: "#9ca3af",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  searchButton: {
    width: 50,
    height: 50,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    elevation: 2,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "gray",
    marginBottom: 10,
  },
  cardInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  cardInfo: {
    fontSize: 14,
    color: "#555",
  },
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
