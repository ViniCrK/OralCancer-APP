import { supabase } from "@/config/supabase-client";
import { useAvaliacaoService } from "@/services/avaliacao";
import { DropdownItem } from "@/types/avaliacao";
import Checkbox from "expo-checkbox";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Formik, FormikErrors, FormikTouched } from "formik";
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
  Switch,
  Platform,
} from "react-native";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import SeletorImagem, { Imagem } from "../components/SeletorImagem";
import { v4 as uuidv4 } from "uuid";
import { Ionicons } from "@expo/vector-icons";
import { CadastrodeAvaliacaoSchemas } from "@/schemas/AvaliacaoSchema";
import { EdicaoAvaliacaoSchemas } from "@/schemas/AvaliacaoSchema copy";

const ID_RISCO = {
  BAIXO: 1,
  INTERMEDIARIO: 2,
  ALTO: 3,
};

const ID_CONDICAO = {
  HPV: 4,
  ALCOOL_EXAGERADO: 2,
  CIGARRO_EXAGERADO: 1,
  NAO_FUMA_OU_BEBE: 3,
};

const calcularClassificacaoAuto = (values: any) => {
  const {
    carga_tabagica,
    carga_etilica,
    historico_familiar_cancer,
    fatores_risco_ids,
    habito_etilismo_id,
  } = values;
  const tabagismo = Number(carga_tabagica || 0);
  const temFator = (id: number) => fatores_risco_ids?.includes(id);
  const ehAlcoolatra = habito_etilismo_id === ID_CONDICAO.ALCOOL_EXAGERADO;

  if (temFator(ID_CONDICAO.HPV) && tabagismo > 20 && ehAlcoolatra)
    return ID_RISCO.ALTO;
  if (tabagismo > 0 && tabagismo <= 20 && historico_familiar_cancer === true)
    return ID_RISCO.INTERMEDIARIO;
  return ID_RISCO.BAIXO;
};

const AutoCalculoRisco = ({
  values,
  setFieldValue,
}: {
  values: any;
  setFieldValue: any;
}) => {
  useEffect(() => {
    const novoRiscoId = calcularClassificacaoAuto(values);

    if (values.classificacao_risco_id !== novoRiscoId) {
      console.log("Atualizando risco automaticamente para:", novoRiscoId);
      setFieldValue("classificacao_risco_id", novoRiscoId);
    }
  }, [
    values.carga_tabagica,
    values.carga_etilica,
    values.historico_familiar_cancer,
    values.fatores_risco_ids,
    values.habito_tabagismo_id,
    values.habito_etilismo_id,
  ]);

  return null;
};

type InputProps = {
  label: string;
  children: React.ReactNode;
  errorMessage?: string | string[] | FormikErrors<any> | FormikErrors<any>[];
  isTouched?: boolean | FormikTouched<any> | FormikTouched<any>[];
};
const FormInput = ({
  label,
  children,
  errorMessage,
  isTouched,
}: InputProps) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <View
      style={[
        styles.inputBase,
        isTouched && errorMessage ? styles.inputError : null,
      ]}
    >
      {children}
    </View>
    {isTouched && errorMessage && (
      <Text style={styles.errorText}>{String(errorMessage)}</Text>
    )}
  </View>
);

export default function EditarAvaliacao() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const avaliacaoService = useAvaliacaoService();

  const [pagina, setPagina] = useState(0);
  const [carregando, setCarregando] = useState(true);

  const [habitos, setHabitos] = useState<DropdownItem[]>([]);
  const [localizacoesIntraorais, setLocalizacoesIntraorais] = useState<
    DropdownItem[]
  >([]);
  const [aspectosLesao, setAspectosLesao] = useState<DropdownItem[]>([]);
  const [superficies, setSuperficies] = useState<DropdownItem[]>([]);
  const [sintomasAssociados, setSintomasAssociados] = useState<DropdownItem[]>(
    [],
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
  const [fatoresRisco, setFatoresRisco] = useState<DropdownItem[]>([]);
  const [metastases, setMetastases] = useState<DropdownItem[]>([]);

  const [initialValues, setInitialValues] = useState<any | null>(null);
  const [imagens, setImagens] = useState<Imagem[]>([]);

  const proximaPagina = async () => {
    setPagina((prevPagina) => prevPagina + 1);
  };

  const paginaAnterior = () => {
    setPagina((prevPagina) => prevPagina - 1);
  };

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
          fatoresRiscoData,
          metastasesData,
        ] = await Promise.all([
          supabase.from("HABITOS").select("id, nome"),
          supabase
            .from("LOCALIZACOES_INTRAORAIS")
            .select("id, nome")
            .order("nome", { ascending: true }),
          supabase.from("ASPECTOS_LESAO").select("id, nome"),
          supabase.from("SUPERFICIES").select("id, nome"),
          supabase.from("SINTOMAS").select("id, nome"),
          supabase.from("BORDAS").select("id, nome"),
          supabase.from("LINFONODOS").select("id, nome"),
          supabase.from("CLASSIFICACOES_RISCO").select("id, nome"),
          supabase
            .from("CONDUTAS")
            .select("id, nome")
            .order("nome", { ascending: true }),
          supabase.from("FATORES_RISCO").select("id, nome"),
          supabase.from("METASTASES").select("id, nome"),
        ]);

        setAspectosLesao(aspectosLesaoData.data || []);
        setBordas(bordasData.data || []);
        setClassificacoesRisco(classificacoesRiscoData.data || []);
        setCondutasRecomendadas(condutasRecomendadasData.data || []);
        setFatoresRisco(fatoresRiscoData.data || []);
        setMetastases(metastasesData.data || []);
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
        const localizacoesIds =
          avaliacao.AVALIACAO_LOCALIZACOES?.map(
            (rel: any) => rel.LOCALIZACOES_INTRAORAIS?.id,
          ).filter(Boolean) || [];

        const fatoresRiscoIds =
          avaliacao.AVALIACAO_FATORES_RISCO?.map(
            (rel: any) => rel.FATORES_RISCO?.id,
          ).filter(Boolean) || [];

        const metastasesIds =
          avaliacao.AVALIACAO_METASTASES?.map(
            (rel: any) => rel.METASTASES?.id,
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
          habito_tabagismo_id: avaliacao.habito_tabagismo_id || null,
          carga_tabagica: avaliacao.carga_tabagica || null,
          habito_etilismo_id: avaliacao.habito_etilismo_id || null,
          carga_etilica: avaliacao.carga_etilica || null,
          historico_familiar_cancer:
            avaliacao.historico_familiar_cancer || false,
          observacoes: avaliacao.observacoes || "",
          rascunho: avaliacao.rascunho || true,
          fatores_risco_ids: fatoresRiscoIds,
          metastases_ids: metastasesIds,
          imagens: imagensIniciaisFormatadas,
          localizacoes_intraorais_ids: localizacoesIds,
          aspecto_lesao_id: avaliacao.aspecto_lesao_id || null,
          superficie_id: avaliacao.superficie_id || null,
          sintoma_associado_id: avaliacao.sintoma_associado_id || null,
          bordas_id: avaliacao.bordas_id || null,
          linfonodo_regional_id: avaliacao.linfonodo_regional_id || null,
          classificacao_risco_id: avaliacao.classificacao_risco_id || null,
          conduta_recomendada_id: avaliacao.conduta_recomendada_id || null,
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
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    setSubmitting(true);

    try {
      const {
        imagens: currentImages,
        fatores_risco_ids,
        metastases_ids,
        localizacoes_intraorais_ids,
        ...dadosAvaliacao
      } = values;

      const originalImageUris = imagens.map((img) => img.uri);
      const currentImageUris = currentImages.map((img: Imagem) => img.uri);
      const imagensParaAdicionar = currentImages.filter(
        (img: Imagem) => !img.id && img.uri.startsWith("file://"),
      );
      const imagensParaExcluir = imagens.filter(
        (origImg: Imagem) => !currentImageUris.includes(origImg.uri),
      );

      if (imagensParaExcluir.length > 0) {
        const deletingIds = imagensParaExcluir
          .map((img) => img.id)
          .filter(Boolean);

        if (deletingIds.length > 0) {
          const { error: deleteDbError } = await supabase
            .from("AVALIACAO_IMAGENS_URL")
            .delete()
            .in("id", deletingIds);
          if (deleteDbError)
            throw new Error(
              `Erro ao excluir referências de imagens do banco: ${deleteDbError.message}`,
            );
        }
      }

      let urlsPublicasNovas: string[] = [];
      if (imagensParaAdicionar.length > 0) {
        const uploadPromises = imagensParaAdicionar.map((img: Imagem) =>
          enviarImagem(img.uri),
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

      await supabase
        .from("AVALIACAO_LOCALIZACOES")
        .delete()
        .eq("avaliacao_id", id);
      if (
        localizacoes_intraorais_ids &&
        localizacoes_intraorais_ids.length > 0
      ) {
        const locais = localizacoes_intraorais_ids.map((locId: number) => ({
          avaliacao_id: id,
          localizacao_id: locId,
        }));
        await supabase.from("AVALIACAO_LOCALIZACOES").insert(locais);
      }

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

      const { error: deleteErrorMetastases } = await supabase
        .from("AVALIACAO_METASTASES")
        .delete()
        .eq("avaliacao_id", id);

      if (deleteErrorMetastases) throw deleteErrorMetastases;

      if (metastases_ids && metastases_ids.length > 0) {
        const novasMetastases = metastases_ids.map((metastaseId: number) => ({
          avaliacao_id: id,
          metastase_id: metastaseId,
        }));

        const { error: insertError } = await supabase
          .from("AVALIACAO_METASTASES")
          .insert(novasMetastases);

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
            `Erro ao salvar novas imagens no banco: ${insertError.message}`,
          );
      }

      Alert.alert("Sucesso", "Avaliação atualizada com sucesso!");
      router.push("/(tabs)/avaliacao");
    } catch (error) {
      console.error("Erro ao atualizar fatores de risco:", error);
      Alert.alert(
        "Erro Parcial",
        "Os dados principais da avaliação foram salvos, mas houve um erro ao atualizar os fatores de risco. Por favor, tente editar novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (carregando || !initialValues) {
    return (
      <View style={styles.containerCentralizado}>
        <ActivityIndicator size="large" color="#008C9E" />
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
        <Text style={styles.headerTitle}>Editar Avaliação</Text>
        <View style={{ width: 40 }} />
      </View>
      <Formik
        initialValues={initialValues}
        onSubmit={(values, { setSubmitting }) =>
          handleSalvarAlteracoes(values, { setSubmitting })
        }
        enableReinitialize={true}
        validationSchema={EdicaoAvaliacaoSchemas[pagina]}
        validateOnMount={true}
      >
        {({
          handleSubmit,
          handleChange,
          setFieldValue,
          values,
          errors,
          touched,
          handleBlur,
          isSubmitting,
          isValid,
        }) => (
          <ScrollView
            style={styles.form}
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.pageIndicator}>Página {pagina + 1}</Text>
            {pagina === 0 && (
              <>
                <FormInput
                  label="Queixa Principal"
                  isTouched={touched.queixa_principal}
                  errorMessage={errors.queixa_principal as string}
                >
                  <TextInput
                    style={[styles.inputText, styles.textArea]}
                    onChangeText={handleChange("queixa_principal")}
                    onBlur={handleBlur("queixa_principal")}
                    value={values.queixa_principal}
                    placeholder="Descreva a queixa principal do paciente..."
                    placeholderTextColor="#9ca3af"
                    multiline={true}
                    numberOfLines={4}
                  />
                </FormInput>

                <FormInput
                  label="Tamanho Aproximado (cm)"
                  isTouched={touched.tamanho_aproximado}
                  errorMessage={errors.tamanho_aproximado as string}
                >
                  <TextInput
                    style={styles.inputText}
                    onChangeText={(text) =>
                      setFieldValue(
                        "tamanho_aproximado",
                        text.replace(/[^0-9,.]/g, ""),
                      )
                    }
                    onBlur={handleBlur("tamanho_aproximado")}
                    value={
                      values.tamanho_aproximado
                        ? String(values.tamanho_aproximado)
                        : ""
                    }
                    placeholder="Ex: 2.5"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                  />
                </FormInput>

                <FormInput
                  label="Tempo de Evolução (meses)"
                  isTouched={touched.tempo_evolucao}
                  errorMessage={errors.tempo_evolucao as string}
                >
                  <TextInput
                    style={styles.inputText}
                    onChangeText={(text) =>
                      setFieldValue(
                        "tempo_evolucao",
                        text.replace(/[^0-9]/g, ""),
                      )
                    }
                    onBlur={handleBlur("tempo_evolucao")}
                    value={
                      values.tempo_evolucao ? String(values.tempo_evolucao) : ""
                    }
                    placeholder="Ex: 6"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                  />
                </FormInput>

                <FormInput
                  label="Hábitos"
                  isTouched={touched.habito_tabagismo_id}
                  errorMessage={errors.habito_tabagismo_id as string}
                >
                  <Dropdown
                    style={styles.dropdown}
                    containerStyle={styles.dropdownContainer}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.inputText}
                    iconStyle={styles.dropdownIcon}
                    data={habitos}
                    search
                    searchPlaceholder="Hábito"
                    maxHeight={280}
                    valueField={"id"}
                    labelField={"nome"}
                    placeholder="Selecione o hábito"
                    value={values.habito_tabagismo_id}
                    onChange={(habito) =>
                      setFieldValue("habito_tabagismo_id", habito.id)
                    }
                    onBlur={() => handleBlur("habito_tabagismo_id")}
                    renderRightIcon={() => {
                      if (values.habito_tabagismo_id != null && !isSubmitting) {
                        return (
                          <TouchableOpacity
                            onPress={() =>
                              setFieldValue("habito_tabagismo_id", null)
                            }
                          >
                            <Ionicons
                              name="close-circle"
                              size={22}
                              color="#9ca3af"
                            />
                          </TouchableOpacity>
                        );
                      }
                      return (
                        <Ionicons name="chevron-down" size={22} color="gray" />
                      );
                    }}
                  />
                </FormInput>

                <FormInput
                  label="Carga Tabágica"
                  isTouched={touched.carga_tabagica}
                  errorMessage={errors.carga_tabagica as string}
                >
                  <TextInput
                    style={styles.inputText}
                    onChangeText={(text) =>
                      setFieldValue(
                        "carga_tabagica",
                        text.replace(/[^0-9]/g, ""),
                      )
                    }
                    onBlur={handleBlur("carga_tabagica")}
                    value={
                      values.carga_tabagica ? String(values.carga_tabagica) : ""
                    }
                    placeholder="Ex: 20(maços)"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                  />
                </FormInput>

                <FormInput
                  label="Hábitos"
                  isTouched={touched.habito_etilismo_id}
                  errorMessage={errors.habito_etilismo_id as string}
                >
                  <Dropdown
                    style={styles.dropdown}
                    containerStyle={styles.dropdownContainer}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.inputText}
                    iconStyle={styles.dropdownIcon}
                    data={habitos}
                    search
                    searchPlaceholder="Hábito"
                    maxHeight={280}
                    valueField={"id"}
                    labelField={"nome"}
                    placeholder="Selecione o hábito"
                    value={values.habito_etilismo_id}
                    onChange={(habito) =>
                      setFieldValue("habito_etilismo_id", habito.id)
                    }
                    onBlur={() => handleBlur("habito_etilismo_id")}
                    renderRightIcon={() => {
                      if (values.habito_etilismo_id != null && !isSubmitting) {
                        return (
                          <TouchableOpacity
                            onPress={() =>
                              setFieldValue("habito_etilismo_id", null)
                            }
                          >
                            <Ionicons
                              name="close-circle"
                              size={22}
                              color="#9ca3af"
                            />
                          </TouchableOpacity>
                        );
                      }
                      return (
                        <Ionicons name="chevron-down" size={22} color="gray" />
                      );
                    }}
                  />
                </FormInput>

                <FormInput
                  label="Carga Etílica"
                  isTouched={touched.carga_etilica}
                  errorMessage={errors.carga_etilica as string}
                >
                  <TextInput
                    style={styles.inputText}
                    onChangeText={(text) =>
                      setFieldValue(
                        "carga_etilica",
                        text.replace(/[^0-9]/g, ""),
                      )
                    }
                    onBlur={handleBlur("carga_etilica")}
                    value={
                      values.carga_etilica ? String(values.carga_etilica) : ""
                    }
                    placeholder="Ex: 500(ml/dia)"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                  />
                </FormInput>

                <View style={styles.switchContainer}>
                  <Text style={styles.label}>Histórico Familiar de Câncer</Text>
                  <Switch
                    trackColor={{ false: "#e2e8f0", true: "#008C9E" }}
                    thumbColor={"#fff"}
                    onValueChange={(val) => {
                      setFieldValue("historico_familiar_cancer", val);
                      return;
                    }}
                    value={values.historico_familiar_cancer}
                  />
                </View>
              </>
            )}

            {pagina === 1 && (
              <>
                <FormInput
                  label="Fatores de Risco"
                  isTouched={!!touched.fatores_risco_ids}
                  errorMessage={errors.fatores_risco_ids as string}
                >
                  <MultiSelect
                    style={styles.dropdown}
                    containerStyle={styles.dropdownContainer}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.inputText}
                    selectedStyle={styles.selectedChip}
                    activeColor="#d1fae5"
                    data={fatoresRisco}
                    valueField={"id"}
                    labelField={"nome"}
                    placeholder="Selecione um ou mais fatores de risco"
                    value={values.fatores_risco_ids}
                    onChange={(fator) =>
                      setFieldValue("fatores_risco_ids", fator)
                    }
                    onBlur={() => handleBlur("fatores_risco_ids")}
                    renderRightIcon={() => {
                      if (
                        values.fatores_risco_ids &&
                        values.fatores_risco_ids.length > 0 &&
                        !isSubmitting
                      ) {
                        return (
                          <TouchableOpacity
                            onPress={() => {
                              setFieldValue("fatores_risco_ids", []);
                            }}
                          >
                            <Ionicons
                              name="close-circle"
                              size={22}
                              color="#9ca3af"
                            />
                          </TouchableOpacity>
                        );
                      }
                      return (
                        <Ionicons name="chevron-down" size={22} color="gray" />
                      );
                    }}
                    mode="modal"
                  />
                </FormInput>

                <FormInput
                  label="Localização Intratoral(Poder ser mais de uma)"
                  isTouched={!!touched.localizacoes_intraorais_ids}
                  errorMessage={errors.localizacoes_intraorais_ids as string}
                >
                  <MultiSelect
                    style={styles.dropdown}
                    containerStyle={styles.dropdownContainer}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.inputText}
                    selectedStyle={styles.selectedChip}
                    activeColor="#d1fae5"
                    data={localizacoesIntraorais}
                    valueField={"id"}
                    labelField={"nome"}
                    placeholder="Selecione um ou mais localizações"
                    value={values.localizacoes_intraorais_ids}
                    onChange={(localizacao) =>
                      setFieldValue("localizacoes_intraorais_ids", localizacao)
                    }
                    onBlur={() => handleBlur("localizacoes_intraorais_ids")}
                    renderRightIcon={() => {
                      if (
                        values.localizacoes_intraorais_ids &&
                        values.localizacoes_intraorais_ids.length > 0 &&
                        !isSubmitting
                      ) {
                        return (
                          <TouchableOpacity
                            onPress={() => {
                              setFieldValue("localizacoes_intraorais_ids", []);
                            }}
                          >
                            <Ionicons
                              name="close-circle"
                              size={22}
                              color="#9ca3af"
                            />
                          </TouchableOpacity>
                        );
                      }
                      return (
                        <Ionicons name="chevron-down" size={22} color="gray" />
                      );
                    }}
                    mode="modal"
                  />
                </FormInput>

                <FormInput
                  label="Características Macroscópicas da Lesão"
                  isTouched={touched.aspecto_lesao_id}
                  errorMessage={errors.aspecto_lesao_id as string}
                >
                  <Dropdown
                    style={styles.dropdown}
                    containerStyle={styles.dropdownContainer}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.inputText}
                    iconStyle={styles.dropdownIcon}
                    data={aspectosLesao}
                    search
                    searchPlaceholder="Nome do aspecto"
                    valueField={"id"}
                    labelField={"nome"}
                    placeholder="Selecionar"
                    value={values.aspecto_lesao_id}
                    onChange={(aspec) =>
                      setFieldValue("aspecto_lesao_id", aspec.id)
                    }
                    onBlur={() => handleBlur("aspecto_lesao_id")}
                    renderRightIcon={() => {
                      if (values.aspecto_lesao_id != null && !isSubmitting) {
                        return (
                          <TouchableOpacity
                            onPress={() =>
                              setFieldValue("aspecto_lesao_id", null)
                            }
                          >
                            <Ionicons
                              name="close-circle"
                              size={22}
                              color="#9ca3af"
                            />
                          </TouchableOpacity>
                        );
                      }
                      return (
                        <Ionicons name="chevron-down" size={22} color="gray" />
                      );
                    }}
                  />
                </FormInput>

                <FormInput
                  label="Metástases"
                  isTouched={!!touched.metastases_ids}
                  errorMessage={errors.metastases_ids as string}
                >
                  <MultiSelect
                    style={styles.dropdown}
                    containerStyle={styles.dropdownContainer}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.inputText}
                    selectedStyle={styles.selectedChip}
                    activeColor="#d1fae5"
                    data={metastases}
                    valueField={"id"}
                    labelField={"nome"}
                    placeholder="Selecione um ou mais metastases"
                    value={values.metastases_ids}
                    onChange={(metastase) =>
                      setFieldValue("metastases_ids", metastase)
                    }
                    onBlur={() => handleBlur("metastases_ids")}
                    renderRightIcon={() => {
                      if (
                        values.metastases_ids &&
                        values.metastases_ids.length > 0 &&
                        !isSubmitting
                      ) {
                        return (
                          <TouchableOpacity
                            onPress={() => {
                              setFieldValue("metastases_ids", []);
                            }}
                          >
                            <Ionicons
                              name="close-circle"
                              size={22}
                              color="#9ca3af"
                            />
                          </TouchableOpacity>
                        );
                      }
                      return (
                        <Ionicons name="chevron-down" size={22} color="gray" />
                      );
                    }}
                    mode="modal"
                  />
                </FormInput>

                <FormInput
                  label="Superfície"
                  isTouched={touched.superficie_id}
                  errorMessage={errors.superficie_id as string}
                >
                  <Dropdown
                    style={styles.dropdown}
                    containerStyle={styles.dropdownContainer}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.inputText}
                    iconStyle={styles.dropdownIcon}
                    data={superficies}
                    search
                    searchPlaceholder="Nome da superfície"
                    valueField={"id"}
                    labelField={"nome"}
                    placeholder="Selecionar"
                    value={values.superficie_id}
                    onChange={(superficie) =>
                      setFieldValue("superficie_id", superficie.id)
                    }
                    onBlur={() => handleBlur("superficie_id")}
                    renderRightIcon={() => {
                      if (values.superficie_id != null && !isSubmitting) {
                        return (
                          <TouchableOpacity
                            onPress={() => setFieldValue("superficie_id", null)}
                          >
                            <Ionicons
                              name="close-circle"
                              size={22}
                              color="#9ca3af"
                            />
                          </TouchableOpacity>
                        );
                      }
                      return (
                        <Ionicons name="chevron-down" size={22} color="gray" />
                      );
                    }}
                  />
                </FormInput>

                <FormInput
                  label="Sintoma Associado"
                  isTouched={touched.sintoma_associado_id}
                  errorMessage={errors.sintoma_associado_id as string}
                >
                  <Dropdown
                    style={styles.dropdown}
                    containerStyle={styles.dropdownContainer}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.inputText}
                    iconStyle={styles.dropdownIcon}
                    data={sintomasAssociados}
                    search
                    searchPlaceholder="Nome do sintoma associado"
                    valueField={"id"}
                    labelField={"nome"}
                    placeholder="Selecionar"
                    value={values.sintoma_associado_id}
                    onChange={(sintomaAssociado) =>
                      setFieldValue("sintoma_associado_id", sintomaAssociado.id)
                    }
                    onBlur={() => handleBlur("sintoma_associado_id")}
                    renderRightIcon={() => {
                      if (
                        values.sintoma_associado_id != null &&
                        !isSubmitting
                      ) {
                        return (
                          <TouchableOpacity
                            onPress={() =>
                              setFieldValue("sintoma_associado_id", null)
                            }
                          >
                            <Ionicons
                              name="close-circle"
                              size={22}
                              color="#9ca3af"
                            />
                          </TouchableOpacity>
                        );
                      }
                      return (
                        <Ionicons name="chevron-down" size={22} color="gray" />
                      );
                    }}
                  />
                </FormInput>

                <FormInput
                  label="Borda"
                  isTouched={touched.bordas_id}
                  errorMessage={errors.bordas_id as string}
                >
                  <Dropdown
                    style={styles.dropdown}
                    containerStyle={styles.dropdownContainer}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.inputText}
                    iconStyle={styles.dropdownIcon}
                    data={bordas}
                    search
                    searchPlaceholder="Nome da borda"
                    valueField={"id"}
                    labelField={"nome"}
                    placeholder="Selecionar"
                    value={values.bordas_id}
                    onChange={(borda) => setFieldValue("bordas_id", borda.id)}
                    onBlur={() => handleBlur("bordas_id")}
                    renderRightIcon={() => {
                      if (values.bordas_id != null && !isSubmitting) {
                        return (
                          <TouchableOpacity
                            onPress={() => setFieldValue("bordas_id", null)}
                          >
                            <Ionicons
                              name="close-circle"
                              size={22}
                              color="#9ca3af"
                            />
                          </TouchableOpacity>
                        );
                      }
                      return (
                        <Ionicons name="chevron-down" size={22} color="gray" />
                      );
                    }}
                  />
                </FormInput>

                <FormInput
                  label="Linfonodo Regional"
                  isTouched={touched.linfonodo_regional_id}
                  errorMessage={errors.linfonodo_regional_id as string}
                >
                  <Dropdown
                    dropdownPosition="top"
                    style={styles.dropdown}
                    containerStyle={styles.dropdownContainer}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.inputText}
                    iconStyle={styles.dropdownIcon}
                    data={linfonodosRegionais}
                    search
                    searchPlaceholder="Nome do linfonodo regional"
                    valueField={"id"}
                    labelField={"nome"}
                    placeholder="Selecionar"
                    value={values.linfonodo_regional_id}
                    onChange={(linfonodoRegional) =>
                      setFieldValue(
                        "linfonodo_regional_id",
                        linfonodoRegional.id,
                      )
                    }
                    onBlur={() => handleBlur("linfonodo_regional_id")}
                    renderRightIcon={() => {
                      if (
                        values.linfonodo_regional_id != null &&
                        !isSubmitting
                      ) {
                        return (
                          <TouchableOpacity
                            onPress={() =>
                              setFieldValue("linfonodo_regional_id", null)
                            }
                          >
                            <Ionicons
                              name="close-circle"
                              size={22}
                              color="#9ca3af"
                            />
                          </TouchableOpacity>
                        );
                      }
                      return (
                        <Ionicons name="chevron-down" size={22} color="gray" />
                      );
                    }}
                  />
                </FormInput>
              </>
            )}

            {pagina === 2 && (
              <>
                <AutoCalculoRisco
                  values={values}
                  setFieldValue={setFieldValue}
                />
                <FormInput
                  label="Classificação de Risco (Auto-calculada)"
                  isTouched={touched.classificacao_risco_id}
                  errorMessage={errors.classificacao_risco_id as string}
                >
                  <Dropdown
                    disable
                    style={styles.dropdownDisabled}
                    containerStyle={styles.dropdownContainer}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.inputText}
                    iconStyle={styles.dropdownIcon}
                    data={classificacoesRisco}
                    search
                    searchPlaceholder="Nome da classificação de risco"
                    valueField={"id"}
                    labelField={"nome"}
                    placeholder="Selecionar"
                    value={values.classificacao_risco_id}
                    onChange={(classificacaoRisco) =>
                      setFieldValue(
                        "classificacao_risco_id",
                        classificacaoRisco.id,
                      )
                    }
                    onBlur={() => handleBlur("classificacao_risco_id")}
                    renderRightIcon={() => (
                      <Ionicons name="chevron-down" size={22} color="gray" />
                    )}
                  />
                </FormInput>

                <FormInput
                  label="Condutas"
                  isTouched={touched.conduta_recomendada_id}
                  errorMessage={errors.conduta_recomendada_id as string}
                >
                  <Dropdown
                    style={styles.dropdown}
                    containerStyle={styles.dropdownContainer}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.inputText}
                    iconStyle={styles.dropdownIcon}
                    data={condutasRecomendadas}
                    search
                    searchPlaceholder="Nome da conduta"
                    valueField={"id"}
                    labelField={"nome"}
                    placeholder="Selecionar"
                    value={values.conduta_recomendada_id}
                    onChange={(condutaRecomendada) =>
                      setFieldValue(
                        "conduta_recomendada_id",
                        condutaRecomendada.id,
                      )
                    }
                    onBlur={() => handleBlur("conduta_recomendada_id")}
                    renderRightIcon={() => {
                      if (
                        values.conduta_recomendada_id != null &&
                        !isSubmitting
                      ) {
                        return (
                          <TouchableOpacity
                            onPress={() =>
                              setFieldValue("conduta_recomendada_id", null)
                            }
                          >
                            <Ionicons
                              name="close-circle"
                              size={22}
                              color="#9ca3af"
                            />
                          </TouchableOpacity>
                        );
                      }
                      return (
                        <Ionicons name="chevron-down" size={22} color="gray" />
                      );
                    }}
                  />
                </FormInput>

                <SeletorImagem
                  imagens={values.imagens}
                  onImagensAlteradas={(novasImagens) => {
                    setFieldValue("imagens", novasImagens);
                  }}
                  desabilitada={isSubmitting}
                />

                <FormInput
                  label="Observações Clínicas"
                  isTouched={touched.observacoes}
                  errorMessage={errors.observacoes as string}
                >
                  <TextInput
                    style={[styles.inputText, styles.textArea]}
                    onChangeText={handleChange("observacoes")}
                    onBlur={handleBlur("observacoes")}
                    value={values.observacoes}
                    placeholder="Digite observações adicionais..."
                    placeholderTextColor="#9ca3af"
                    multiline={true}
                    numberOfLines={4}
                    maxLength={200}
                  />
                </FormInput>
                <Text style={styles.contador}>
                  {values.observacoes.length}/200
                </Text>
              </>
            )}

            <View style={styles.botoesContainer}>
              {pagina > 0 && (
                <TouchableOpacity
                  style={styles.botaoVoltar}
                  onPress={paginaAnterior}
                >
                  <Text style={styles.botaoVoltarTexto}>Voltar</Text>
                </TouchableOpacity>
              )}

              {pagina < CadastrodeAvaliacaoSchemas.length - 1 && (
                <TouchableOpacity
                  style={styles.botao}
                  onPress={() => proximaPagina()}
                >
                  <Text style={styles.botaoTexto}>Próximo</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
              )}

              {pagina === CadastrodeAvaliacaoSchemas.length - 1 && (
                <>
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
                      <Text style={styles.botaoTexto}>Salvar rascunho</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.botao,
                      (isSubmitting || !isValid) && styles.botaoDesabilitado,
                    ]}
                    onPress={() => {
                      setFieldValue("rascunho", false);
                      handleSubmit();
                    }}
                    disabled={isSubmitting || !isValid}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.botaoTexto}>Salvar</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
            <View style={{ height: 80 }} />
          </ScrollView>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  containerCentralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
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
  pageIndicator: {
    textAlign: "center",
    fontSize: 20,
    color: "#334155",
    fontWeight: "600",
    marginBottom: 10,
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#334155",
    marginBottom: 8,
    fontWeight: "600",
  },
  inputBase: {
    backgroundColor: "#fff",
    borderRadius: 10,
    minHeight: 52,
    justifyContent: "center",
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  inputText: {
    fontSize: 16,
    color: "#1e293b",
    paddingVertical: 12,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 12,
    paddingLeft: 12,
  },
  contador: {
    textAlign: "right",
    color: "#6c757d",
    fontSize: 12,
    marginTop: 4,
  },
  dropdown: {
    height: 52,
    paddingHorizontal: 15,
  },
  dropdownDisabled: {
    height: 52,
    paddingHorizontal: 15,
    backgroundColor: "#a3a3a3ff",
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: "#9ca3af",
  },
  dropdownIcon: {
    width: 32,
    height: 32,
    tintColor: "black",
  },
  dropdownContainer: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  selectedChip: {
    backgroundColor: "#d1fae5",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 5,
    marginBottom: 5,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 5,
  },
  botoesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  botao: {
    backgroundColor: "#008C9E",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    flex: 1,
    shadowColor: "#008C9E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  botaoVoltar: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  botaoVoltarTexto: {
    color: "#334155",
    fontWeight: "bold",
    fontSize: 16,
  },
  botaoRascunho: {
    backgroundColor: "#f97316",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    flex: 1,
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  botaoDesabilitado: {
    backgroundColor: "lightgray",
    shadowOpacity: 0.1,
    elevation: 2,
  },
});
