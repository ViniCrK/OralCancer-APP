import { Stack } from "expo-router";

export default function EspecialistasLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="cadastrar" options={{ headerShown: false }} />
    </Stack>
  );
}
