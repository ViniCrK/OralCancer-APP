import { Stack } from "expo-router";

export default function DetalheLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Detalhes da Avaliação", headerShown: false }}
      />
      <Stack.Screen name="editar" options={{ headerShown: false }} />
    </Stack>
  );
}
