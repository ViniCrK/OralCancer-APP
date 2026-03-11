import { useAvaliacaoService } from "@/services/avaliacao";
import { useEspecialistaStore } from "@/store/especialista";
import { AvaliacaoCompleta } from "@/types/avaliacao";
import { Link } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router/build/hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Menu,
  MenuTrigger,
  MenuOptions,
  MenuOption,
} from "react-native-popup-menu";
import { supabase } from "@/config/supabase-client";
import { Formik } from "formik";

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
    null,
  );

  const [modalEstadiamentoVisivel, setModalEstadiamentoVisivel] =
    useState(false);

  const especialistaCriador = especialista?.id === avaliacao?.ESPECIALISTAS?.id;

  const buscarAvaliacao = useCallback(async () => {
    setCarregando(true);
    try {
      // 1. Busca a avaliação normalmente pelo service
      const dados = await avaliacaoService.buscar(id as string);

      if (dados) {
        // 2. BUSCA DIRETA E SEGURA DO ESTADIAMENTO
        const { data: estadiamentoDb, error: estError } = await supabase
          .from("ESTADIAMENTOS")
          .select("*, ESPECIALISTAS(nome, sobrenome)")
          .eq("avaliacao_id", id)
          .maybeSingle(); // maybeSingle retorna 1 objeto ou null (nunca array)

        if (estError) {
          console.error(
            "Erro ao buscar estadiamento diretamente:",
            estError.message,
          );
        }

        // Anexa o estadiamento encontrado aos dados da avaliação
        dados.ESTADIAMENTOS = estadiamentoDb || null;
      }

      setAvaliacao(dados);
    } catch (error) {
      console.error("Erro ao buscar avaliação:", error);
    } finally {
      setCarregando(false);
    }
  }, [id, avaliacaoService]);

  useEffect(() => {
    if (id) buscarAvaliacao();
  }, [buscarAvaliacao, id]);

  const fatoresDeRisco = useMemo(() => {
    if (!avaliacao?.AVALIACAO_FATORES_RISCO) return [];

    return avaliacao.AVALIACAO_FATORES_RISCO.map(
      (rel) => rel.FATORES_RISCO,
    ).filter(Boolean);
  }, [avaliacao]);

  const metastases = useMemo(() => {
    if (!avaliacao?.AVALIACAO_METASTASES) return [];

    return avaliacao.AVALIACAO_METASTASES.map((rel) => rel.METASTASES).filter(
      Boolean,
    );
  }, [avaliacao]);

  const localizacoes = useMemo(() => {
    if (!avaliacao?.AVALIACAO_LOCALIZACOES) return [];

    return avaliacao.AVALIACAO_LOCALIZACOES.map(
      (rel: any) => rel.LOCALIZACOES_INTRAORAIS,
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
                id as string,
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
                "Ocorreu uma falha inesperada ao tentar excluir.",
              );
            } finally {
              setExcluindo(false);
            }
          },
        },
      ],
    );
  };

  const estadiamentoData = avaliacao?.ESTADIAMENTOS || null;

  const handleSalvarEstadiamento = async (
    values: any,
    { setSubmitting }: any,
  ) => {
    if (!especialista) return;

    setSubmitting(true);
    try {
      const payload = {
        avaliacao_id: Number(id),
        especialista_id: especialista.id,
        tnm_clinico: values.tnm_clinico,
        tnm_patologico: values.tnm_patologico,
      };

      if (estadiamentoData?.id) {
        // Atualiza
        const { error } = await supabase
          .from("ESTADIAMENTOS")
          .update(payload)
          .eq("id", estadiamentoData.id);
        if (error) throw error;
      } else {
        // Cria
        const { error } = await supabase.from("ESTADIAMENTOS").insert(payload);
        if (error) throw error;
      }

      Alert.alert("Sucesso", "Estadiamento salvo com sucesso!");
      setModalEstadiamentoVisivel(false);
      buscarAvaliacao(); // Recarrega para exibir
    } catch (error: any) {
      console.error("Erro ao salvar estadiamento:", error);
      Alert.alert(
        "Erro",
        `Não foi possível salvar o estadiamento: ${error.message}`,
      );
    } finally {
      setSubmitting(false);
    }
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
          <Text style={styles.queixaText}>
            {avaliacao.queixa_principal || "Não informado"}
          </Text>

          <Text style={styles.sectionTitle}>Observações:</Text>
          <Text style={styles.queixaText}>
            {avaliacao.observacoes || "Não informado"}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.headerComBotao}>
            <Text style={styles.sectionTitle}>Estadiamento (TNM)</Text>

            {estadiamentoData && (
              <TouchableOpacity
                onPress={() => setModalEstadiamentoVisivel(true)}
              >
                <Ionicons name="pencil" size={20} color="#008C9E" />
              </TouchableOpacity>
            )}
          </View>

          {estadiamentoData ? (
            <>
              <InfoRow
                label="Estadiamento Clínico (TNM)"
                value={estadiamentoData.tnm_clinico}
              />
              <InfoRow
                label="Estadiamento Patológico (pTNM)"
                value={estadiamentoData.tnm_patologico}
              />
              <Text style={styles.autorEstadiamento}>
                Preenchido por: Dr(a). {estadiamentoData.ESPECIALISTAS?.nome}{" "}
                {estadiamentoData.ESPECIALISTAS?.sobrenome}
              </Text>
            </>
          ) : (
            <TouchableOpacity
              style={styles.botaoOutline}
              onPress={() => setModalEstadiamentoVisivel(true)}
            >
              <Ionicons
                name="add-circle-outline"
                size={20}
                color="#008C9E"
                style={styles.buttonIcon}
              />
              <Text style={styles.botaoOutlineTexto}>
                Preencher Estadiamento
              </Text>
            </TouchableOpacity>
          )}
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

        {localizacoes.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Localização(ões) da Lesão</Text>
            <View style={styles.chipContainer}>
              {localizacoes.map((loc: any) => (
                <View key={loc.id} style={styles.chipLocalizacao}>
                  <Text style={styles.chipTextLocalizacao}>{loc.nome}</Text>
                </View>
              ))}
            </View>
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

        {metastases.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Metástases Associadas</Text>
            <View style={styles.chipContainer}>
              {metastases.map((metastase) => (
                <View key={metastase!.id} style={styles.chip}>
                  <Text style={styles.chipText}>{metastase!.nome}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Detalhes Clínicos</Text>
          <InfoRow
            label="Tamanho"
            value={`${avaliacao.tamanho_aproximado || "Não informado"} cm`}
          />
          <InfoRow
            label="Tempo de Evolução"
            value={`${avaliacao.tempo_evolucao || "Não informado"} meses`}
          />
          <InfoRow
            label="Caract. Macroscópicas da Lesão"
            value={`${avaliacao.ASPECTOS_LESAO?.nome || "Não informado"}`}
          />
          <InfoRow
            label="Superfície"
            value={`${avaliacao.SUPERFICIES?.nome || "Não informado"}`}
          />
          <InfoRow
            label="Bordas"
            value={`${avaliacao.BORDAS?.nome || "Não informado"}`}
          />
          <InfoRow
            label="Sintoma Associado"
            value={`${avaliacao.SINTOMAS?.nome || "Não informado"}`}
          />

          {avaliacao.carga_tabagica ? (
            <InfoRow
              label="Carga Tabágica"
              value={`${avaliacao.carga_tabagica || "Não informado"} cigarros/dia`}
            />
          ) : null}

          <InfoRow
            label="Carga Etílica"
            value={`${avaliacao.carga_etilica || "Não informado"} ml/dia`}
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
          <InfoRow label="Conduta" value={avaliacao.CONDUTAS?.nome} />
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

      <Modal
        visible={modalEstadiamentoVisivel}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalEstadiamentoVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Estadiamento (TNM)</Text>

            <Formik
              initialValues={{
                tnm_clinico: estadiamentoData?.tnm_clinico || "",
                tnm_patologico: estadiamentoData?.tnm_patologico || "",
              }}
              enableReinitialize // Importante ter isso aqui
              onSubmit={handleSalvarEstadiamento}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                isSubmitting,
              }) => (
                <View>
                  <Text style={styles.label}>Estadiamento Clínico (TNM)</Text>
                  <View style={styles.inputBase}>
                    <TextInput
                      style={styles.inputText}
                      placeholder="Ex: T2 N1 M0"
                      placeholderTextColor="#9ca3af"
                      onChangeText={handleChange("tnm_clinico")}
                      onBlur={handleBlur("tnm_clinico")}
                      value={values.tnm_clinico}
                      autoCapitalize="characters"
                    />
                  </View>

                  <Text style={[styles.label, { marginTop: 15 }]}>
                    Estadiamento Patológico (pTNM)
                  </Text>
                  <View style={styles.inputBase}>
                    <TextInput
                      style={styles.inputText}
                      placeholder="Ex: pT2 pN1 pM0"
                      placeholderTextColor="#9ca3af"
                      onChangeText={handleChange("tnm_patologico")}
                      onBlur={handleBlur("tnm_patologico")}
                      value={values.tnm_patologico}
                      autoCapitalize="characters"
                    />
                  </View>

                  <View style={styles.botoesModalContainer}>
                    <TouchableOpacity
                      style={styles.botaoModalCancelar}
                      onPress={() => setModalEstadiamentoVisivel(false)}
                      disabled={isSubmitting}
                    >
                      <Text style={styles.botaoModalCancelarTexto}>
                        Cancelar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.botaoModalSalvar,
                        isSubmitting && styles.botaoDesabilitado,
                      ]}
                      onPress={() => handleSubmit()}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.botaoModalSalvarTexto}>Salvar</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Formik>
          </View>
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
  subSectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#008C9E",
    marginTop: 10,
    marginBottom: 5,
  },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 10 },
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
  headerComBotao: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  autorEstadiamento: {
    fontSize: 13,
    color: "#9ca3af",
    fontStyle: "italic",
    marginTop: 10,
    textAlign: "right",
  },
  botaoOutline: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#008C9E",
    borderStyle: "dashed",
  },
  botaoOutlineTexto: { color: "#008C9E", fontWeight: "bold", fontSize: 15 },
  modalImagemContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImagemExibida: { width: "90%", height: "80%" },
  botaoFecharImagem: { position: "absolute", top: 50, right: 20, zIndex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 20,
    textAlign: "center",
  },
  label: { fontSize: 15, color: "#334155", marginBottom: 8, fontWeight: "600" },
  inputBase: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    height: 52,
    justifyContent: "center",
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  inputText: { fontSize: 16, color: "#1e293b" },
  botoesModalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
    gap: 10,
  },
  botaoModalCancelar: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  botaoModalCancelarTexto: {
    color: "#64748b",
    fontWeight: "bold",
    fontSize: 16,
  },
  botaoModalSalvar: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#008C9E",
  },
  botaoModalSalvarTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  chipLocalizacao: {
    backgroundColor: "#e0f2fe",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#7dd3fc",
  },
  chipTextLocalizacao: { color: "#0369a1", fontSize: 14, fontWeight: "600" },
});

const optionsStyles = {
  optionsContainer: {
    borderRadius: 8,
    marginTop: 40,
    width: 200,
  },
};
