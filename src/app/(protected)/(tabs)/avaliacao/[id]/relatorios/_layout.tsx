import { Stack } from "expo-router";

export default function RelatoriosLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="cadastrar" options={{ headerShown: false }} />
      <Stack.Screen name="[relatorioId]" options={{ headerShown: false }} />
    </Stack>
  );
}
