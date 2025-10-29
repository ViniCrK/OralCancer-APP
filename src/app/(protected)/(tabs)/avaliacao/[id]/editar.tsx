import { supabase } from "@/config/supabase-client";
import { useAvaliacaoService } from "@/services/avaliacao";
import { DropdownItem } from "@/types/avaliacao";
import { PacienteItem } from "@/types/paciente";
import Checkbox from "expo-checkbox";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import {
  ScrollView,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import SeletorImagem, { Imagem } from "../components/SeletorImagem";
import { v4 as uuidv4 } from "uuid";

export default function EditarAvaliacao() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const avaliacaoService = useAvaliacaoService();

  const [carregando, setCarregando] = useState(true);

  const [habitos, setHabitos] = useState<DropdownItem[]>([]);
  const [localizacoesIntraorais, setLocalizacoesIntraorais] = useState<
    DropdownItem[]
  >([]);
  const [aspectosLesao, setAspectosLesao] = useState<DropdownItem[]>([]);
  const [superficies, setSuperficies] = useState<DropdownItem[]>([]);
  const [sintomasAssociados, setSintomasAssociados] = useState<DropdownItem[]>(
    []
  );
  const [bordas, setBordas] = useState<DropdownItem[]>([]);
  const [linfonodosRegionais, setLinfonodosRegionais] = useState<
    DropdownItem[]
  >([]);
  const [classificacoesRisco, setClassificacoesRisco] = useState<
    DropdownItem[]
  >([]);
  const [condutasRecomendadas, setCondutasRecomendadas] = useState<
    DropdownItem[]
  >([]);
  const [areasEncaminhamento, setAreasEncaminhamento] = useState<
    DropdownItem[]
  >([]);
  const [fatoresRisco, setFatoresRisco] = useState<DropdownItem[]>([]);

  const [initialValues, setInitialValues] = useState<any | null>(null);
  const [imagens, setImagens] = useState<Imagem[]>([]);

  useEffect(() => {
    if (!id) return;

    const carregarDados = async () => {
      setCarregando(true);

      try {
        const [
          habitosData,
          localizacoesIntraoraisData,
          aspectosLesaoData,
          superficiesData,
          sintomasAssociadosData,
          bordasData,
          linfonodosRegionaisData,
          classificacoesRiscoData,
          condutasRecomendadasData,
          areasEncaminhamentoData,
          fatoresRiscoData,
        ] = await Promise.all([
          supabase.from("HABITOS").select("id, nome"),
          supabase.from("LOCALIZACOES_INTRAORAIS").select("id, nome"),
          supabase.from("ASPECTOS_LESAO").select("id, nome"),
          supabase.from("SUPERFICIES").select("id, nome"),
          supabase.from("SINTOMAS").select("id, nome"),
          supabase.from("BORDAS").select("id, nome"),
          supabase.from("LINFONODOS").select("id, nome"),
          supabase.from("CLASSIFICACOES_RISCO").select("id, nome"),
          supabase.from("CONDUTAS").select("id, nome"),
          supabase.from("AREAS_ENCAMINHAMENTO").select("id, nome"),
          supabase.from("FATORES_RISCO").select("id, nome"),
        ]);

        setAreasEncaminhamento(areasEncaminhamentoData.data || []);
        setAspectosLesao(aspectosLesaoData.data || []);
        setBordas(bordasData.data || []);
        setClassificacoesRisco(classificacoesRiscoData.data || []);
        setCondutasRecomendadas(condutasRecomendadasData.data || []);
        setFatoresRisco(fatoresRiscoData.data || []);
        setHabitos(habitosData.data || []);
        setLinfonodosRegionais(linfonodosRegionaisData.data || []);
        setLocalizacoesIntraorais(localizacoesIntraoraisData.data || []);
        setSintomasAssociados(sintomasAssociadosData.data || []);
        setSuperficies(superficiesData.data || []);
      } catch (error) {
        console.error("Erro ao carregar dados para edição:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados da avaliação.");
      } finally {
        setCarregando(false);
      }
    };

    const buscarAvaliacao = async () => {
      const avaliacao = await avaliacaoService.buscar(id as string);

      if (avaliacao) {
        const fatoresRiscoIds =
          avaliacao.AVALIACAO_FATORES_RISCO?.map(
            (rel: any) => rel.FATORES_RISCO?.id
          ).filter(Boolean) || [];

        const imagensIniciaisFormatadas: Imagem[] =
          avaliacao.AVALIACAO_IMAGENS_URL?.map((img: any) => ({
            id: img.id,
            uri: img.url,
          })) || [];

        setImagens(imagensIniciaisFormatadas);

        setInitialValues({
          queixa_principal: avaliacao.queixa_principal || "",
          tamanho_aproximado: avaliacao.tamanho_aproximado || null,
          tempo_evolucao: avaliacao.tempo_evolucao || null,
          carga_tabagica_etilica: avaliacao.carga_tabagica_etilica || null,
          historico_familiar_cancer:
            avaliacao.historico_familiar_cancer || false,
          observacoes: avaliacao.observacoes || "",
          rascunho: avaliacao.rascunho || true,
          fatores_risco_ids: fatoresRiscoIds,
          imagens: imagensIniciaisFormatadas,
          habito_id: avaliacao.habito_id || null,
          localizacao_intraoral_id: avaliacao.localizacao_intraoral_id || null,
          aspecto_lesao_id: avaliacao.aspecto_lesao_id || null,
          superficie_id: avaliacao.superficie_id || null,
          sintoma_associado_id: avaliacao.sintoma_associado_id || null,
          bordas_id: avaliacao.bordas_id || null,
          linfonodo_regional_id: avaliacao.linfonodo_regional_id || null,
          classificacao_risco_id: avaliacao.classificacao_risco_id || null,
          conduta_recomendada_id: avaliacao.conduta_recomendada_id || null,
          area_encaminhamento_id: avaliacao.area_encaminhamento_id || null,
        });
      }
    };

    buscarAvaliacao();
    carregarDados();
  }, []);

  const enviarImagem = async (uri: string) => {
    const nomeArquivo = uri.split("/").pop();
    const tipoArquivoMatch = /\.(\w+)$/.exec(nomeArquivo!);
    const tipoArquivo = tipoArquivoMatch
      ? `image/${tipoArquivoMatch[1]}`
      : `image`;

    const formData = new FormData();

    formData.append("file", {
      uri,
      name: nomeArquivo,
      type: tipoArquivo,
    } as any);

    const extensaoArquivo = uri.split(".").pop();
    const caminhoArquivo = `${uuidv4()}-${Date.now()}.${extensaoArquivo}`;

    const { error } = await supabase.storage
      .from("imagens-avaliacoes")
      .upload(caminhoArquivo, formData);

    if (error) {
      throw new Error(`Falha no upload da imagem: ${error.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("imagens-avaliacoes")
      .getPublicUrl(caminhoArquivo);

    return publicUrl;
  };

  const handleSalvarAlteracoes = async (
    values: any,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    setSubmitting(true);

    try {
      const {
        imagens: currentImages,
        fatores_risco_ids,
        ...dadosAvaliacao
      } = values;

      const originalImageUris = imagens.map((img) => img.uri);
      const currentImageUris = currentImages.map((img: Imagem) => img.uri);
      const imagensParaAdicionar = currentImages.filter(
        (img: Imagem) => !img.id && img.uri.startsWith("file://")
      );
      const imagensParaExcluir = imagens.filter(
        (origImg: Imagem) => !currentImageUris.includes(origImg.uri)
      );

      if (imagensParaExcluir.length > 0) {
        const deletingIds = imagensParaExcluir
          .map((img) => img.id)
          .filter(Boolean); // Pega IDs válidos

        // Deleta apenas do Banco de Dados pelos IDs
        if (deletingIds.length > 0) {
          const { error: deleteDbError } = await supabase
            .from("AVALIACAO_IMAGENS_URL")
            .delete()
            .in("id", deletingIds);
          if (deleteDbError)
            throw new Error(
              `Erro ao excluir referências de imagens do banco: ${deleteDbError.message}`
            );
        }
      }

      let urlsPublicasNovas: string[] = [];
      if (imagensParaAdicionar.length > 0) {
        const uploadPromises = imagensParaAdicionar.map((img: Imagem) =>
          enviarImagem(img.uri)
        );
        urlsPublicasNovas = await Promise.all(uploadPromises);
      }

      const { sucesso: sucessoAtualizar, mensagem: mensagemAtualizar } =
        await avaliacaoService.atualizar(id as string, dadosAvaliacao);

      if (!sucessoAtualizar) {
        Alert.alert("Erro", mensagemAtualizar);
        return;
      }

      const { error: deleteError } = await supabase
        .from("AVALIACAO_FATORES_RISCO")
        .delete()
        .eq("avaliacao_id", id);

      if (deleteError) throw deleteError;

      if (fatores_risco_ids && fatores_risco_ids.length > 0) {
        const novosFatores = fatores_risco_ids.map((fatorId: number) => ({
          avaliacao_id: id,
          fator_risco_id: fatorId,
        }));

        const { error: insertError } = await supabase
          .from("AVALIACAO_FATORES_RISCO")
          .insert(novosFatores);

        if (insertError) throw insertError;
      }

      if (urlsPublicasNovas.length > 0) {
        const dadosNovasImagens = urlsPublicasNovas.map((url) => ({
          url: url,
          avaliacao_id: Number(id),
        }));
        const { error: insertError } = await supabase
          .from("AVALIACAO_IMAGENS_URL")
          .insert(dadosNovasImagens);
        if (insertError)
          throw new Error(
            `Erro ao salvar novas imagens no banco: ${insertError.message}`
          );
      }

      Alert.alert("Sucesso", "Avaliação atualizada com sucesso!");
      router.push("/(tabs)/avaliacao");
    } catch (error) {
      console.error("Erro ao atualizar fatores de risco:", error);
      Alert.alert(
        "Erro Parcial",
        "Os dados principais da avaliação foram salvos, mas houve um erro ao atualizar os fatores de risco. Por favor, tente editar novamente."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (carregando || !initialValues) {
    return (
      <View style={styles.containerCentralizado}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={(values, { setSubmitting }) =>
          handleSalvarAlteracoes(values, { setSubmitting })
        }
      >
        {({
          handleSubmit,
          handleChange,
          setFieldValue,
          values,
          isSubmitting,
        }) => (
          <View style={styles.container}>
            <Text style={styles.titulo}>Editar Avaliação</Text>

            <View style={styles.form}>
              <SeletorImagem
                imagens={values.imagens}
                onImagensAlteradas={(novasImagens) =>
                  setFieldValue("imagens", novasImagens)
                }
                desabilitada={isSubmitting}
              />
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Queixa Principal</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange("queixa_principal")}
                  value={values.queixa_principal}
                  placeholder="Descreva a queixa principal"
                  keyboardType="default"
                  autoCapitalize="sentences"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Tamanho Aproximado da Lesão(cm)
                </Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(valorTexto) => {
                    const textoFormatado = valorTexto.replace(",", ".");

                    if (textoFormatado === "") {
                      setFieldValue("tamanho_aproximado", "");
                    } else {
                      const valorNumerico = parseFloat(textoFormatado);

                      if (!isNaN(valorNumerico)) {
                        setFieldValue("tamanho_aproximado", valorNumerico);
                      }
                    }
                  }}
                  value={
                    values.tamanho_aproximado
                      ? String(values.tamanho_aproximado)
                      : ""
                  }
                  placeholder="Digite o tamanho em cm"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Tempo de Evolução da Lesão(meses)
                </Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(valorTexto) => {
                    const textoFormatado = valorTexto.replace(",", ".");

                    if (textoFormatado === "") {
                      setFieldValue("tempo_evolucao", "");
                    } else {
                      const valorNumerico = parseFloat(textoFormatado);

                      if (!isNaN(valorNumerico)) {
                        setFieldValue("tempo_evolucao", valorNumerico);
                      }
                    }
                  }}
                  value={
                    values.tempo_evolucao ? String(values.tempo_evolucao) : ""
                  }
                  placeholder="Digite o tempo em meses"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Hábitos do Paciente</Text>

                <Dropdown
                  style={styles.dropdown}
                  containerStyle={styles.dropdownContainer}
                  placeholderStyle={{ fontSize: 16, color: "gray" }}
                  selectedTextStyle={{ color: "black" }}
                  data={habitos}
                  search
                  searchPlaceholder="Nome do hábito"
                  maxHeight={280}
                  valueField={"id"}
                  labelField={"nome"}
                  placeholder="Selecione o hábito"
                  value={values.habito_id}
                  onChange={(habito) => setFieldValue("habito_id", habito.id)}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Carga Tabágica/Etílica</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(valorTexto) => {
                    const textoFormatado = valorTexto.replace(",", ".");

                    if (textoFormatado === "") {
                      setFieldValue("carga_tabagica_etilica", "");
                    } else {
                      const valorNumerico = parseFloat(textoFormatado);

                      if (!isNaN(valorNumerico)) {
                        setFieldValue("carga_tabagica_etilica", valorNumerico);
                      }
                    }
                  }}
                  value={
                    values.carga_tabagica_etilica
                      ? String(values.carga_tabagica_etilica)
                      : ""
                  }
                  placeholder="Tabágica(maços) / Etílica(ml)"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Histórico Familiar de Câncer</Text>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() =>
                    setFieldValue("historico_familiar_cancer", true)
                  }
                >
                  <Checkbox
                    style={styles.checkbox}
                    value={values.historico_familiar_cancer}
                    onValueChange={(escolha) =>
                      setFieldValue("historico_familiar_cancer", escolha)
                    }
                    color={
                      values.historico_familiar_cancer ? "#10B981" : undefined
                    }
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Observações Clínicas</Text>
                <TextInput
                  style={[styles.input, styles.observacoesTexto]}
                  multiline
                  numberOfLines={4}
                  maxLength={200}
                  onChangeText={handleChange("observacoes")}
                  value={values.observacoes}
                  placeholder="Digite as observações adicionais"
                  keyboardType="default"
                />

                <Text style={styles.contador}>
                  {values.observacoes.length}/200
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Fatores de Risco</Text>

                <MultiSelect
                  style={styles.dropdown}
                  containerStyle={styles.dropdownContainer}
                  dropdownPosition="top"
                  placeholderStyle={{ fontSize: 16, color: "gray" }}
                  activeColor="#e0f2f1"
                  selectedTextStyle={{ color: "black", fontSize: 14 }}
                  selectedStyle={styles.selectedChip}
                  data={fatoresRisco}
                  valueField={"id"}
                  labelField={"nome"}
                  placeholder="Selecione um ou mais fatores"
                  value={values.fatores_risco_ids}
                  search
                  searchField={"nome"}
                  searchPlaceholder="Buscar Fator..."
                  onChange={(fatores) =>
                    setFieldValue("fatores_risco_ids", fatores)
                  }
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Localização Intraoral</Text>

                <Dropdown
                  style={styles.dropdown}
                  containerStyle={styles.dropdownContainer}
                  placeholderStyle={{ fontSize: 16, color: "gray" }}
                  selectedTextStyle={{ color: "black" }}
                  data={localizacoesIntraorais}
                  search
                  searchPlaceholder="Nome da localização"
                  maxHeight={280}
                  valueField={"id"}
                  labelField={"nome"}
                  placeholder="Selecione a localização intraoral"
                  value={values.localizacao_intraoral_id}
                  onChange={(localizacaoIntraoral) =>
                    setFieldValue(
                      "localizacao_intraoral_id",
                      localizacaoIntraoral.id
                    )
                  }
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Aspecto da Lesão</Text>

                <Dropdown
                  style={styles.dropdown}
                  containerStyle={styles.dropdownContainer}
                  placeholderStyle={{ fontSize: 16, color: "gray" }}
                  selectedTextStyle={{ color: "black" }}
                  data={aspectosLesao}
                  search
                  searchPlaceholder="Nome do aspecto"
                  maxHeight={280}
                  valueField={"id"}
                  labelField={"nome"}
                  placeholder="Selecione o aspecto"
                  value={values.aspecto_lesao_id}
                  onChange={(aspectoLesao) =>
                    setFieldValue("aspecto_lesao_id", aspectoLesao.id)
                  }
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Superfície da Lesão</Text>

                <Dropdown
                  style={styles.dropdown}
                  containerStyle={styles.dropdownContainer}
                  placeholderStyle={{ fontSize: 16, color: "gray" }}
                  selectedTextStyle={{ color: "black" }}
                  data={superficies}
                  search
                  searchPlaceholder="Nome da superfície"
                  maxHeight={280}
                  valueField={"id"}
                  labelField={"nome"}
                  placeholder="Selecione a superfície"
                  value={values.superficie_id}
                  onChange={(superficie) =>
                    setFieldValue("superficie_id", superficie.id)
                  }
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Sintomas Associados</Text>

                <Dropdown
                  style={styles.dropdown}
                  containerStyle={styles.dropdownContainer}
                  placeholderStyle={{ fontSize: 16, color: "gray" }}
                  selectedTextStyle={{ color: "black" }}
                  data={sintomasAssociados}
                  search
                  searchPlaceholder="Nome do sintoma"
                  maxHeight={280}
                  valueField={"id"}
                  labelField={"nome"}
                  placeholder="Selecione o sintoma"
                  value={values.sintoma_associado_id}
                  onChange={(sintoma) =>
                    setFieldValue("sintoma_associado_id", sintoma.id)
                  }
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Aspecto da Borda</Text>

                <Dropdown
                  style={styles.dropdown}
                  containerStyle={styles.dropdownContainer}
                  placeholderStyle={{ fontSize: 16, color: "gray" }}
                  selectedTextStyle={{ color: "black" }}
                  data={bordas}
                  search
                  searchPlaceholder="Nome da borda"
                  maxHeight={280}
                  valueField={"id"}
                  labelField={"nome"}
                  placeholder="Selecione a borda"
                  value={values.bordas_id}
                  onChange={(borda) => setFieldValue("bordas_id", borda.id)}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Linfonodos Regionais</Text>

                <Dropdown
                  style={styles.dropdown}
                  containerStyle={styles.dropdownContainer}
                  placeholderStyle={{ fontSize: 16, color: "gray" }}
                  selectedTextStyle={{ color: "black" }}
                  data={linfonodosRegionais}
                  search
                  searchPlaceholder="Nome do linfonodo"
                  maxHeight={280}
                  valueField={"id"}
                  labelField={"nome"}
                  placeholder="Selecione o linfonodo"
                  value={values.linfonodo_regional_id}
                  onChange={(linfonodoRegional) =>
                    setFieldValue("linfonodo_regional_id", linfonodoRegional.id)
                  }
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Classificação de Risco</Text>

                <Dropdown
                  style={styles.dropdown}
                  containerStyle={styles.dropdownContainer}
                  placeholderStyle={{ fontSize: 16, color: "gray" }}
                  selectedTextStyle={{ color: "black" }}
                  data={classificacoesRisco}
                  search
                  searchPlaceholder="Nome da classificação"
                  maxHeight={280}
                  valueField={"id"}
                  labelField={"nome"}
                  placeholder="Selecione a classificação"
                  value={values.classificacao_risco_id}
                  onChange={(classificacaoRisco) =>
                    setFieldValue(
                      "classificacao_risco_id",
                      classificacaoRisco.id
                    )
                  }
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Conduta Recomendada</Text>

                <Dropdown
                  style={styles.dropdown}
                  containerStyle={styles.dropdownContainer}
                  placeholderStyle={{ fontSize: 16, color: "gray" }}
                  selectedTextStyle={{ color: "black" }}
                  data={condutasRecomendadas}
                  search
                  searchPlaceholder="Nome da conduta"
                  maxHeight={280}
                  valueField={"id"}
                  labelField={"nome"}
                  placeholder="Selecione a conduta"
                  value={values.conduta_recomendada_id}
                  onChange={(conduta) =>
                    setFieldValue("conduta_recomendada_id", conduta.id)
                  }
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Área de Encaminhamento</Text>

                <Dropdown
                  style={styles.dropdown}
                  containerStyle={styles.dropdownContainer}
                  placeholderStyle={{ fontSize: 16, color: "gray" }}
                  selectedTextStyle={{ color: "black" }}
                  data={areasEncaminhamento}
                  search
                  searchPlaceholder="Nome da área"
                  maxHeight={280}
                  valueField={"id"}
                  labelField={"nome"}
                  placeholder="Selecione a área"
                  value={values.area_encaminhamento_id}
                  onChange={(areaEncaminhamento) =>
                    setFieldValue(
                      "area_encaminhamento_id",
                      areaEncaminhamento.id
                    )
                  }
                />
              </View>

              <TouchableOpacity
                style={[styles.botao, isSubmitting && styles.botaoDesabilitado]}
                onPress={() => {
                  setFieldValue("rascunho", false);
                  handleSubmit();
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.botaoTexto}>Finalizar Avaliação</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.botaoRascunho,
                  isSubmitting && styles.botaoDesabilitado,
                ]}
                onPress={() => {
                  setFieldValue("rascunho", true);
                  handleSubmit();
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.botaoTexto}>Finalizar depois</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingTop: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  containerCentralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  form: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  dropdownContainer: {
    borderStartEndRadius: 10,
    borderEndEndRadius: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  checkbox: {
    marginRight: 12,
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: "#ccc",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#333",
  },
  observacoesTexto: {
    height: 80,
    textAlignVertical: "top",
  },
  contador: {
    textAlign: "right",
    color: "#6c757d",
    fontSize: 12,
    marginTop: 4,
  },
  botao: {
    backgroundColor: "#10B981",
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  botaoRascunho: {
    backgroundColor: "#ffa500",
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  botaoDesabilitado: {
    backgroundColor: "#f0f0f0",
    borderColor: "#ccc",
  },
  selectedChip: {
    backgroundColor: "#d1fae5", // Um verde bem claro para os chips
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 5,
    marginBottom: 5,
  },
});
