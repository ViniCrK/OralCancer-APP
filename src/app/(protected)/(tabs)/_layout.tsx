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
    </Tabs>
  );
}
