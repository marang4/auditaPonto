// src/app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>

      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

    
      <Stack.Screen
        name="detalhes/[id]"
        options={{
          title: "Detalhes da OS",
          headerBackTitle: "Voltar",
        }}
      />
    </Stack>
  );
}
