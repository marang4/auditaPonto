import { useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function DetalhesOSTela() {
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text>Detalhes da Vistoria: {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
