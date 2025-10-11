import { Stack } from "expo-router";

export default function PerfilLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="editar" options={{ headerShown: false }} />
      <Stack.Screen name="alterarEmail" options={{ headerShown: false }} />
      <Stack.Screen name="alterarSenha" options={{ headerShown: false }} />
      <Stack.Screen name="sobre" options={{ headerShown: false }} />
    </Stack>
  );
}
