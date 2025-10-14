import { supabase } from "@/config/supabase-client";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SobreInfo } from "@/types/sobre";

export default function Sobre() {
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
        <ActivityIndicator size="large" color="#10B981" />
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="information-circle-outline" size={60} color="#10B981" />
        <Text style={styles.titulo}>Sobre o Aplicativo</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Descrição</Text>
        <Text style={styles.sectionText}>{info.conteudo}</Text>

        <Text style={styles.sectionTitle}>Versão lançada:</Text>
        <Text style={styles.versionText}>
          {new Date(info.created_at).toLocaleDateString("pt-BR")}
        </Text>
      </View>
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
  },
  header: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#fff",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 10,
    padding: 20,
    marginTop: -20, // Efeito flutuante
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10B981",
    marginTop: 20,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#555",
  },
  versionText: {
    fontSize: 16,
    color: "#555",
    backgroundColor: "#e0f2f1",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
    overflow: "hidden", // para o borderRadius funcionar no iOS
  },
});
