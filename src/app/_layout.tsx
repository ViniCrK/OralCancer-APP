import { supabase } from "@/config/supabase-client";
import { useAuth } from "@/context/authContext";
import { Slot, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function RootLayout() {
  const [autenticado, setAutenticado] = useState<boolean | null>(null);
  const [usuarioCarregado, setUsuarioCarregado] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAutenticado(!!session);
      setUsuarioCarregado(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (usuarioCarregado) {
      if (autenticado) {
        router.replace("/(protected)/(tabs)/pagina_inicial");
      } else {
        router.replace("/(auth)/login");
      }
    }
  }, [autenticado]);

  if (!usuarioCarregado) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}
