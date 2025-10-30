import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/config/supabase-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";

// 1. Definir o tipo do Contexto
type GlobalContextType = {
  isAuthenticated: boolean | null;
  onboardingComplete: boolean;
  isLoading: boolean;
  finishOnboarding: () => Promise<void>; // Função para o onboarding chamar
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// 2. Hook customizado para usar o contexto
export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};

// 3. O Provedor
export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [onboardingLoaded, setOnboardingLoaded] = useState(false);

  const router = useRouter();
  const segments = useSegments();
  const isLoading = !authLoaded || !onboardingLoaded;

  // 4. Lógica de verificação (a mesma do seu _layout antigo)
  useEffect(() => {
    // a. Verifica o status do onboarding
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem("hasCompletedOnboarding");
        setOnboardingComplete(value === "true");
      } catch (e) {
        setOnboardingComplete(false);
      } finally {
        setOnboardingLoaded(true);
      }
    };

    // b. Verifica o status da autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setAuthLoaded(true);
    });

    checkOnboarding();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 5. Lógica de redirecionamento (a mesma do seu _layout antigo)
  useEffect(() => {
    if (isLoading) return; // Não faz nada se ainda estiver carregando

    const inAuthGroup = segments[0] === "(auth)";
    const inAppGroup = segments[0] === "(protected)";
    const inOnboarding = segments[0] === "onboarding";

    if (!onboardingComplete && !inOnboarding) {
      router.replace("/onboarding");
    } else if (onboardingComplete && isAuthenticated && !inAppGroup) {
      router.replace("/(protected)/(tabs)/pagina_inicial");
    } else if (onboardingComplete && !isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    }
  }, [isLoading, onboardingComplete, isAuthenticated, segments, router]);

  // 6. Função que será chamada pelo onboarding
  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem("hasCompletedOnboarding", "true");
      setOnboardingComplete(true); // Atualiza o estado
      // Não precisa mais de router.replace() aqui!
    } catch (e) {
      console.error("Failed to save onboarding status", e);
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        isAuthenticated,
        onboardingComplete,
        isLoading,
        finishOnboarding,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
