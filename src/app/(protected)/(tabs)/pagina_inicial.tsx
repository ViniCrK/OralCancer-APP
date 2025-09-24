import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PaginaInicial() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text
        style={{
          fontSize: 22,
        }}
      >
        Página Inicial
      </Text>

      <TouchableOpacity
        style={styles.botao}
        onPress={() => router.replace("/especialista/cadastrar")}
      >
        <Text style={styles.botaoTexto}>Cadastrar Especialista</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  botao: { backgroundColor: "#10B981", padding: 15, borderRadius: 5 },
  botaoTexto: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
