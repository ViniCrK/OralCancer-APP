import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalContext } from "@/context/GlobalProvider";

const { width, height } = Dimensions.get("window");

// 1. Definição dos dados dos slides, baseados nas suas imagens
const slides = [
  {
    key: "1",
    title: "Bem-vindo ao OralCancer",
    description:
      "Conheça o app que apoia a triagem de lesões bucais e facilita o diagnóstico precoce.",
    // Substitua pelo caminho da sua imagem
    image: require("../assets/imagens/image-woman.png"),
  },
  {
    key: "2",
    title: "Para quem o app foi feito",
    description:
      "Desenvolvido para dentistas e especialistas que realizam triagens e acompanham pacientes com lesões precursoras.",
    image: require("../assets/imagens/image-woman.png"), // Mesma imagem
  },
  {
    key: "3",
    title: "Diagnóstico Inteligente",
    description:
      "Registre triagens, avalie riscos e compartilhe resultados entre profissionais.",
    image: require("../assets/imagens/image-woman.png"), // Mesma imagem
  },
];

// Componente para renderizar o conteúdo de cada slide
const Slide = ({ item }: { item: (typeof slides)[0] }) => {
  return (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} resizeMode="cover" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
};

export default function OnboardingScreen() {
  const router = useRouter();
  const { finishOnboarding } = useGlobalContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // 2. Função para salvar a flag e ir para o login
  const handleFinishOnboarding = async () => {
    await finishOnboarding();
  };

  // 3. Lógica para o botão de seta (Próximo / Concluir)
  const handleNextSlide = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // Estamos no último slide, finalizar.
      handleFinishOnboarding();
    }
  };

  // 4. Atualiza o índice do slide atual (para os pontinhos)
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  // 5. Componente dos "pontinhos" de paginação
  const Pagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentIndex ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item }) => <Slide item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />

      {/* Footer com paginação e botões */}
      <View style={styles.footerContainer}>
        <Pagination />
        <View style={styles.buttonContainer}>
          {/* Botão Pular chama a mesma função */}
          <TouchableOpacity onPress={handleFinishOnboarding}>
            <Text style={styles.skipButtonText}>Pular</Text>
          </TouchableOpacity>

          {/* Botão Próximo/Concluir */}
          <TouchableOpacity style={styles.nextButton} onPress={handleNextSlide}>
            <Ionicons name="arrow-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// 6. Estilos baseados no seu design
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  slide: {
    width: width,
    flex: 1,
  },
  imageContainer: {
    width: width,
    height: height * 0.6, // 60% da tela para a imagem
    backgroundColor: "#0097a7", // Cor de fundo teal
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    overflow: "hidden", // Corta a imagem para caber no raio
  },
  image: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    maxWidth: "90%",
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 30,
    paddingBottom: 40, // Espaço para a "home bar" do iPhone
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: "#0097a7", // Cor principal
  },
  dotInactive: {
    backgroundColor: "#ccc",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipButtonText: {
    fontSize: 16,
    color: "gray",
    fontWeight: "500",
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0097a7", // Cor principal
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
});
