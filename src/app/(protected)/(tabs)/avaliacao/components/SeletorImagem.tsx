import * as ImagePicker from "expo-image-picker";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export type Imagem = {
  id?: number;
  uri: string;
};

type SeletorImagemProps = {
  onImagensAlteradas: (uris: Imagem[]) => void;
  imagens: Imagem[];
  desabilitada?: boolean;
};

const ImagemItem = ({
  item,
  onRemover,
  desabilitada,
}: {
  item: Imagem;
  onRemover: (uri: string) => void;
  desabilitada: boolean;
}) => {
  const [carregandoImagem, setCarregandoImagem] = useState(true);

  return (
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: item.uri }}
        style={styles.image}
        onLoad={() => setCarregandoImagem(false)}
      />
      {carregandoImagem && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#008C9E" />
        </View>
      )}

      {!desabilitada && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemover(item.uri)}
        >
          <Ionicons name="close-circle" size={24} color="#e53e3e" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function SeletorImagem({
  imagens,
  onImagensAlteradas,
  desabilitada = false,
}: SeletorImagemProps) {
  const selecionarImagem = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Preciamos de permissão para acessar suas imagens."
      );
      return;
    }

    let seletor = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      aspect: [4, 3],
      allowsMultipleSelection: true,
      quality: 0.5,
    });

    if (!seletor.canceled) {
      const novasImagens: Imagem[] = seletor.assets.map((imagem) => ({
        uri: imagem.uri,
      }));
      const imagensAtualizadas = [...imagens, ...novasImagens];

      onImagensAlteradas(imagensAtualizadas);
    }
  };

  const handleRemoverImagem = (uriImagem: string) => {
    const imagensAtualizadas = imagens.filter(
      (imagem) => imagem.uri !== uriImagem
    );

    onImagensAlteradas(imagensAtualizadas);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Imagens da Lesão</Text>

      <FlatList
        horizontal
        data={imagens}
        renderItem={({ item }) => (
          <ImagemItem
            item={item}
            onRemover={handleRemoverImagem}
            desabilitada={desabilitada}
          />
        )}
        keyExtractor={(item) => item.uri}
        ListFooterComponent={
          <TouchableOpacity
            style={[styles.addButton, desabilitada && styles.disabledButton]}
            onPress={selecionarImagem}
            disabled={desabilitada}
          >
            <Ionicons
              name="cloud-upload-outline"
              size={40}
              color={desabilitada ? "#ccc" : "#008C9E"}
            />
            <Text style={styles.addButtonText}>
              Carregue seus arquivos aqui
            </Text>
          </TouchableOpacity>
        }
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  label: { fontSize: 16, color: "#333", marginBottom: 10, fontWeight: "500" },
  addButton: {
    padding: 10,
    width: 150,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#e0f2f1",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#008C9E",
    borderStyle: "dashed",
  },
  addButtonText: { color: "#008C9E", marginTop: 5, textAlign: "center" },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  image: { width: "100%", height: "100%" },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 12,
  },
  disabledButton: {
    backgroundColor: "#f0f0f0",
    borderColor: "#ccc",
  },
});
