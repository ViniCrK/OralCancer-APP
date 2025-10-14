import { usePacienteService } from "@/services/paciente";
import { PacienteCompleto } from "@/types/paciente";
import calcularIdade from "@/utils/calcularIdade";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

const TextoDetalhe = ({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || "Não informado"}</Text>
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
        <ActivityIndicator size="large" color="#10B981" />
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerName}>
          {paciente.nome} {paciente.sobrenome}
        </Text>
        <Text style={styles.headerSubtitle}>
          Registro Hospitalar: {paciente.registro_hospitalar}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informações Pessoais</Text>
        <TextoDetalhe
          label="Data de Nascimento"
          value={new Date(paciente.data_nascimento).toLocaleDateString("pt-BR")}
        />
        <TextoDetalhe
          label="Idade"
          value={`${calcularIdade(paciente.data_nascimento)} anos`}
        />
        <TextoDetalhe label="Sexo" value={paciente.SEXOS?.nome} />
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.botao}
          onPress={() => router.push(`/(tabs)/pacientes/${paciente_id}/editar`)}
        >
          <Text style={styles.botaoTexto}>Editar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  },
  header: {
    backgroundColor: "#10B981",
    padding: 20,
    paddingTop: 40,
  },
  headerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#e0f2f1",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    margin: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "gray",
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
  },
  actionsContainer: {
    paddingHorizontal: 16,
  },
  botao: {
    backgroundColor: "#0d9488",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  botaoExcluir: {
    backgroundColor: "#e53e3e",
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
