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
import { Dropdown } from "react-native-element-dropdown";

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
        setInitialValues({
          queixa_principal: avaliacao.queixa_principal || "",
          tamanho_aproximado: avaliacao.tamanho_aproximado || null,
          tempo_evolucao: avaliacao.tempo_evolucao || null,
          carga_tabagica_etilica: avaliacao.carga_tabagica_etilica || null,
          historico_familiar_cancer:
            avaliacao.historico_familiar_cancer || false,
          observacoes: avaliacao.observacoes || "",
          rascunho: avaliacao.rascunho || true,
          // fatores_risco_ids: [],
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

  const handleSalvarAlteracoes = async (dados: any) => {
    const { sucesso, mensagem } = await avaliacaoService.atualizar(
      id as string,
      dados
    );

    if (dados.rascunho == true) {
      Alert.alert(
        "Atenção",
        "Não esqueça de finalizar sua avaliação posteriormente!"
      );
    } else {
      Alert.alert("Sucesso", mensagem);
    }

    if (sucesso) {
      router.push("/(tabs)/avaliacao");
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
        onSubmit={(dados) => handleSalvarAlteracoes(dados)}
      >
        {({ handleSubmit, handleChange, setFieldValue, values }) => (
          <View style={styles.container}>
            <Text style={styles.titulo}>Editar Avaliação</Text>

            <View style={styles.form}>
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

              {/* <View style={styles.inputContainer}>
                <Text style={styles.label}>Fatores de Risco</Text>

                <MultiSelect
                  style={styles.dropdown}
                  containerStyle={styles.dropdownContainer}
                  dropdownPosition="top"
                  placeholderStyle={{ fontSize: 16, color: "gray" }}
                  activeColor="gray"
                  selectedTextStyle={{ color: "black" }}
                  selectedStyle={{ backgroundColor: "lightgray" }}
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
                />
              </View> */}

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
                style={styles.botao}
                onPress={() => {
                  setFieldValue("rascunho", false);
                  handleSubmit();
                }}
              >
                <Text style={styles.botaoTexto}>Salvar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botao}
                onPress={() => {
                  setFieldValue("rascunho", true);
                  handleSubmit();
                }}
              >
                <Text style={styles.botaoTexto}>Salvar como rascunho</Text>
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
});
