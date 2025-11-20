import { supabase } from "@/config/supabase-client";
import { useEspecialistaStore } from "@/store/especialista";
import { DropdownItem } from "@/types/avaliacao";
import { PacienteItem } from "@/types/paciente";
import { useFocusEffect, useRouter } from "expo-router";
import { Formik, FormikErrors, FormikTouched } from "formik";
import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Switch,
} from "react-native";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";

import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import SeletorImagem, { Imagem } from "../components/SeletorImagem";
import { Ionicons } from "@expo/vector-icons";
import { CadastrodeAvaliacaoSchemas } from "@/schemas/AvaliacaoSchema";

type InputProps = {
  label: string;
  children: React.ReactNode;
  errorMessage?: string | string[] | FormikErrors<any> | FormikErrors<any>[];
  isTouched?: boolean;
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

export default function CadastroAvaliacao() {
  const router = useRouter();
  const { especialista } = useEspecialistaStore();

  const [pagina, setPagina] = useState(0);

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
  const [pacientes, setPacientes] = useState<PacienteItem[]>([]);

  const pacientesFormatados = pacientes.map((paciente) => ({
    ...paciente,
    label: `${paciente.nome} ${paciente.sobrenome} - ${paciente.registro_hospitalar}`,
  }));

  const proximaPagina = async (
    validateForm: (values?: any) => Promise<FormikErrors<any>>,
    setTouched: (touched: FormikTouched<any>, shouldValidate?: boolean) => void
  ) => {
    const erros = await validateForm();

    if (Object.keys(erros).length === 0) {
      setPagina((prevPagina) => prevPagina + 1);
    } else {
      const touchedFields: any = {};
      Object.keys(erros).forEach((field) => {
        touchedFields[field] = true;
      });
      setTouched(touchedFields);

      Alert.alert(
        "Campos Incompletos",
        "Por favor, preencha os campos obrigatórios em vermelho."
      );
    }
  };

  const paginaAnterior = () => {
    setPagina((prevPagina) => prevPagina - 1);
  };

  const carregarDados = useCallback(async () => {
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
    }
  }, []);

  const carregarPacientes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("PACIENTES")
        .select("*")
        .order("nome");

      if (error) throw error;

      setPacientes(data || []);
    } catch (error) {
      console.error("Erro ao carregar pacientes:", error);
      Alert.alert("Erro", "Não foi possível carregar a lista de pacientes.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarPacientes();
    }, [carregarPacientes])
  );

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

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

  const handleSalvarAvaliacao = async (
    values: any,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    Alert.alert(
      "Salvar Avaliação",
      "Você tem certeza que deseja salvar esta avaliação?",
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => setSubmitting(false),
        },
        {
          text: "Salvar",
          onPress: async () => {
            try {
              if (!especialista) {
                Alert.alert(
                  "Erro",
                  "Especialista não identificado. Por favor, faça o login novamente."
                );
                setSubmitting(false);
                return;
              }

              setSubmitting(true);

              const { imagens, fatores_risco_ids, ...dadosAvaliacao } = values;

              const { data: novaAvaliacao, error: erroAvaliacao } =
                await supabase
                  .from("AVALIACOES")
                  .insert({
                    ...dadosAvaliacao,
                    especialista_id: especialista.id,
                  })
                  .select()
                  .single();

              if (erroAvaliacao) throw erroAvaliacao;

              const novaAvaliacaoId = novaAvaliacao.id;

              if (fatores_risco_ids && fatores_risco_ids.length > 0) {
                const fatoresDeRisco = fatores_risco_ids.map(
                  (fatorId: number) => ({
                    avaliacao_id: novaAvaliacaoId,
                    fator_risco_id: fatorId,
                  })
                );

                const { error: erroFatorRisco } = await supabase
                  .from("AVALIACAO_FATORES_RISCO")
                  .insert(fatoresDeRisco);

                if (erroFatorRisco) throw erroFatorRisco;
              }

              if (imagens && imagens.length > 0) {
                const uploadPromises = imagens.map((imagem: Imagem) =>
                  enviarImagem(imagem.uri)
                );
                const urlsPublicas = await Promise.all(uploadPromises);

                const dadosDasImagens = urlsPublicas.map((url) => ({
                  url: url,
                  avaliacao_id: novaAvaliacaoId,
                }));

                const { error: erroImagens } = await supabase
                  .from("AVALIACAO_IMAGENS_URL")
                  .insert(dadosDasImagens);

                if (erroImagens) throw erroImagens;
              }

              if (novaAvaliacao.rascunho == true) {
                Alert.alert(
                  "Atenção",
                  "Não esqueça de finalizar sua avaliação posteriormente!"
                );
              } else {
                Alert.alert("Sucesso", "Avaliação salva com sucesso!");
              }

              router.push("/(tabs)/avaliacao");
            } catch (error) {
              console.error("Erro no processo de salvamento:", error);
              Alert.alert(
                "Erro",
                `Não foi possível salvar a avaliação. Detalhes: ${error}`
              );
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Formulário de Avaliação</Text>
        <View style={{ width: 40 }} />
      </View>
      <Formik
        initialValues={{
          queixa_principal: "",
          tamanho_aproximado: null,
          tempo_evolucao: null,
          carga_tabagica_etilica: null,
          historico_familiar_cancer: false,
          observacoes: "",
          rascunho: true,
          fatores_risco_ids: [],
          imagens: [],
          habito_id: null,
          localizacao_intraoral_id: null,
          aspecto_lesao_id: null,
          superficie_id: null,
          sintoma_associado_id: null,
          bordas_id: null,
          linfonodo_regional_id: null,
          classificacao_risco_id: null,
          conduta_recomendada_id: null,
          area_encaminhamento_id: null,
          paciente_id: null,
        }}
        onSubmit={(values, { setSubmitting }) =>
          handleSalvarAvaliacao(values, { setSubmitting })
        }
        validationSchema={CadastrodeAvaliacaoSchemas[pagina]}
        validateOnMount={true}
      >
        {({
          handleSubmit,
          handleChange,
          setFieldValue,
          validateForm,
          values,
          errors,
          touched,
          handleBlur,
          isSubmitting,
          setTouched,
          isValid,
        }) => (
          <ScrollView
            style={styles.form}
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            {pagina === 0 && (
              <>
                <FormInput
                  label="Paciente"
                  isTouched={touched.paciente_id}
                  errorMessage={errors.paciente_id as string}
                >
                  <Dropdown
                    style={styles.dropdown}
                    containerStyle={styles.dropdownContainer}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.inputText}
                    iconStyle={styles.dropdownIcon}
                    data={pacientesFormatados}
                    search
                    searchPlaceholder="Registro Hospitalar..."
                    searchField={"registro_hospitalar"}
                    maxHeight={280}
                    valueField={"id"}
                    labelField={"label"}
                    placeholder="Selecione o paciente"
                    value={values.paciente_id}
                    onChange={(paciente) =>
                      setFieldValue("paciente_id", paciente.id)
                    }
                    onBlur={() => handleBlur("paciente_id")}
                    renderRightIcon={() => {
                      if (values.paciente_id != null && !isSubmitting) {
                        return (
                          <TouchableOpacity
                            onPress={() => setFieldValue("paciente_id", null)}
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

                <TouchableOpacity
                  style={styles.linkNovoPaciente}
                  onPress={() => router.push("/pacientes/cadastrar")}
                >
                  <Text style={styles.linkNovoPacienteTexto}>
                    Não encontrou? Cadastre um novo
                  </Text>
                </TouchableOpacity>

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
                        text.replace(/[^0-9,.]/g, "")
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
                        text.replace(/[^0-9]/g, "")
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
                  isTouched={touched.habito_id}
                  errorMessage={errors.habito_id as string}
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
                    value={values.habito_id}
                    onChange={(habito) => setFieldValue("habito_id", habito.id)}
                    onBlur={() => handleBlur("habito_id")}
                    renderRightIcon={() => {
                      if (values.habito_id != null && !isSubmitting) {
                        return (
                          <TouchableOpacity
                            onPress={() => setFieldValue("habito_id", null)}
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
                  label="Carga Tabágica/Etílica"
                  isTouched={touched.carga_tabagica_etilica}
                  errorMessage={errors.carga_tabagica_etilica as string}
                >
                  <TextInput
                    style={styles.inputText}
                    onChangeText={(text) =>
                      setFieldValue(
                        "carga_tabagica_etilica",
                        text.replace(/[^0-9]/g, "")
                      )
                    }
                    onBlur={handleBlur("carga_tabagica_etilica")}
                    value={
                      values.carga_tabagica_etilica
                        ? String(values.carga_tabagica_etilica)
                        : ""
                    }
                    placeholder="Tabágica(maços) / Etílica(ml)"
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
                  label="Localização Intraoral"
                  isTouched={touched.localizacao_intraoral_id}
                  errorMessage={errors.localizacao_intraoral_id as string}
                >
                  <Dropdown
                    style={styles.dropdown}
                    containerStyle={styles.dropdownContainer}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.inputText}
                    iconStyle={styles.dropdownIcon}
                    data={localizacoesIntraorais}
                    search
                    searchPlaceholder="Nome da localização"
                    valueField={"id"}
                    labelField={"nome"}
                    placeholder="Selecionar"
                    value={values.localizacao_intraoral_id}
                    onChange={(loc) =>
                      setFieldValue("localizacao_intraoral_id", loc.id)
                    }
                    onBlur={() => handleBlur("localizacao_intraoral_id")}
                    renderRightIcon={() => {
                      if (
                        values.localizacao_intraoral_id != null &&
                        !isSubmitting
                      ) {
                        return (
                          <TouchableOpacity
                            onPress={() =>
                              setFieldValue("localizacao_intraoral_id", null)
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
                  label="Aspecto da Lesão"
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
                        linfonodoRegional.id
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
                <FormInput
                  label="Classificação de Risco"
                  isTouched={touched.classificacao_risco_id}
                  errorMessage={errors.classificacao_risco_id as string}
                >
                  <Dropdown
                    style={styles.dropdown}
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
                        classificacaoRisco.id
                      )
                    }
                    onBlur={() => handleBlur("classificacao_risco_id")}
                    renderRightIcon={() => {
                      if (
                        values.classificacao_risco_id != null &&
                        !isSubmitting
                      ) {
                        return (
                          <TouchableOpacity
                            onPress={() =>
                              setFieldValue("classificacao_risco_id", null)
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
                  label="Conduta Recomendada"
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
                    searchPlaceholder="Nome da conduta recomendada"
                    valueField={"id"}
                    labelField={"nome"}
                    placeholder="Selecionar"
                    value={values.conduta_recomendada_id}
                    onChange={(condutaRecomendada) =>
                      setFieldValue(
                        "conduta_recomendada_id",
                        condutaRecomendada.id
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

                <FormInput
                  label="Área de Encaminhamento"
                  isTouched={touched.area_encaminhamento_id}
                  errorMessage={errors.area_encaminhamento_id as string}
                >
                  <Dropdown
                    style={styles.dropdown}
                    containerStyle={styles.dropdownContainer}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.inputText}
                    iconStyle={styles.dropdownIcon}
                    data={areasEncaminhamento}
                    search
                    searchPlaceholder="Nome da área de encaminhamento"
                    valueField={"id"}
                    labelField={"nome"}
                    placeholder="Selecionar"
                    value={values.area_encaminhamento_id}
                    onChange={(areaEncaminhamento) =>
                      setFieldValue(
                        "area_encaminhamento_id",
                        areaEncaminhamento.id
                      )
                    }
                    onBlur={() => handleBlur("area_encaminhamento_id")}
                    renderRightIcon={() => {
                      if (
                        values.area_encaminhamento_id != null &&
                        !isSubmitting
                      ) {
                        return (
                          <TouchableOpacity
                            onPress={() =>
                              setFieldValue("area_encaminhamento_id", null)
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
                  onPress={() => proximaPagina(validateForm, setTouched)}
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
                    onPress={() => handleSubmit()}
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
  linkNovoPaciente: {
    alignItems: "flex-end",
  },
  linkNovoPacienteTexto: {
    color: "#008C9E",
    fontWeight: "500",
    fontSize: 14,
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
