import { useAvaliacaoService } from "@/services/avaliacao";
import { useEspecialistaStore } from "@/store/especialista";
import { AvaliacaoCompleta } from "@/types/avaliacao";
import { Link } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router/build/hooks";
import { useEffect, useMemo, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Menu,
  MenuTrigger,
  MenuOptions,
  MenuOption,
} from "react-native-popup-menu";

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || "Não informado"}</Text>
  </View>
);

export default function DetalheAvaliacao() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{ id: string }>();
  const { especialista } = useEspecialistaStore();
  const avaliacaoService = useAvaliacaoService();

  const [avaliacao, setAvaliacao] = useState<AvaliacaoCompleta | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [excluindo, setExcluindo] = useState(false);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [imagemSelecionada, setImagemSelecionada] = useState<string | null>(
    null
  );

  const especialistaCriador = especialista?.id === avaliacao?.ESPECIALISTAS?.id;

  useEffect(() => {
    if (!id) return;

    const buscarAvaliacao = async () => {
      setCarregando(true);

      const avaliacao = await avaliacaoService.buscar(id as string);

      if (avaliacao) {
        setAvaliacao(avaliacao);
        setCarregando(false);
      }
    };

    buscarAvaliacao();
  }, [id]);

  const fatoresDeRisco = useMemo(() => {
    if (!avaliacao?.AVALIACAO_FATORES_RISCO) return [];

    return avaliacao.AVALIACAO_FATORES_RISCO.map(
      (rel) => rel.FATORES_RISCO
    ).filter(Boolean);
  }, [avaliacao]);

  const abrirImagem = (url: string) => {
    setImagemSelecionada(url);
    setModalVisivel(true);
  };

  const fecharImagem = () => {
    setModalVisivel(false);
    setImagemSelecionada(null);
  };

  const handleExcluirAvaliacao = async () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Você tem certeza de que deseja excluir esta avaliação? Esta ação não pode ser desfeita.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setExcluindo(true);
            try {
              const { sucesso, mensagem } = await avaliacaoService.excluir(
                id as string
              );

              if (sucesso) {
                Alert.alert("Sucesso", mensagem);
                router.push("/(tabs)/avaliacao");
              } else {
                Alert.alert("Erro", mensagem);
              }
            } catch (error) {
              console.error("Erro ao excluir avaliação:", error);
              Alert.alert(
                "Erro",
                "Ocorreu uma falha inesperada ao tentar excluir."
              );
            } finally {
              setExcluindo(false);
            }
          },
        },
      ]
    );
  };

  if (carregando) {
    return (
      <View style={styles.containerCentralizado}>
        <ActivityIndicator size="large" color="#008C9E" />
      </View>
    );
  }

  if (!avaliacao) {
    return (
      <View style={styles.containerCentralizado}>
        <Text>Avaliação não encontrada.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Avaliação</Text>
        <Menu>
          <MenuTrigger style={styles.headerButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </MenuTrigger>
          <MenuOptions customStyles={optionsStyles}>
            <MenuOption
              onSelect={() => router.push(`/avaliacao/${id}/editar`)}
              disabled={!especialistaCriador}
            >
              <Text
                style={[
                  styles.menuOptionText,
                  !especialistaCriador && styles.menuOptionDisabled,
                ]}
              >
                Editar
              </Text>
            </MenuOption>
            <MenuOption
              onSelect={handleExcluirAvaliacao}
              disabled={!especialistaCriador}
            >
              <Text
                style={[
                  styles.menuOptionText,
                  styles.menuOptionDanger,
                  !especialistaCriador && styles.menuOptionDisabled,
                ]}
              >
                Excluir
              </Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.patientHeader}>
            <View>
              <Text style={styles.patientName}>
                {avaliacao.PACIENTES?.nome} {avaliacao.PACIENTES?.sobrenome}
              </Text>
              <Text style={styles.evaluationId}>Avaliação #{avaliacao.id}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Queixa Principal:</Text>
          <Text style={styles.queixaText}>{avaliacao.queixa_principal}</Text>

          <Text style={styles.sectionTitle}>Observações:</Text>
          <Text style={styles.queixaText}>{avaliacao.observacoes}</Text>
        </View>

        {avaliacao.AVALIACAO_IMAGENS_URL &&
          avaliacao.AVALIACAO_IMAGENS_URL.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Imagem da Lesão</Text>
              <FlatList
                data={avaliacao.AVALIACAO_IMAGENS_URL}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => abrirImagem(item.url)}>
                    <Image
                      source={{ uri: item.url }}
                      style={styles.imagemThumbnail}
                    />
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

        {fatoresDeRisco.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Fatores de Risco Associados</Text>
            <View style={styles.chipContainer}>
              {fatoresDeRisco.map((fator) => (
                <View key={fator!.id} style={styles.chip}>
                  <Text style={styles.chipText}>{fator!.nome}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Detalhes Clínicos</Text>
          <InfoRow
            label="Tamanho"
            value={`${avaliacao.tamanho_aproximado} cm`}
          />
          <InfoRow
            label="Tempo de Evolução"
            value={`${avaliacao.tempo_evolucao} meses`}
          />
          <InfoRow
            label="Aspecto"
            value={`${avaliacao.ASPECTOS_LESAO?.nome}`}
          />
          <InfoRow
            label="Superfície"
            value={`${avaliacao.SUPERFICIES?.nome}`}
          />
          <InfoRow label="Bordas" value={`${avaliacao.BORDAS?.nome}`} />
          <InfoRow
            label="Sintoma Associado"
            value={`${avaliacao.SINTOMAS?.nome}`}
          />
          <InfoRow label="Hábitos" value={avaliacao.HABITOS?.nome} />
          <InfoRow
            label="Carga Tabágica/Etílica"
            value={avaliacao.carga_tabagica_etilica}
          />
          <InfoRow
            label="Linfonodos Regionais"
            value={avaliacao.LINFONODOS?.nome}
          />
          <InfoRow
            label="Histórico Familiar de CA"
            value={avaliacao.historico_familiar_cancer ? "Sim" : "Não"}
          />
          <InfoRow
            label="Classificação de Risco"
            value={avaliacao.CLASSIFICACOES_RISCO?.nome}
          />
          <InfoRow
            label="Conduta Recomendada"
            value={avaliacao.CONDUTAS?.nome}
          />
          <InfoRow
            label="Área de Encaminhamento"
            value={avaliacao.AREAS_ENCAMINHAMENTO?.nome}
          />
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.botaoPrincipal}
            onPress={() => router.push(`/avaliacao/${id}/relatorios/cadastrar`)}
            disabled={excluindo}
          >
            <Ionicons
              name="document-attach-outline"
              size={20}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.botaoPrincipalTexto}>Gerar Relatório</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoSecundario}
            onPress={() => router.push(`/avaliacao/${id}/relatorios`)}
            disabled={excluindo}
          >
            <Ionicons
              name="list-outline"
              size={20}
              color="#008C9E"
              style={styles.buttonIcon}
            />
            <Text style={styles.botaoSecundarioTexto}>Ver Relatórios</Text>
          </TouchableOpacity>

          {especialistaCriador ? (
            <>
              <TouchableOpacity
                style={styles.botaoEditar}
                onPress={() => router.push(`/avaliacao/${id}/editar`)}
                disabled={excluindo}
              >
                <Ionicons
                  name="pencil"
                  size={20}
                  color="#F97316"
                  style={styles.buttonIcon}
                />
                <Text style={styles.botaoEditarTexto}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.botaoExcluir,
                  excluindo && styles.botaoDesabilitado,
                ]}
                onPress={handleExcluirAvaliacao}
                disabled={excluindo}
              >
                {excluindo ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color="#fff"
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.botaoExcluirTexto}>
                      Excluir Avaliação
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <Link
              href={{
                pathname: "/notificacoes/cadastrar",
                params: {
                  avaliacaoId: avaliacao.id,
                  destinatarioId: avaliacao.ESPECIALISTAS?.id,
                },
              }}
              push
              asChild
            >
              <TouchableOpacity
                style={styles.botaoNotificacao}
                disabled={excluindo}
              >
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color="#581c87"
                  style={styles.buttonIcon}
                />
                <Text style={styles.botaoNotificacaoTexto}>
                  Gerar Notificação
                </Text>
              </TouchableOpacity>
            </Link>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={modalVisivel}
        transparent={true}
        animationType="fade"
        onRequestClose={fecharImagem}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.botaoFechar} onPress={fecharImagem}>
            <Ionicons name="close-circle" size={40} color="white" />
          </TouchableOpacity>
          {imagemSelecionada && (
            <Image
              source={{ uri: imagemSelecionada }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
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
  customHeader: {
    backgroundColor: "#008C9E",
    paddingTop: Platform.OS === "android" ? 40 : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  headerButton: {
    padding: 5,
    width: 40,
    alignItems: "center",
  },
  menuOptionText: { fontSize: 16, padding: 10 },
  menuOptionDanger: { color: "#EF4444" },
  menuOptionDisabled: { color: "#9ca3af" },

  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  patientHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  patientName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  evaluationId: {
    fontSize: 14,
    color: "#64748b",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 10,
  },
  queixaText: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 22,
    paddingBottom: 8,
  },
  imagemThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#e0e0e0",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9", // Divisor sutil
  },
  infoLabel: {
    fontSize: 15,
    color: "#64748b", // Cinza médio
  },
  infoValue: {
    fontSize: 15,
    color: "#1e293b", // Cinza escuro
    fontWeight: "500",
  },
  // Botões de Ação
  actionsContainer: {
    padding: 16,
    marginTop: 0,
    paddingTop: 0,
  },
  buttonIcon: {
    marginRight: 10,
  },
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
  botaoPrincipalTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  botaoSecundario: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  botaoSecundarioTexto: {
    color: "#008C9E",
    fontWeight: "bold",
    fontSize: 16,
  },
  botaoEditar: {
    flexDirection: "row",
    backgroundColor: "#FFF7ED", // Fundo laranja claro
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F97316",
  },
  botaoEditarTexto: {
    color: "#F97316", // Laranja
    fontWeight: "bold",
    fontSize: 16,
  },
  botaoNotificacao: {
    flexDirection: "row",
    backgroundColor: "#F3E8FF", // Fundo roxo claro
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#9333ea", // Roxo
  },
  botaoNotificacaoTexto: {
    color: "#581c87", // Roxo escuro
    fontWeight: "bold",
    fontSize: 16,
  },
  botaoExcluir: {
    flexDirection: "row", // Adicionado
    backgroundColor: "#ef4444", // Vermelho
    padding: 15,
    borderRadius: 10, // Arredondado
    alignItems: "center",
    justifyContent: "center", // Adicionado
    marginBottom: 12,
    elevation: 3,
  },
  botaoExcluirTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  botaoDesabilitado: {
    backgroundColor: "#f8b4b4",
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
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "90%",
    height: "80%",
  },
  botaoFechar: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: "#008C9E",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  chipText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});

const optionsStyles = {
  optionsContainer: {
    borderRadius: 8,
    marginTop: 40,
    width: 200,
  },
};
