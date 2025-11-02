import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AppEntry() {
  const router = useRouter();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const hasCompletedOnboarding = await AsyncStorage.getItem(
          "hasCompletedOnboarding"
        );

        if (hasCompletedOnboarding === "true") {
          router.replace("/(auth)/login");
        } else {
          router.replace("/onboarding");
        }
      } catch (error) {
        console.error("Erro ao verificar o onboarding:", error);
        router.replace("/(auth)/login");
      }
    };

    checkOnboardingStatus();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
