import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        animation: "fade",
      }}
    >
      <Tabs.Screen name="pagina_inicial" options={{ title: "Início" }} />
      <Tabs.Screen name="pacientes" options={{ title: "Pacientes" }} />
      <Tabs.Screen name="avaliacao" options={{ title: "Avaliações" }} />
      <Tabs.Screen name="notificacoes" options={{ title: "Notificações" }} />
      {/* <Tabs.Screen name="perfil" options={{ title: "Perfil" }} /> */}
    </Tabs>
  );
}
