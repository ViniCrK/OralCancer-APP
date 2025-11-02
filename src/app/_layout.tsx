import { Slot } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { GlobalProvider, useGlobalContext } from "../context/GlobalProvider";

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

export default function AppLayout() {
  return (
    <GlobalProvider>
      <RootLayout />
    </GlobalProvider>
  );
}
