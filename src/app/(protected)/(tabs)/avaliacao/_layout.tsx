import { Stack } from "expo-router";

export default function AvaliacaoLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="cadastrar/pagina1" options={{ headerShown: false }} />
      <Stack.Screen name="cadastrar/pagina2" options={{ headerShown: false }} />
      <Stack.Screen name="cadastrar/pagina3" options={{ headerShown: false }} />
      <Stack.Screen name="cadastrar/pagina4" options={{ headerShown: false }} />
    </Stack>
  );
}
