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

  const renderItem = ({ item: avaliacao }: { item: AvaliacaoBreve }) => (
    <View style={styles.card}>
      <View style={{ marginTop: 8 }}>
        <Text style={styles.cardLabel}>Paciente:</Text>

        <Text style={styles.cardTitle}>
          {avaliacao.PACIENTES?.nome ?? "Não informado"}{" "}
          {avaliacao.PACIENTES?.sobrenome} -{" "}
          {avaliacao.PACIENTES?.registro_hospitalar}
        </Text>
      </View>

      <View style={{ marginTop: 8 }}>
        <Text style={styles.cardLabel}>Especialista:</Text>

        <Text style={styles.cardTitle}>
          {avaliacao.ESPECIALISTAS?.nome ?? "Não informado"}{" "}
          {avaliacao.ESPECIALISTAS?.sobrenome}
        </Text>
      </View>

      <View style={{ marginTop: 8 }}>
        <Text style={styles.cardLabel}>Data da Avaliação:</Text>

        <Text style={styles.cardText}>
          {new Date(avaliacao.created_at).toLocaleDateString("pt-BR")}
        </Text>
      </View>

      <Link href={`/avaliacao/${avaliacao.id}`} asChild>
        <TouchableOpacity style={styles.botaoVerMais}>
          <Text style={styles.botaoTexto}>Ver Detalhes</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );

  if (carregando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#008C9E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={avaliacoes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 50 }}
        ListHeaderComponent={
          <>
            <Text style={styles.titulo}>Minhas Avaliações</Text>

            <View style={styles.searchBarContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Nome ou registro do paciente..."
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

      <TouchableOpacity
        style={styles.botaoFlutuante}
        onPress={() => router.push("/avaliacao/cadastrar")}
      >
        <Text style={styles.botaoFlutuanteTexto}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f0f0" },
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
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
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
    backgroundColor: "#008C9E",
    justifyContent: "center",
    alignItems: "center",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    elevation: 2,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
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
  cardTitle: { fontSize: 18, fontWeight: "bold" },
  cardLabel: { fontSize: 14, color: "gray" },
  cardText: { fontSize: 16, marginTop: 4 },
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
