import { supabase } from "@/config/supabase-client";
import { useEspecialistaStore } from "@/store/especialista";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ActionCard = ({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Ionicons name={icon} size={40} color="#10B981" />
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

export default function PaginaInicial() {
  const router = useRouter();
  const { especialista, setEspecialista } = useEspecialistaStore();
  const [carregando, setCarregando] = useState(true);

  const verificarEspecialistaExistente = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: especialista, error } = await supabase
        .from("ESPECIALISTAS")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setEspecialista(especialista);
    } catch (error) {
      console.error("erro ao verificar a existência do especialista:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    verificarEspecialistaExistente();
  }, []);

  if (carregando) {
    return (
      <View style={styles.containerCentralizado}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greetingTitle}>
          Olá, {especialista?.nome || "Doutor(a)"}!
        </Text>
        <Text style={styles.greetingSubtitle}>
          O que você gostaria de fazer hoje?
        </Text>
      </View>

      {!especialista ? (
        <TouchableOpacity
          style={styles.ctaCard}
          onPress={() => router.push("/especialista/cadastrar")}
        >
          <Ionicons name="person-add-outline" size={50} color="#fff" />
          <Text style={styles.ctaTitle}>Crie seu Perfil</Text>
          <Text style={styles.ctaSubtitle}>
            É rápido e fácil para começar a usar o app.
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.actionsGrid}>
          <ActionCard
            icon="document-attach-outline"
            title="Nova Avaliação"
            subtitle="Inicie um novo diagnóstico"
            onPress={() => router.push("/avaliacao/cadastrar")}
          />
          <ActionCard
            icon="person-add-outline"
            title="Novo Paciente"
            subtitle="Cadastre um novo paciente"
            onPress={() => router.push("/pacientes/cadastrar")}
          />
          <ActionCard
            icon="documents"
            title="Ver Avaliações"
            subtitle="Consulte a lista de avaliações"
            onPress={() => router.push("/avaliacao")}
          />
          <ActionCard
            icon="people-outline"
            title="Ver Pacientes"
            subtitle="Consulte a lista de pacientes"
            onPress={() => router.push("/pacientes")}
          />
          <ActionCard
            icon="documents-outline"
            title="Reabrir rascunhos"
            subtitle="Finalize suas avaliações"
            onPress={() => router.push("/avaliacao/rascunhos")}
          />
          <ActionCard
            icon="notifications-outline"
            title="Notificações"
            subtitle="Veja suas pendências"
            onPress={() => router.push("/notificacoes")}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  containerCentralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
  },
  header: {
    backgroundColor: "#10B981",
    padding: 30,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  greetingSubtitle: {
    fontSize: 16,
    color: "#e0f2f1",
    marginTop: 4,
  },
  ctaCard: {
    backgroundColor: "#0d9488",
    margin: 16,
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 15,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: "#e0f2f1",
    textAlign: "center",
    marginTop: 5,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "46%",
    marginBottom: 16,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "gray",
    textAlign: "center",
    marginTop: 4,
  },
});
