// src/app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* O grupo (tabs) engloba o Dashboard e a criação de OS */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* A tela de detalhes abrirá sobre as abas, com botão de voltar nativo */}
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
