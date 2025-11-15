import { usePacienteService } from "@/services/paciente";
import { PacienteCompleto } from "@/types/paciente";
import calcularIdade from "@/utils/calcularIdade";
import { Ionicons } from "@expo/vector-icons";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
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

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || "Não informado"}</Text>
  </View>
);

export default function DetalhePaciente() {
  const router = useRouter();
  const { id: paciente_id } = useLocalSearchParams<{ id: string }>();
  const pacienteService = usePacienteService();
  const [paciente, setPaciente] = useState<PacienteCompleto | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!paciente_id) return;

    const carregarPaciente = async () => {
      setCarregando(true);

      try {
        const dados = await pacienteService.buscar(paciente_id);

        setPaciente(dados);
      } catch (error) {
        console.error("Erro ao buscar os dados do paciente:", error);
        Alert.alert("Erro", "não foi possível carregar os dados do paciente.");
      } finally {
        setCarregando(false);
      }
    };

    carregarPaciente();
  }, [paciente_id]);

  if (carregando) {
    return (
      <View style={styles.containerCentralizado}>
        <ActivityIndicator size="large" color="#008C9E" />
      </View>
    );
  }

  if (!paciente) {
    return (
      <View style={styles.containerCentralizado}>
        <Text>Paciente não encontrado.</Text>
      </View>
    );
  }

  const nomeCompleto = `${paciente.nome} ${paciente.sobrenome}`;
  const iniciais = `${paciente.nome[0] || ""}${
    paciente.sobrenome[0] || ""
  }`.toUpperCase();
  const avatarColor = getAvatarColor(paciente.nome);

  return (
    <View style={styles.container}>
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Detalhes do Paciente</Text>

        <View style={{ width: 40 }}></View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarHeader}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{iniciais}</Text>
          </View>
          <Text style={styles.headerName}>{nomeCompleto}</Text>
          <Text style={styles.headerSubtitle}>
            Reg. Hospitalar: {paciente.registro_hospitalar}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <Ionicons name="person-circle-outline" size={24} color="#64748b" />
            <Text style={styles.cardTitle}>Dados Pessoais</Text>
          </View>
          <InfoRow
            label="Data de Nascimento"
            value={new Date(paciente.data_nascimento).toLocaleDateString(
              "pt-BR"
            )}
          />
          <InfoRow
            label="Idade"
            value={`${calcularIdade(paciente.data_nascimento)} anos`}
          />
          <InfoRow label="Sexo" value={paciente.SEXOS?.nome} />
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <Ionicons name="document-text-outline" size={22} color="#64748b" />
            <Text style={styles.cardTitle}>Histórico de Avaliações</Text>
          </View>

          {!paciente.AVALIACOES || paciente.AVALIACOES.length === 0 ? (
            <Text style={styles.listaVazia}>
              Nenhuma avaliação encontrada para este paciente.
            </Text>
          ) : (
            paciente.AVALIACOES.map((avaliacao) => (
              <Link
                href={`/avaliacao/${avaliacao.id}`}
                key={avaliacao.id}
                asChild
              >
                <TouchableOpacity style={styles.linkItem}>
                  <Ionicons
                    name="document-attach-outline"
                    size={20}
                    color="#008C9E"
                  />
                  <Text style={styles.linkItemText}>
                    Avaliação #{avaliacao.id}
                  </Text>
                  <Text style={styles.linkItemData}>
                    {new Date(avaliacao.created_at).toLocaleDateString("pt-BR")}
                  </Text>
                  <Ionicons
                    name="chevron-forward-outline"
                    size={20}
                    color="#ccc"
                  />
                </TouchableOpacity>
              </Link>
            ))
          )}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.botao}
            onPress={() => router.push(`/pacientes/${paciente_id}/editar`)}
          >
            <Ionicons
              name="pencil-outline"
              size={20}
              color="#fff"
              style={styles.iconBotao}
            />
            <Text style={styles.botaoTexto}>Editar Paciente</Text>
          </TouchableOpacity>
        </View>
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
  // --- CABEÇALHO CUSTOMIZADO ---
  customHeader: {
    backgroundColor: "#008C9E",
    paddingTop: Platform.OS === "android" ? 40 : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: "row", // Alinha itens horizontalmente
    justifyContent: "space-between", // Espaça os itens
    alignItems: "center", // Centraliza verticalmente
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  menuButton: {
    padding: 5,
  },

  // --- CONTEÚDO ---
  scrollContent: {
    paddingBottom: 40,
  },
  // Avatar Header (agora parte do scroll)
  avatarHeader: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#fff", // Fundo branco
    borderBottomLeftRadius: 30, // Curva na parte inferior
    borderBottomRightRadius: 30,
    marginBottom: 20,
    // Sombra leve para separar do fundo cinza
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 4, // Borda branca ao redor do avatar
    borderColor: "#fff",
    marginTop: -10, // Ajuste visual
  },
  avatarText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
  },
  headerName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e293b",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 4,
  },

  // ... (Seus estilos de card, infoRow, actionsContainer, botões permanecem os mesmos) ...
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 15,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#334155",
    marginLeft: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  infoLabel: { fontSize: 15, color: "gray" },
  infoValue: { fontSize: 15, color: "#334155", fontWeight: "500" },
  listaVazia: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
    paddingVertical: 10,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  linkItemText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
    fontWeight: "500",
  },
  linkItemData: {
    fontSize: 14,
    color: "gray",
    marginHorizontal: 10,
  },
  actionsContainer: { padding: 16 },
  botaoPrincipal: {
    flexDirection: "row",
    backgroundColor: "#008C9E",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    elevation: 3,
  },
  botaoPrincipalTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  botaoSecundario: {
    flexDirection: "row",
    backgroundColor: "#e0f2f1",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  botaoSecundarioTexto: { color: "#008C9E", fontWeight: "bold", fontSize: 16 },
  botao: {
    flexDirection: "row",
    backgroundColor: "#008C9E",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    elevation: 3,
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  iconBotao: { marginRight: 10 },
});
