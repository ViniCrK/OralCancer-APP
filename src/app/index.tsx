import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AppEntry() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const hasCompletedOnboarding = await AsyncStorage.getItem(
          "hasCompletedOnboarding"
        );

        if (hasCompletedOnboarding === "true") {
          // Já viu o onboarding, vá para o login
          router.replace("/(auth)/login");
        } else {
          // Primeira vez, vá para o onboarding
          router.replace("/onboarding");
        }
      } catch (error) {
        console.error("Erro ao verificar o onboarding:", error);
        // Em caso de erro, vá para o login como fallback
        router.replace("/(auth)/login");
      }
    };

    checkOnboardingStatus();
  }, []);

  // Mostra um spinner enquanto a verificação assíncrona acontece
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
