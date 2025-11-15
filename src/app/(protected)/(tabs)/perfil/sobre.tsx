import { supabase } from "@/config/supabase-client";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SobreInfo } from "@/types/sobre";
import { useRouter } from "expo-router";

const InfoRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

export default function Sobre() {
  const router = useRouter();
  const [info, setInfo] = useState<SobreInfo | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarInformacoes = async () => {
      setCarregando(true);

      const { data, error } = await supabase.from("SOBRE").select("*").single();

      if (error) {
        console.error("Erro ao buscar informações do app:", error);
      } else {
        setInfo(data);
      }

      setCarregando(false);
    };

    carregarInformacoes();
  }, []);

  if (carregando) {
    return (
      <View style={styles.containerCentralizado}>
        <ActivityIndicator size="large" color="#008C9E" />
      </View>
    );
  }

  if (!info) {
    return (
      <View style={styles.containerCentralizado}>
        <Text>Não foi possível carregar as informações.</Text>
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
        <Text style={styles.headerTitle}>Sobre o Aplicativo</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="information-circle-outline" size={40} color="#fff" />
        </View>

        <Text style={styles.appName}>OralCancer App</Text>
        <Text style={styles.description}>{info.conteudo}</Text>

        <View style={styles.infoSection}>
          <InfoRow label="Versão" value={"1.0.0"} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © {new Date().getFullYear()} OralCancer App. Todos os direitos
          reservados.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC", // Fundo cinza bem claro
  },
  containerCentralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 20 : 0,
    paddingBottom: 40,
    alignItems: "center", // Centraliza o conteúdo horizontalmente
  },
  // Cabeçalho
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? 40 : 60, // Espaço para status bar
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  // Ícone Central
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#008C9E", // Verde bem claro
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  // Conteúdo Principal
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#64748b",
    textAlign: "left",
    marginTop: 15,
    marginBottom: 30,
    maxWidth: "90%", // Impede que o texto fique muito largo
  },
  // Seção de Informações
  infoSection: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: "#334155",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  infoLink: {
    color: "#008C9E",
    textDecorationLine: "underline",
  },
  // Rodapé
  footer: {
    padding: 20,
    backgroundColor: "#e2e8f0", // Fundo cinza claro
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#64748b",
  },
});
