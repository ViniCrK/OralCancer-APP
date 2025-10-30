import { Slot } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { GlobalProvider, useGlobalContext } from "../context/GlobalProvider";

// Componente interno que decide se mostra o App ou o Loading
function RootLayout() {
  const { isLoading } = useGlobalContext();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}

// A exportação padrão envolve o App com o Provider
export default function AppLayout() {
  return (
    <GlobalProvider>
      <RootLayout />
    </GlobalProvider>
  );
}
