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
import { FontAwesome5, Ionicons } from "@expo/vector-icons";

const ActionCard = ({
  iconName,
  iconLib = "Ionicons",
  title,
  onPress,
  color,
}: {
  iconName: string;
  iconLib?: "Ionicons" | "FontAwesome5";
  title: string;
  onPress: () => void;
  color: string;
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
      {iconLib === "Ionicons" ? (
        <Ionicons name={iconName as any} size={28} color={color} />
      ) : (
        <FontAwesome5 name={iconName} size={24} color={color} />
      )}
    </View>
    <Text style={styles.cardTitle}>{title}</Text>
  </TouchableOpacity>
);

export default function PaginaInicial() {
  const router = useRouter();
  const { especialista, setEspecialista } = useEspecialistaStore();
  const [carregando, setCarregando] = useState(true);

  const iniciais = especialista
    ? `${especialista.nome?.[0] || ""}${
        especialista.sobrenome?.[0] || ""
      }`.toUpperCase()
    : "Dr";

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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#008C9E" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{iniciais}</Text>
          </View>
          <View>
            <Text style={styles.welcomeText}>Bem-vindo,</Text>
            <Text style={styles.doctorName}>
              Dr. {especialista?.nome || "Visitante"}
            </Text>
            <Text style={styles.subtitleText}>
              Acompanhe as suas avaliações.
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => router.push("/notificacoes")}
        >
          <Ionicons name="notifications-outline" size={28} color="#64748b" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Ações Essenciais</Text>

      {!especialista ? (
        <TouchableOpacity
          style={styles.ctaCard}
          onPress={() => router.push("/especialista/cadastrar")}
        >
          <Ionicons name="person-add-outline" size={40} color="#fff" />
          <View style={styles.ctaTextContainer}>
            <Text style={styles.ctaTitle}>Crie seu Perfil</Text>
            <Text style={styles.ctaSubtitle}>Comece a usar o app agora.</Text>
          </View>
          <Ionicons name="arrow-forward" size={24} color="#fff" />
        </TouchableOpacity>
      ) : (
        <View style={styles.gridContainer}>
          <ActionCard
            iconName="add"
            title="Nova Avaliação"
            color="#008C9E"
            onPress={() => router.push("/avaliacao/cadastrar")}
          />

          <ActionCard
            iconName="person-add-outline"
            title="Novo Paciente"
            color="#3B82F6"
            onPress={() => router.push("/pacientes/cadastrar")}
          />

          <ActionCard
            iconName="documents-outline"
            title="Avaliações"
            color="#008C9E"
            onPress={() => router.push("/avaliacao")}
          />

          <ActionCard
            iconName="people-outline"
            title="Ver Pacientes"
            color="#6366F1"
            onPress={() => router.push("/pacientes")}
          />

          <ActionCard
            iconName="folder-open-outline"
            title="Ver Rascunhos"
            color="#F97316"
            onPress={() => router.push("/avaliacao/rascunhos")}
          />
          <ActionCard
            iconName="notifications-outline"
            title="Notificações"
            color="#64748b"
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
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 40,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#008C9E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  welcomeText: {
    fontSize: 18,
    color: "#1e293b",
    fontWeight: "600",
  },
  doctorName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
  },
  subtitleText: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  notificationButton: {
    padding: 5,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 5,
    right: 7,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#F8FAFC",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    alignItems: "flex-start",
    justifyContent: "space-between",
    height: 130,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    lineHeight: 22,
  },

  ctaCard: {
    flexDirection: "row",
    backgroundColor: "#008C9E",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#008C9E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  ctaTextContainer: {
    flex: 1,
    marginLeft: 20,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  ctaSubtitle: {
    fontSize: 14,
    color: "#e0f2f1",
    marginTop: 5,
  },
});
