import { Stack } from "expo-router";

export default function CadastroAvaliacaoLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="pagina1" options={{ headerShown: false }} />
      <Stack.Screen name="pagina2" options={{ headerShown: false }} />
      <Stack.Screen name="pagina3" options={{ headerShown: false }} />
      <Stack.Screen name="pagina4" options={{ headerShown: false }} />
    </Stack>
  );
}
