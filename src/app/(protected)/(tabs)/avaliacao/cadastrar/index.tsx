import { supabase } from "@/config/supabase-client";
import { Avaliacao, useAvaliacaoService } from "@/services/avaliacao";
import { useEspecialistaStore } from "@/store/especialista";
import Checkbox from "expo-checkbox";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";

export default function CadastroAvaliacao() {
  const router = useRouter();
  const avaliacaoService = useAvaliacaoService();
  const { especialista } = useEspecialistaStore();
  const [mensagem, setMensagem] = useState("");
  const [habitos, setHabitos] = useState<{ id: number; nome: string }[]>([]);
  const [localizacoesIntraorais, setLocalizacoesIntraorais] = useState<
    { id: number; nome: string }[]
  >([]);
  const [aspectosLesao, setAspectosLesao] = useState<
    { id: number; nome: string }[]
  >([]);
  const [superficies, setSuperficies] = useState<
    { id: number; nome: string }[]
  >([]);
  const [sintomasAssociados, setSintomasAssociados] = useState<
    { id: number; nome: string }[]
  >([]);
  const [bordas, setBordas] = useState<{ id: number; nome: string }[]>([]);
  const [linfonodosRegionais, setLinfonodosRegionais] = useState<
    { id: number; nome: string }[]
  >([]);
  const [classificacoesRisco, setClassificacoesRisco] = useState<
    { id: number; nome: string }[]
  >([]);
  const [condutasRecomendadas, setCondutasRecomendadas] = useState<
    { id: number; nome: string }[]
  >([]);
  const [areasEncaminhamento, setAreasEncaminhamento] = useState<
    { id: number; nome: string }[]
  >([]);
  const [fatoresRisco, setFatoresRisco] = useState<
    { id: number; nome: string }[]
  >([]);
  const [pacientes, setPacientes] = useState<
    {
      id: number;
      nome: string;
      sobrenome: string;
      registro_hospitalar: string;
      data_nascimento: string;
    }[]
  >([]);

  const pacientesFormatados = pacientes.map((paciente) => ({
    ...paciente,
    label: `${paciente.nome} ${paciente.sobrenome} - ${paciente.registro_hospitalar}`,
  }));

  useEffect(() => {
    const buscarHabitos = async () => {
      const { data, error } = await supabase.from("HABITOS").select("id, nome");

      if (error) {
        console.error(error.message);
      } else {
        setHabitos(data);
      }
    };

    const buscarLocalizacoesIntraorais = async () => {
      const { data, error } = await supabase
        .from("LOCALIZACOES_INTRAORAIS")
        .select("id, nome");

      if (error) {
        console.error(error.message);
      } else {
        setLocalizacoesIntraorais(data);
      }
    };

    const buscarAspectosLesao = async () => {
      const { data, error } = await supabase
        .from("ASPECTOS_LESAO")
        .select("id, nome");

      if (error) {
        console.error(error.message);
      } else {
        setAspectosLesao(data);
      }
    };

    const buscarSuperficies = async () => {
      const { data, error } = await supabase
        .from("SUPERFICIES")
        .select("id, nome");

      if (error) {
        console.error(error.message);
      } else {
        setSuperficies(data);
      }
    };

    const buscarSintomasAssociados = async () => {
      const { data, error } = await supabase
        .from("SINTOMAS")
        .select("id, nome");

      if (error) {
        console.error(error.message);
      } else {
        setSintomasAssociados(data);
      }
    };

    const buscarBordas = async () => {
      const { data, error } = await supabase.from("BORDAS").select("id, nome");

      if (error) {
        console.error(error.message);
      } else {
        setBordas(data);
      }
    };

    const buscarLinfonodosRegionais = async () => {
      const { data, error } = await supabase
        .from("LINFONODOS")
        .select("id, nome");

      if (error) {
        console.error(error.message);
      } else {
        setLinfonodosRegionais(data);
      }
    };

    const buscarClassificacoesRisco = async () => {
      const { data, error } = await supabase
        .from("CLASSIFICACOES_RISCO")
        .select("id, nome");

      if (error) {
        console.error(error.message);
      } else {
        setClassificacoesRisco(data);
      }
    };

    const buscarCondutasRecomendadas = async () => {
      const { data, error } = await supabase
        .from("CONDUTAS")
        .select("id, nome");

      if (error) {
        console.error(error.message);
      } else {
        setCondutasRecomendadas(data);
      }
    };

    const buscarAreasEncaminhamento = async () => {
      const { data, error } = await supabase
        .from("AREAS_ENCAMINHAMENTO")
        .select("id, nome");

      if (error) {
        console.error(error.message);
      } else {
        setAreasEncaminhamento(data);
      }
    };

    const buscaraPacientes = async () => {
      const { data, error } = await supabase.from("PACIENTES").select("*");

      if (error) {
        console.error(error.message);
      } else {
        setPacientes(data);
      }
    };

    const buscarFatoresRisco = async () => {
      const { data, error } = await supabase.from("FATORES_RISCO").select("*");

      if (error) {
        console.error(error.message);
      } else {
        setFatoresRisco(data);
      }
    };

    buscarAreasEncaminhamento();
    buscarAspectosLesao();
    buscarBordas();
    buscarClassificacoesRisco();
    buscarCondutasRecomendadas();
    buscarFatoresRisco();
    buscarHabitos();
    buscarLinfonodosRegionais();
    buscarLocalizacoesIntraorais();
    buscarSintomasAssociados();
    buscarSuperficies();
    buscaraPacientes();
  }, []);

  const handleSalvarAvaliacao = async (dados: any) => {
    if (!especialista) return;

    const { sucesso, mensagem } = await avaliacaoService.cadastrar({
      ...dados,
      especialista_id: especialista.id,
    });

    setMensagem(mensagem);

    if (sucesso) {
      router.push("/(tabs)/avaliacao");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Formik
        initialValues={{
          queixa_principal: "",
          tamanho_aproximado: 0,
          tempo_evolucao: 0,
          carga_tabagica_etilica: 0,
          historico_familiar_cancer: false,
          observacoes: "",
          rascunho: true,
          // fatores_risco_ids: [],
          habito_id: 0,
          localizacao_intraoral_id: 0,
          aspecto_lesao_id: 0,
          superficie_id: 0,
          sintoma_associado_id: 0,
          bordas_id: 0,
          linfonodo_regional_id: 0,
          classificacao_risco_id: 0,
          conduta_recomendada_id: 0,
          area_encaminhamento_id: 0,
          paciente_id: 0,
        }}
        onSubmit={(dados) => handleSalvarAvaliacao(dados)}
      >
        {({ handleSubmit, handleChange, setFieldValue, values }) => (
          <View style={styles.container}>
            <Text style={styles.titulo}>Formulário de Triagem</Text>

            <View style={styles.form}>
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
                />
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

              <Text style={{ fontSize: 32 }}>{mensagem}</Text>

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
