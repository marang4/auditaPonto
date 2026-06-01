// src/app/(tabs)/_layout.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#007AFF" }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="dashboard" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="nova-os"
        options={{
          title: "Nova OS",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="add-circle-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
