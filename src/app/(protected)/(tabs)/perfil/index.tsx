import { useUsuarioService } from "@/services/usuario";
import { useEspecialistaStore } from "@/store/especialista";
import { useRouter } from "expo-router";
import {
  Text,
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useEffect, useState } from "react";
import { useEspecialistaService } from "@/services/especialista";
import { PerfilCompleto } from "@/types/especialista";

const TextoInfo = ({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | null | undefined;
}) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={24} color="#555" style={styles.infoIcon} />
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "Não informado"}</Text>
    </View>
  </View>
);

const BotaoNavegacao = ({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.navButton} onPress={onPress}>
    <Ionicons name={icon} size={22} color="#555" style={styles.navButtonIcon} />
    <Text style={styles.navButtonText}>{label}</Text>
    <Ionicons name="chevron-forward-outline" size={22} color="#ccc" />
  </TouchableOpacity>
);

export default function Perfil() {
  const router = useRouter();
  const { especialista } = useEspecialistaStore();
  const especialistaService = useEspecialistaService();
  const { sair } = useUsuarioService();

  const [dadosPerfil, setDadosPerfil] = useState<PerfilCompleto | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarPerfil = async () => {
      if (!especialista?.id) return;

      try {
        setCarregando(true);

        const dados = await especialistaService.buscar(
          especialista.id as string
        );

        setDadosPerfil(dados);
      } catch (error) {
        console.error(error);
        Alert.alert("Erro", "Erro ao buscar os dados de perfil!");
      } finally {
        setCarregando(false);
      }
    };

    carregarPerfil();
  }, [especialista]);

  const handleSair = async () => {
    Alert.alert("Sair", "Você tem certeza de que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: () => sair(),
      },
    ]);
  };

  if (carregando) {
    return (
      <ActivityIndicator size="large" color="#10B981" style={{ flex: 1 }} />
    );
  }

  if (!dadosPerfil) {
    return (
      <View>
        <Text>Não foi possível carregar o perfil.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <FontAwesome6 name="user-doctor" size={46} color="white" />
        </View>
        <Text style={styles.nome}>
          {dadosPerfil.nome} {dadosPerfil.sobrenome}
        </Text>
        <Text style={styles.email}>{dadosPerfil.email}</Text>
      </View>

      <View style={styles.card}>
        <TextoInfo
          icon="medkit-outline"
          label="Especialidade"
          value={dadosPerfil.ESPECIALIDADES?.nome}
        />
        <TextoInfo
          icon="document-text-outline"
          label="Registro Profissional"
          value={dadosPerfil.registro_profissional}
        />
      </View>

      <View style={styles.actionsContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          <BotaoNavegacao
            icon="pencil-outline"
            label="Editar Perfil"
            onPress={() => router.push("/perfil/editar")}
          />
          <BotaoNavegacao
            icon="mail-outline"
            label="Alterar E-mail"
            onPress={() => router.push("/perfil/alterarEmail")}
          />
          <BotaoNavegacao
            icon="lock-closed-outline"
            label="Alterar Senha"
            onPress={() => router.push("/perfil/alterarSenha")}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>
          <BotaoNavegacao
            icon="information-circle-outline"
            label="Sobre o Aplicativo"
            onPress={() => router.push("/perfil/sobre")}
          />
          <BotaoNavegacao
            icon="document-text-outline"
            label="Termos e Condições"
            onPress={() => router.push("/perfil/termos")}
          />
        </View>

        <TouchableOpacity
          style={[styles.botao, styles.botaoSair]}
          onPress={handleSair}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.botaoTexto}>Sair</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f0f0" },
  header: {
    backgroundColor: "#10B981",
    alignItems: "center",
    padding: 30,
    paddingBottom: 70,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
  },
  nome: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  email: { fontSize: 16, color: "#e0f2f1" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 16,
    marginTop: -40,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoIcon: {
    marginRight: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: "gray",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  actionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "gray",
    paddingVertical: 10,
    paddingHorizontal: 5,
    textTransform: "uppercase",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  navButtonIcon: {
    width: 30,
  },
  navButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  botao: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  botaoSair: {
    backgroundColor: "#e53e3e",
    marginTop: 30,
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
});
