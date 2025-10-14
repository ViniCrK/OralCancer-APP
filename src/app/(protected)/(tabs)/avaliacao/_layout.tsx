import { Stack } from "expo-router";

export default function AvaliacaoLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Avaliações", headerShown: false }}
      />
      <Stack.Screen name="cadastrar" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
