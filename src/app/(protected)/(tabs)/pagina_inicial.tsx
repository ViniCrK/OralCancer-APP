import { supabase } from "@/config/supabase-client";
import { useUsuarioService } from "@/services/usuario";
import { useUsuarioStore } from "@/store/usuario";
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
  const { usuario, setUsuario } = useUsuarioStore();
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

      setUsuario(especialista);
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
        Bem-vindo(a), {usuario?.nome} {usuario?.sobrenome}
      </Text>

      {usuario ? (
        <TouchableOpacity
          style={styles.botao}
          onPress={() => router.replace("/avaliacao/cadastrar/pagina1")}
        >
          <Text style={styles.botaoTexto}>Cadastrar Avaliação</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.botao}
          onPress={() => router.replace("/especialista/cadastrar")}
        >
          <Text style={styles.botaoTexto}>Cadastrar Especialista</Text>
        </TouchableOpacity>
      )}

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
