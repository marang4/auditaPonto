import axios from 'axios';
import { useAudioPlayer } from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { OrdemServico, StorageService } from "../../services/StorageService";
import { colors } from "../../theme/colors";

export default function DetalhesOSTela() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [os, setOs] = useState<OrdemServico | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const player = useAudioPlayer(os?.audioUri || "");

  const carregarDetalhes = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const dados = await StorageService.buscarOSPorId(id);
      if (dados) {
        setOs(dados);
      } else {
        Alert.alert("Erro", "Ordem de Serviço não encontrada.");
        router.back();
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar os detalhes da vistoria.");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarDetalhes();
    }, [id]),
  );

  const alterarStatus = async (novoStatus: OrdemServico["status"]) => {
    if (!os || os.status === novoStatus) return;
    setIsSaving(true);
    try {
      const osAtualizada = { ...os, status: novoStatus };
      await StorageService.atualizarOS(osAtualizada);
      setOs(osAtualizada);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o estado.");
    } finally {
      setIsSaving(false);
    }
  };

  const transcreverAudio = async () => {
    if (!os || !os.audioUri) return;

    setIsTranscribing(true);
    try {
      const base64Audio = await FileSystem.readAsStringAsync(os.audioUri, {
        encoding: "base64",
      });

      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY;
      if (!apiKey) {
        Alert.alert(
          "Erro de Infraestrutura",
          "Chave da API do Google não encontrada no ficheiro .env",
        );
        return;
      }
      
      const response = await axios.post(
        `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
        {
          config: {
            languageCode: "pt-BR",
            encoding: "AMR_WB",
            sampleRateHertz: 16000,
          },
          audio: {
            content: base64Audio,
          },
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );


      const data = response.data;

      if (data.results && data.results.length > 0) {
        const texto = data.results[0].alternatives[0].transcript;
        const osAtualizada = { ...os, transcricao: texto };

        await StorageService.atualizarOS(osAtualizada);
        setOs(osAtualizada);
        Alert.alert("Sucesso", "Áudio transcrito pela IA do Google!");
      } else {
        Alert.alert(
          "Aviso",
          "O Google não conseguiu detetar voz neste áudio. Tente gravar novamente num ambiente mais silencioso.",
        );
        console.log("Resposta do Google:", data);
      }
    } catch (error) {
      Alert.alert(
        "Erro na Nuvem",
        "Não foi possível conectar aos servidores do Google.",
      );
      console.error(error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const togglePlayback = () => {
    if (player.playing) {
      player.pause();
    } else {
      if (player.currentTime >= player.duration) {
        player.seekTo(0);
      }
      player.play();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!os) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Detalhes da Vistoria</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Tipo de Equipamento:</Text>
        <Text style={styles.value}>{os.tipo}</Text>
        <Text style={styles.label}>Fabricante:</Text>
        <Text style={styles.value}>{os.fabricante}</Text>
        <Text style={styles.label}>Modelo:</Text>
        <Text style={styles.value}>{os.modelo}</Text>
        <Text style={styles.label}>Número de Série:</Text>
        <Text style={styles.value}>{os.numeroSerie}</Text>
        <Text style={styles.label}>Empresa / Cliente:</Text>
        <Text style={styles.value}>{os.empresa}</Text>
        <Text style={styles.label}>Data de Registo:</Text>
        <Text style={styles.value}>
          {new Date(os.dataCriacao).toLocaleDateString("pt-PT")}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Alterar Estado</Text>
      <View style={styles.statusContainer}>
        {(["Concluído", "Pendente", "Retirado para manutenção"] as const).map(
          (opcao) => {
            let activeStyle;
            if (opcao === "Concluído")
              activeStyle = styles.statusActiveConcluido;
            else if (opcao === "Pendente")
              activeStyle = styles.statusActivePendente;
            else if (opcao === "Retirado para manutenção")
              activeStyle = styles.statusActiveRetirado;

            return (
              <TouchableOpacity
                key={opcao}
                style={[
                  styles.statusButton,
                  os.status === opcao && activeStyle,
                ]}
                onPress={() => alterarStatus(opcao)}
                disabled={isSaving}
              >
                {isSaving && os.status !== opcao ? (
                  <ActivityIndicator
                    color={colors.textSecondary}
                    size="small"
                  />
                ) : (
                  <Text
                    style={[
                      styles.statusText,
                      os.status === opcao && styles.statusTextActive,
                    ]}
                  >
                    {opcao}
                  </Text>
                )}
              </TouchableOpacity>
            );
          },
        )}
      </View>

      <Text style={styles.sectionTitle}>Evidência e Laudo Técnico</Text>
      <View style={styles.audioCard}>
        {os.audioUri ? (
          <View style={styles.audioControls}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={togglePlayback}
            >
              <Text style={styles.playButtonText}>
                {player.playing ? "⏸ Pausar Áudio" : "▶ Reproduzir Vistoria"}
              </Text>
            </TouchableOpacity>

            {!os.transcricao && (
              <TouchableOpacity
                style={[
                  styles.transcribeButton,
                  isTranscribing && styles.disabledButton,
                ]}
                onPress={transcreverAudio}
                disabled={isTranscribing}
              >
                {isTranscribing ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <Text style={styles.transcribeButtonText}>
                    Gerar Laudo com IA (Google)
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Text style={styles.textoMutado}>
            Nenhuma evidência em áudio anexada.
          </Text>
        )}

        {os.transcricao && (
          <View style={styles.transcriptionBox}>
            <Text style={styles.transcriptionTitle}>Laudo Transcrito:</Text>
            <Text style={styles.transcriptionText}>{os.transcricao}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 15,
    marginTop: 10,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 25,
  },
  label: { fontSize: 12, color: colors.textSecondary, marginTop: 10 },
  value: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
    marginBottom: 5,
  },
  statusContainer: { flexDirection: "column", gap: 8 },
  statusButton: {
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  statusActiveConcluido: { backgroundColor: "#2E7D32", borderColor: "#2E7D32" },
  statusActivePendente: { backgroundColor: "#1976D2", borderColor: "#1976D2" },
  statusActiveRetirado: { backgroundColor: "#424242", borderColor: "#424242" },
  statusText: { color: colors.textSecondary, fontWeight: "600", fontSize: 15 },
  statusTextActive: { color: colors.surface },
  audioCard: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 5,
  },
  audioControls: { gap: 10 },
  playButton: {
    backgroundColor: "#EAEAEA",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCC",
  },
  playButtonText: { color: colors.text, fontWeight: "bold" },
  transcribeButton: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: { opacity: 0.7 },
  transcribeButtonText: { color: colors.surface, fontWeight: "bold" },
  textoMutado: {
    color: colors.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
  },
  transcriptionBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  transcriptionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  transcriptionText: { fontSize: 16, color: colors.text, lineHeight: 24 },
});