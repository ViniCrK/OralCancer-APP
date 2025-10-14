import { Stack } from "expo-router";

export default function PacientesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Pacientes", headerShown: false }}
      />
      <Stack.Screen name="cadastrar" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
