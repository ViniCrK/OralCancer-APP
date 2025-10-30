import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        animation: "fade",
        tabBarActiveTintColor: "#10B981",
        tabBarInactiveTintColor: "#212020",
      }}
    >
      <Tabs.Screen
        name="pagina_inicial"
        options={{
          href: "/pagina_inicial",
          tabBarLabel: "INÍCIO",
          tabBarIcon: ({ focused }) => {
            return (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Ionicons
                  name="home-outline"
                  size={22}
                  color={focused ? "#10B981" : "#212020"}
                />
              </View>
            );
          },
        }}
      />
      <Tabs.Screen
        name="pacientes"
        options={{
          href: "/pacientes",
          tabBarLabel: "PACIENTES",
          tabBarIcon: ({ focused }) => {
            return (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Ionicons
                  name="people-outline"
                  size={22}
                  color={focused ? "#10B981" : "#212020"}
                />
              </View>
            );
          },
        }}
      />
      <Tabs.Screen
        name="avaliacao"
        options={{
          href: "/avaliacao",
          tabBarLabel: "AVALIAÇÕES",
          tabBarIcon: ({ focused }) => {
            return (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Ionicons
                  name="documents-outline"
                  size={22}
                  color={focused ? "#10B981" : "#212020"}
                />
              </View>
            );
          },
        }}
      />
      <Tabs.Screen
        name="notificacoes"
        options={{
          href: "/notificacoes",
          tabBarLabel: "NOTIFICAÇÕES",
          tabBarIcon: ({ focused }) => {
            return (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={focused ? "#10B981" : "#212020"}
                />
              </View>
            );
          },
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          href: "/perfil",
          tabBarLabel: "PERFIL",
          tabBarIcon: ({ focused }) => {
            return (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Ionicons
                  name="person-outline"
                  size={22}
                  color={focused ? "#10B981" : "#212020"}
                />
              </View>
            );
          },
        }}
      />
    </Tabs>
  );
}
