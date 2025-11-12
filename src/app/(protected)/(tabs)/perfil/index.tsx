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
import { useEffect, useState } from "react";
import { useEspecialistaService } from "@/services/especialista";
import { PerfilCompleto } from "@/types/especialista";

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | null | undefined;
}) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={22} color="#008C9E" style={styles.infoIcon} />
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value || "Não informado"}</Text>
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
    <Ionicons
      name={icon}
      size={22}
      color="#64748b"
      style={styles.navButtonIcon}
    />
    <Text style={styles.navButtonText}>{label}</Text>
    <Ionicons name="chevron-forward-outline" size={22} color="#008C9E" />
  </TouchableOpacity>
);

const InfoRowEstatica = ({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) => (
  <View style={styles.navButton}>
    <Ionicons
      name={icon}
      size={22}
      color="#64748b"
      style={styles.navButtonIcon}
    />
    <Text style={styles.navButtonText}>{label}</Text>
    <Text style={styles.infoStaticValue}>{value}</Text>
  </View>
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
      <ActivityIndicator size="large" color="#008C9E" style={{ flex: 1 }} />
    );
  }

  if (!dadosPerfil) {
    return (
      <View>
        <Text>Não foi possível carregar o perfil.</Text>
      </View>
    );
  }

  const iniciais = `${dadosPerfil.nome?.[0] || ""}${
    dadosPerfil.sobrenome?.[0] || ""
  }`.toUpperCase();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Perfil do Usuário</Text>

        <View style={{ width: 40 }}></View>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{iniciais}</Text>
          </View>
          <View style={styles.nameEmailContainer}>
            <Text style={styles.nome}>
              Dr. {dadosPerfil.nome} {dadosPerfil.sobrenome}
            </Text>
            <Text style={styles.email}>{dadosPerfil.email}</Text>
          </View>
        </View>

        <View style={styles.profileDivider} />

        <View style={styles.infoContainer}>
          <InfoRow
            icon="briefcase-outline"
            label="Especialidade"
            value={dadosPerfil.ESPECIALIDADES?.nome}
          />
          <InfoRow
            icon="bag-handle-outline"
            label="Registro Profissional"
            value={dadosPerfil.registro_profissional}
          />
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Configurações</Text>
        <View style={styles.section}>
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
          <BotaoNavegacao
            icon="pencil-outline"
            label="Alterar Meus Dados"
            onPress={() => router.push("/perfil/editar")}
          />
        </View>

        <Text style={styles.sectionTitle}>Informações</Text>
        <View style={styles.section}>
          <BotaoNavegacao
            icon="information-circle-outline"
            label="Sobre o Aplicativo"
            onPress={() => router.push("/perfil/sobre")}
          />
          <InfoRowEstatica
            icon="pricetag-outline"
            label="Versão"
            value="1.0.0"
          />
        </View>

        <TouchableOpacity style={styles.botaoSair} onPress={handleSair}>
          <Text style={styles.botaoSairTexto}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: 20,
  },
  customHeader: {
    paddingTop: 30,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  profileCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16, // Margem nas laterais
    marginTop: 20, // Margem superior
    borderRadius: 16,
    padding: 20, // Padding interno geral
    borderBottomWidth: 5, // Borda na parte inferior
    borderBottomColor: "#008C9E", // Cor Teal
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  profileHeader: {
    // NOVO ESTILO: Container para avatar + nome/email
    flexDirection: "row", // Alinha horizontalmente
    alignItems: "center", // Centraliza verticalmente
    marginBottom: 20, // Espaço antes do divisor
  },
  avatar: {
    width: 65, // Tamanho menor
    height: 65,
    borderRadius: 32.5, // Metade do tamanho para ser um círculo
    backgroundColor: "#008C9E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15, // Espaço entre o avatar e o nome/email
  },
  avatarText: {
    fontSize: 28, // Tamanho da fonte menor
    fontWeight: "bold",
    color: "#fff",
  },
  nameEmailContainer: {
    // NOVO ESTILO: Container para nome e email
    flex: 1, // Ocupa o espaço restante
  },
  nome: {
    fontSize: 18, // Tamanho da fonte menor
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 2, // Menos espaço entre nome e email
  },
  email: {
    fontSize: 14, // Tamanho da fonte menor
    color: "#64748b",
  },
  profileDivider: {
    // NOVO ESTILO: Divisor horizontal
    height: 1,
    backgroundColor: "#e2e8f0", // Cor do divisor
    marginHorizontal: -20, // Estende o divisor pelas bordas do padding do card
    marginBottom: 20, // Espaço depois do divisor
  },
  infoContainer: {
    width: "100%",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8, // Menos padding vertical
  },
  infoIcon: {
    marginRight: 12, // Espaço maior para o ícone
  },
  infoLabel: {
    fontSize: 15,
    color: "#64748b",
    marginRight: 5, // Espaço entre label e valor
  },
  infoValue: {
    fontSize: 15,
    color: "#1e293b",
    fontWeight: "500", // Peso da fonte um pouco menor
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 5,
  },
  actionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  navButtonIcon: {
    width: 30,
  },
  navButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#334155",
  },
  infoStaticValue: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  botaoSair: {
    backgroundColor: "#ef4444",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    elevation: 3,
    shadowColor: "#ef4444",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  botaoSairTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
