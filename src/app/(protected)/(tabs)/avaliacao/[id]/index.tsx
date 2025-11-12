import { Avaliacao, useAvaliacaoService } from "@/services/avaliacao";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const GridItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) => (
  <View style={styles.gridItem}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || "Não informado"}</Text>
  </View>
);

const TextoDetalhe = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || "Não informado"}</Text>
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
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Detalhes da Avaliação #{avaliacao.id}
        </Text>

        <TextoDetalhe
          label="Paciente"
          value={`${avaliacao.PACIENTES?.nome ?? ""} ${
            avaliacao.PACIENTES?.sobrenome ?? ""
          }`}
        />
        <TextoDetalhe
          label="Especialista"
          value={`${avaliacao.ESPECIALISTAS?.nome ?? ""} ${
            avaliacao.ESPECIALISTAS?.sobrenome ?? ""
          }`}
        />
        <TextoDetalhe
          label="Data da Avaliação"
          value={new Date(avaliacao.created_at).toLocaleDateString("pt-BR")}
        />

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Características da Lesão</Text>
          <View style={styles.gridContainer}>
            <GridItem
              label="Tamanho"
              value={`${avaliacao.tamanho_aproximado} cm`}
            />
            <GridItem
              label="Evolução"
              value={`${avaliacao.tempo_evolucao} meses`}
            />
            <GridItem label="Aspecto" value={avaliacao.ASPECTOS_LESAO?.nome} />
            <GridItem label="Superfície" value={avaliacao.SUPERFICIES?.nome} />
            <GridItem label="Bordas" value={avaliacao.BORDAS?.nome} />
            <GridItem label="Sintomas" value={avaliacao.SINTOMAS?.nome} />
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Fatores Associados</Text>
          <View style={styles.gridContainer}>
            <GridItem
              label="Hábito Principal"
              value={avaliacao.HABITOS?.nome}
            />
            <GridItem
              label="Carga Tabágica/Etílica"
              value={avaliacao.carga_tabagica_etilica}
            />
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Avaliação Clínica</Text>
          <View style={styles.gridContainer}>
            <GridItem label="Linfonodos" value={avaliacao.LINFONODOS?.nome} />
            <GridItem
              label="Classificação de Risco"
              value={avaliacao.CLASSIFICACOES_RISCO?.nome}
            />
          </View>
          <TextoDetalhe
            label="Conduta Recomendada"
            value={avaliacao.CONDUTAS?.nome}
          />
          <TextoDetalhe
            label="Área de Encaminhamento"
            value={avaliacao.AREAS_ENCAMINHAMENTO?.nome}
          />
        </View>

        {avaliacao.observacoes && (
          <View style={styles.sectionContainer}>
            <TextoDetalhe label="Observações" value={avaliacao.observacoes} />
          </View>
        )}
      </View>

      {avaliacao?.AVALIACAO_IMAGENS_URL &&
        avaliacao.AVALIACAO_IMAGENS_URL.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Imagens da Lesão</Text>
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

      <View style={styles.botoesContainer}>
        <TouchableOpacity
          style={styles.botao}
          onPress={() => router.push(`/avaliacao/${id}/relatorios/cadastrar`)}
          disabled={excluindo}
        >
          <Text style={styles.botaoTexto}>Gerar Relatório</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botao, styles.botaoSecundario]}
          onPress={() => router.push(`/avaliacao/${id}/relatorios`)}
          disabled={excluindo}
        >
          <Text style={styles.botaoTexto}>Ver Relatórios</Text>
        </TouchableOpacity>

        {especialistaCriador ? (
          <>
            <TouchableOpacity
              style={[styles.botao, styles.botaoEditar]}
              onPress={() => router.push(`/(tabs)/avaliacao/${id}/editar`)}
            >
              <Text style={styles.botaoTexto}>Editar Avaliação</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.botao,
                styles.botaoExcluir,
                excluindo && styles.botaoDesabilitado,
              ]}
              onPress={handleExcluirAvaliacao}
              disabled={excluindo}
            >
              {excluindo ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.botaoTexto}>Excluir Avaliação</Text>
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
            asChild
          >
            <TouchableOpacity style={styles.botaoEditar}>
              <Text style={styles.botaoTexto}>Gerar Notificação</Text>
            </TouchableOpacity>
          </Link>
        )}
      </View>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f0f0", padding: 16 },
  containerCentralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },
  gridItem: {
    width: "50%",
    paddingHorizontal: 5,
    marginBottom: 15,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "gray",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 18,
    color: "#333",
  },
  botoesContainer: {
    margin: 10,
  },
  botao: {
    backgroundColor: "#008C9E",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  botaoSecundario: {
    backgroundColor: "#0d9488",
  },
  botaoEditar: {
    backgroundColor: "#f97316",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 100,
  },
  botaoExcluir: {
    backgroundColor: "#e53e3e",
  },
  botaoDesabilitado: {
    backgroundColor: "#f8b4b4",
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  imagemThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#e0e0e0",
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
  sectionContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#008C9E",
    marginBottom: 10,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: "#e0f2f1",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  chipText: {
    color: "#0d9488",
    fontSize: 14,
    fontWeight: "500",
  },
});
