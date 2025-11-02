import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/config/supabase-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";

type GlobalContextType = {
  isAuthenticated: boolean | null;
  onboardingComplete: boolean;
  isLoading: boolean;
  finishOnboarding: () => Promise<void>;
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [onboardingLoaded, setOnboardingLoaded] = useState(false);

  const router = useRouter();
  const segments = useSegments();
  const isLoading = !authLoaded || !onboardingLoaded;

  useEffect(() => {
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

  useEffect(() => {
    if (isLoading) return;

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

  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem("hasCompletedOnboarding", "true");
      setOnboardingComplete(true);
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
