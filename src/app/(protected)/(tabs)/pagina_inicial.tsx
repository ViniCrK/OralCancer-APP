import { supabase } from "@/config/supabase-client";
import { useUsuarioService } from "@/services/usuario";
import { useEspecialistaStore } from "@/store/especialista";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PaginaInicial() {
  const router = useRouter();
  const { especialista, setEspecialista } = useEspecialistaStore();
  const { sair } = useUsuarioService();
  const [carregando, setCarregando] = useState(true);

  const verificarEspecialistaExistente = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: especialista, error } = await supabase
        .from("ESPECIALISTAS")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setEspecialista(especialista);
    } catch (error) {
      console.error("erro ao verificar a existência do especialista:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    verificarEspecialistaExistente();
  }, []);

  if (carregando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text
        style={{
          fontSize: 22,
        }}
      >
        Página Inicial
      </Text>

      <Text style={{ paddingBottom: 20 }}>
        Bem-vindo(a), {especialista?.nome} {especialista?.sobrenome}
      </Text>

      {!especialista && (
        <TouchableOpacity
          style={styles.botao}
          onPress={() => router.replace("/especialista/cadastrar")}
        >
          <Text style={styles.botaoTexto}>Crie seu perfil de especialista</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.botao}
        onPress={() => router.replace("/avaliacao/cadastrar")}
      >
        <Text style={styles.botaoTexto}>Nova Avaliação</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botao}
        onPress={() => router.replace("/pacientes/cadastrar")}
      >
        <Text style={styles.botaoTexto}>Cadastrar Paciente</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botao}
        onPress={() => router.replace("/pacientes")}
      >
        <Text style={styles.botaoTexto}>Ver Pacientes Cadastrados</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoSair} onPress={() => sair()}>
        <Text style={styles.botaoTexto}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  botaoSair: { backgroundColor: "#e72929ff", padding: 15, borderRadius: 5 },
  botao: { backgroundColor: "#10B981", padding: 15, borderRadius: 5 },
  botaoTexto: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
