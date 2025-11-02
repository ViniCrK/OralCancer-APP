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
import { Ionicons } from "@expo/vector-icons";
import { useGlobalContext } from "@/context/GlobalProvider";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    key: "1",
    title: "Bem-vindo ao OralCancer",
    description:
      "Conheça o app que apoia a triagem de lesões bucais e facilita o diagnóstico precoce.",
    image: require("../assets/imagens/image-woman.png"),
  },
  {
    key: "2",
    title: "Para quem o app foi feito",
    description:
      "Desenvolvido para dentistas e especialistas que realizam triagens e acompanham pacientes com lesões precursoras.",
    image: require("../assets/imagens/image-woman.png"),
  },
  {
    key: "3",
    title: "Diagnóstico Inteligente",
    description:
      "Registre triagens, avalie riscos e compartilhe resultados entre profissionais.",
    image: require("../assets/imagens/image-woman.png"),
  },
];

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
  const { finishOnboarding } = useGlobalContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleFinishOnboarding = async () => {
    await finishOnboarding();
  };

  const handleNextSlide = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleFinishOnboarding();
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

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

      <View style={styles.footerContainer}>
        <Pagination />
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleFinishOnboarding}>
            <Text style={styles.skipButtonText}>Pular</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={handleNextSlide}>
            <Ionicons name="arrow-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

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
    height: height * 0.6,
    backgroundColor: "#0097a7",
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    overflow: "hidden",
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
    paddingBottom: 40,
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
    backgroundColor: "#0097a7",
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
    backgroundColor: "#0097a7",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
});
