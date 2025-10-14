import { Stack } from "expo-router";

export default function DetalhePacienteLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="editar" options={{ headerShown: false }} />
    </Stack>
  );
}
