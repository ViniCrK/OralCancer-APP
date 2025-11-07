import { supabase } from "@/config/supabase-client";
import { useEspecialistaStore } from "@/store/especialista";
import { DropdownItem } from "@/types/avaliacao";
import { PacienteItem } from "@/types/paciente";
import Checkbox from "expo-checkbox";
import { useFocusEffect, useRouter } from "expo-router";
import { Formik } from "formik";
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
} from "react-native";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";

import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import SeletorImagem, { Imagem } from "../components/SeletorImagem";
import { Ionicons } from "@expo/vector-icons";

export default function CadastroAvaliacao() {
  const router = useRouter();
  const { especialista } = useEspecialistaStore();

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
    {
      setSubmitting,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
    }
  ) => {
    if (!especialista) {
      Alert.alert(
        "Erro",
        "Especialista não identificado. Por favor, faça o login novamente."
      );
      setSubmitting(false);
      return;
    }

    setSubmitting(true);

    try {
      const { imagens, fatores_risco_ids, ...dadosAvaliacao } = values;

      const { data: novaAvaliacao, error: erroAvaliacao } = await supabase
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
        const fatoresDeRisco = fatores_risco_ids.map((fatorId: number) => ({
          avaliacao_id: novaAvaliacaoId,
          fator_risco_id: fatorId,
        }));

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
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
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
      >
        {({
          handleSubmit,
          handleChange,
          setFieldValue,
          values,
          isSubmitting,
        }) => (
          <View style={styles.container}>
            <Text style={styles.titulo}>Formulário de Triagem</Text>

            <View style={styles.form}>
              <SeletorImagem
                imagens={values.imagens}
                onImagensAlteradas={(novasImagens) => {
                  setFieldValue("imagens", novasImagens);
                }}
                desabilitada={isSubmitting}
              />

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Paciente</Text>

                <Dropdown
                  style={styles.dropdown}
                  containerStyle={styles.dropdownContainer}
                  placeholderStyle={{ fontSize: 16, color: "gray" }}
                  selectedTextStyle={{ color: "black" }}
                  data={pacientesFormatados}
                  search
                  searchPlaceholder="Registro Hospitalar"
                  searchField={"registro_hospitalar"}
                  maxHeight={280}
                  valueField={"id"}
                  labelField={"label"}
                  placeholder="Selecione o paciente"
                  value={values.paciente_id}
                  onChange={(paciente) =>
                    setFieldValue("paciente_id", paciente.id)
                  }
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

                <TouchableOpacity
                  style={styles.linkNovoPaciente}
                  onPress={() => router.push("/pacientes/cadastrar")}
                >
                  <Text style={styles.linkNovoPacienteTexto}>
                    Não encontrou o paciente? Cadastre um novo
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Queixa Principal</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange("queixa_principal")}
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
                  onChangeText={(valorTexto) =>
                    setFieldValue("tamanho_aproximado", parseInt(valorTexto))
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
                  onChangeText={(valorTexto) =>
                    setFieldValue("tempo_evolucao", parseInt(valorTexto))
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
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Carga Tabágica/Etílica</Text>

                <TextInput
                  style={styles.input}
                  onChangeText={(valorTexto) =>
                    setFieldValue(
                      "carga_tabagica_etilica",
                      parseInt(valorTexto)
                    )
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
                      values.historico_familiar_cancer ? "#008C9E" : undefined
                    }
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Observações Clínicas</Text>

                <TextInput
                  style={styles.observacoesTexto}
                  multiline
                  numberOfLines={4}
                  maxLength={200}
                  onChangeText={handleChange("observacoes")}
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
                  mode="modal"
                  style={styles.dropdown}
                  containerStyle={styles.dropdownContainer}
                  placeholderStyle={{ fontSize: 16, color: "gray" }}
                  activeColor="#e0f2f1"
                  selectedTextStyle={{
                    fontWeight: "bold",
                    color: "black",
                    fontSize: 14,
                  }}
                  selectedStyle={styles.selectedChip}
                  data={fatoresRisco}
                  valueField={"id"}
                  labelField={"nome"}
                  placeholder="Selecione um ou mais fatores"
                  value={values.fatores_risco_ids}
                  search
                  searchField={"nome"}
                  searchPlaceholder="Nome do Fator"
                  onChange={(fator) =>
                    setFieldValue("fatores_risco_ids", fator)
                  }
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
                  renderRightIcon={() => {
                    if (values.sintoma_associado_id != null && !isSubmitting) {
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
                  renderRightIcon={() => {
                    if (values.linfonodo_regional_id != null && !isSubmitting) {
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
    paddingTop: 30,
  },
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: "#f0f0f0",
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
    borderColor: "#212020",
    borderRadius: 5,
    paddingLeft: 8,
    paddingVertical: 15,
    fontSize: 16,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#212020",
    borderRadius: 5,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  dropdownContainer: {
    borderStartEndRadius: 10,
    borderEndEndRadius: 10,
  },
  selectedChip: {
    backgroundColor: "#d1fae5",
    borderRadius: 10,
    padding: 8,
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
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 5,
    paddingLeft: 8,
    paddingBottom: 15,
    fontSize: 16,
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
    backgroundColor: "#008C9E",
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  botaoRascunho: {
    backgroundColor: "#ffa500",
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
  botaoDesabilitado: {
    backgroundColor: "#f0f0f0",
    borderColor: "#ccc",
  },
  linkNovoPaciente: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  linkNovoPacienteTexto: {
    color: "#008C9E",
    fontWeight: "500",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
