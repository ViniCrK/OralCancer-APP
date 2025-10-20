import { usePacienteService } from "@/services/paciente";
import { PacienteCompleto } from "@/types/paciente";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";

export default function ListaPacientes() {
  const router = useRouter();
  const pacienteService = usePacienteService();
  const [pacientes, setPacientes] = useState<PacienteCompleto[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarPacientes = async () => {
      setCarregando(true);

      const dados = await pacienteService.listar();

      setPacientes(dados);
      setCarregando(false);
    };

    carregarPacientes();
  }, []);

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
        ListHeaderComponent={<Text style={styles.titulo}>Pacientes</Text>}
        ListEmptyComponent={
          <View style={styles.botaoFlutuante}>
            <Text>Nenhum paciente cadastrado.</Text>
          </View>
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
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
    color: "#333",
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
