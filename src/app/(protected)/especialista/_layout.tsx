import { Stack } from "expo-router";

export default function EspecialistasLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="cadastrar/index"
        options={{ headerShown: false, title: "Cadastrar Especialista" }}
      />
    </Stack>
  );
}
