import { Avaliacao, useAvaliacaoService } from "@/services/avaliacao";
import { useEspecialistaStore } from "@/store/especialista";
import { Link } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router/build/hooks";
import { useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";

type Paciente = { id: number; nome: string; sobrenome: string };
type Especialista = { id: number; nome: string; sobrenome: string };
type CampoSelect = { id: number; nome: string };

type AvaliacaoCompleta = {
  id: number;
  queixa_principal: string;
  tamanho_aproximado: number;
  tempo_evolucao: number;
  carga_tabagica_etilica: number;
  historico_familiar_cancer: boolean;
  observacoes: string | null;
  rascunho: boolean;
  created_at: string;
  HABITOS: CampoSelect | null;
  LOCALIZACOES_INTRAORAIS: CampoSelect | null;
  ASPECTOS_LESAO: CampoSelect | null;
  SUPERFICIES: CampoSelect | null;
  SINTOMAS: CampoSelect | null;
  BORDAS: CampoSelect | null;
  LINFONODOS: CampoSelect | null;
  CLASSIFICACOES_RISCO: CampoSelect | null;
  CONDUTAS: CampoSelect | null;
  AREAS_ENCAMINHAMENTO: CampoSelect | null;
  ESPECIALISTAS: Especialista | null;
  PACIENTES: Paciente | null;
};

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
        <ActivityIndicator size="large" color="#10B981" />
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
        <Text style={styles.cardTitle}>Detalhes da Avaliação</Text>

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
        <TextoDetalhe
          label="Queixa Principal"
          value={avaliacao.queixa_principal}
        />
        <TextoDetalhe
          label="Tamanho da Lesão"
          value={`${avaliacao.tamanho_aproximado} cm`}
        />
        <TextoDetalhe
          label="Tempo de Evolução"
          value={`${avaliacao.tempo_evolucao} meses`}
        />
        <TextoDetalhe
          label="Hábito Principal"
          value={avaliacao.HABITOS?.nome}
        />
        <TextoDetalhe
          label="Carga Tabágica(maços) / Etílica(ml)"
          value={avaliacao.carga_tabagica_etilica}
        />
        <TextoDetalhe
          label="Localização Intraoral"
          value={avaliacao.LOCALIZACOES_INTRAORAIS?.nome}
        />
        <TextoDetalhe
          label="Aspecto da lesão"
          value={avaliacao.ASPECTOS_LESAO?.nome}
        />
        <TextoDetalhe
          label="Característa da superfície da lesão"
          value={avaliacao.SUPERFICIES?.nome}
        />
        <TextoDetalhe
          label="Sintomas associados"
          value={avaliacao.SINTOMAS?.nome}
        />
        <TextoDetalhe
          label="Característica das bordas da lesão"
          value={avaliacao.BORDAS?.nome}
        />
        <TextoDetalhe
          label="Linfonodos Regionais"
          value={avaliacao.LINFONODOS?.nome}
        />
        <TextoDetalhe
          label="Classificação de Risco"
          value={avaliacao.CLASSIFICACOES_RISCO?.nome}
        />
        <TextoDetalhe
          label="Conduta Recomendada"
          value={avaliacao.CONDUTAS?.nome}
        />
        <TextoDetalhe
          label="Área de Encaminhamento"
          value={avaliacao.AREAS_ENCAMINHAMENTO?.nome}
        />
        <TextoDetalhe label="Observações" value={avaliacao.observacoes} />
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
            <TouchableOpacity style={styles.botao}>
              <Text style={styles.botaoTexto}>Gerar Notificação</Text>
            </TouchableOpacity>
          </Link>
        )}
      </View>
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
    marginTop: 10,
  },
  botao: {
    backgroundColor: "#10B981",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  botaoSecundario: {
    backgroundColor: "#0d9488",
  },
  botaoEditar: {
    backgroundColor: "#f97316", // Laranja para edição
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
});
