import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

const CustomTabBarButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.customButton}>
    <Ionicons name="add" size={32} color="#fff" />
  </TouchableOpacity>
);

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const router = useRouter();

  const visibleRoutes = state.routes.filter((route: any) => {
    const { options } = descriptors[route.key];
    return options.href !== null;
  });

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBarMain}>
        {visibleRoutes.slice(0, 2).map((route: any, index: any) => {
          const { options } = descriptors[route.key];
          // Precisamos encontrar o índice original 'real' para verificar o foco corretamente
          const originalIndex = state.routes.findIndex(
            (r: any) => r.key === route.key
          );
          const isFocused = state.index === originalIndex;

          return (
            <TabItem
              key={route.key}
              route={route}
              options={options}
              isFocused={isFocused}
              navigation={navigation}
            />
          );
        })}

        {/* Espaço para o botão central */}
        <View style={{ width: 64 }} />

        {/* Lado Direito (2 últimas rotas visíveis) */}
        {visibleRoutes.slice(2, 4).map((route: any, index: any) => {
          const { options } = descriptors[route.key];
          const originalIndex = state.routes.findIndex(
            (r: any) => r.key === route.key
          );
          const isFocused = state.index === originalIndex;

          return (
            <TabItem
              key={route.key}
              route={route}
              options={options}
              isFocused={isFocused}
              navigation={navigation}
            />
          );
        })}
      </View>

      <View style={styles.customButtonContainer}>
        <CustomTabBarButton
          onPress={() => router.push("/avaliacao/cadastrar")}
        />
      </View>
    </View>
  );
};

const TabItem = ({ route, isFocused, navigation, options }: any) => {
  const label = options.tabBarLabel || options.title || route.name;
  const activeColor = "#008C9E"; // Cor teal da imagem
  const inactiveColor = "#9ca3af"; // Cor cinza da imagem
  const color = isFocused ? activeColor : inactiveColor;

  const onPress = () => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  if (typeof options.tabBarIcon !== "function") {
    return null;
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.tabItem}>
      {options.tabBarIcon({ focused: isFocused, color: color, size: 24 })}
      <Text
        style={{
          color: color,
          fontSize: 12,
          fontWeight: isFocused ? "600" : "400",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default function TabsLayout() {
  return (
    <Tabs
      // 5. Substitui a barra de abas padrão pela nossa
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: "shift",
      }}
    >
      {/* Aba 1: INÍCIO */}
      <Tabs.Screen
        name="pagina_inicial"
        options={{
          href: "/pagina-inicial",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      {/* Aba 2: PACIENTES */}
      <Tabs.Screen
        name="pacientes"
        options={{
          href: "/(tabs)/pacientes",
          tabBarLabel: "Pacientes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="avaliacao"
        options={{
          href: "/(tabs)/avaliacao",
          tabBarLabel: "Avaliações",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="documents-outline" size={size} color={color} />
          ),
        }}
      />
      {/* Aba 4: PERFIL */}
      <Tabs.Screen
        name="perfil"
        options={{
          href: "/perfil",
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute", // Descomente se quiser que flutue sobre o conteúdo
    bottom: 0,
    left: 0,
    right: 0,
    height: 80, // Altura da barra
    backgroundColor: "transparent", // O fundo fica por conta do Main
  },
  tabBarMain: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70, // Altura da barra de abas visível
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  tabBarSide: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    flex: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  customButtonContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    alignItems: "center",
  },
  customButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#008C9E", // Cor teal
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#008C9E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 3,
    borderColor: "#fff", // Borda branca como na imagem
  },
});
