import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { OrdemServico, StorageService } from "../../services/StorageService";
import { useAudioService } from "../../services/useAudioService";
import { colors } from "../../theme/colors";

type FormData = {
  fabricante: string;
  modelo: string;
  numeroSerie: string;
  empresa: string;
};

export default function NovaOSTela() {
  const router = useRouter();
  const { iniciarGravacao, pararGravacao, isRecording, tempoFormatado } =
    useAudioService();

  const [tipo, setTipo] = useState<"REP" | "Controle de Acesso">("REP");
  const [status, setStatus] = useState<
    "Concluído" | "Pendente" | "Retirado para manutenção"
  >("Concluído");
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      fabricante: "",
      modelo: "",
      numeroSerie: "",
      empresa: "",
    },
  });

  const handleGravarAudio = async () => {
    try {
      const sucesso = await iniciarGravacao();
      if (!sucesso) {
        Alert.alert(
          "Permissão Negada",
          "É necessário acesso ao microfone para gravar.",
        );
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível iniciar a gravação.");
    }
  };

  const handlePararGravacao = async () => {
    try {
      const uri = await pararGravacao();
      if (uri) {
        setAudioUri(uri);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o áudio.");
    }
  };

  const handleRemoverAudio = () => {
    setAudioUri(null);
  };

  const onSubmit = async (data: FormData) => {
    if (isRecording) {
      Alert.alert(
        "Gravação Ativa",
        "Pare a gravação de áudio antes de salvar a O.S.",
      );
      return;
    }

    if (!audioUri) {
      Alert.alert(
        "Evidência Faltante",
        "Grave um áudio descrevendo o problema e a solução antes de salvar a OS.",
      );
      return;
    }

    setIsSaving(true);

    try {
      const novaOS: OrdemServico = {
        id: Date.now().toString(),
        tipo,
        fabricante: data.fabricante,
        modelo: data.modelo,
        numeroSerie: data.numeroSerie,
        empresa: data.empresa,
        status,
        audioUri,
        transcricao: null,
        dataCriacao: new Date().toISOString(),
      };

      await StorageService.salvarOS(novaOS);
      Alert.alert("Sucesso", "O.S cadastrada!");

      reset();
      setAudioUri(null);
      setTipo("REP");
      setStatus("Concluído");

      router.push("/");
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar a Ordem de Serviço");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Tipo de Equipamento</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.selectorButton,
              tipo === "REP" && styles.selectorActive,
            ]}
            onPress={() => setTipo("REP")}
          >
            <Text
              style={[
                styles.selectorText,
                tipo === "REP" && styles.selectorTextActive,
              ]}
            >
              REP
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.selectorButton,
              tipo === "Controle de Acesso" && styles.selectorActive,
            ]}
            onPress={() => setTipo("Controle de Acesso")}
          >
            <Text
              style={[
                styles.selectorText,
                tipo === "Controle de Acesso" && styles.selectorTextActive,
              ]}
            >
              Controle de Acesso
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Dados do Equipamento</Text>

        <Controller
          control={control}
          name="fabricante"
          rules={{ required: "O fabricante é obrigatório" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <TextInput
                style={[styles.input, errors.fabricante && styles.inputError]}
                placeholder="Fabricante (Ex: Control iD, Henry...)"
                placeholderTextColor="#666666"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
              {errors.fabricante && (
                <Text style={styles.errorText}>
                  {errors.fabricante.message}
                </Text>
              )}
            </>
          )}
        />

        <Controller
          control={control}
          name="modelo"
          rules={{ required: "O modelo é obrigatório" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <TextInput
                style={[styles.input, errors.modelo && styles.inputError]}
                placeholder="Modelo"
                placeholderTextColor="#666666"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
              {errors.modelo && (
                <Text style={styles.errorText}>{errors.modelo.message}</Text>
              )}
            </>
          )}
        />

        <Controller
          control={control}
          name="numeroSerie"
          rules={{ required: "O número de série é obrigatório" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <TextInput
                style={[styles.input, errors.numeroSerie && styles.inputError]}
                placeholder="Número de Série"
                placeholderTextColor="#666666"
                keyboardType="numeric"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
              {errors.numeroSerie && (
                <Text style={styles.errorText}>
                  {errors.numeroSerie.message}
                </Text>
              )}
            </>
          )}
        />

        <Controller
          control={control}
          name="empresa"
          rules={{ required: "A empresa é obrigatória" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <TextInput
                style={[styles.input, errors.empresa && styles.inputError]}
                placeholder="Empresa / Cliente"
                placeholderTextColor="#666666"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
              {errors.empresa && (
                <Text style={styles.errorText}>{errors.empresa.message}</Text>
              )}
            </>
          )}
        />

        <Text style={styles.sectionTitle}>Status do Atendimento</Text>
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
                  style={[styles.statusButton, status === opcao && activeStyle]}
                  onPress={() => setStatus(opcao)}
                >
                  <Text
                    style={[
                      styles.statusText,
                      status === opcao && styles.statusTextActive,
                    ]}
                  >
                    {opcao}
                  </Text>
                </TouchableOpacity>
              );
            },
          )}
        </View>

        <Text style={styles.sectionTitle}>Evidência em Áudio</Text>
        <View style={styles.audioContainer}>
          {!isRecording && !audioUri && (
            <TouchableOpacity
              style={styles.recordButton}
              onPress={handleGravarAudio}
            >
              <Text style={styles.recordButtonText}>▶ Iniciar Gravação</Text>
            </TouchableOpacity>
          )}

          {isRecording && (
            <View style={styles.recordingActiveContainer}>
              <Text style={styles.timerText}>{tempoFormatado}</Text>
              <TouchableOpacity
                style={styles.stopButton}
                onPress={handlePararGravacao}
              >
                <Text style={styles.stopButtonText}>■ Parar Gravação</Text>
              </TouchableOpacity>
            </View>
          )}

          {audioUri && !isRecording && (
            <View style={styles.audioSuccessContainer}>
              <Text style={styles.audioSuccessText}>
                ✔ Áudio gravado com sucesso
              </Text>
              <TouchableOpacity onPress={handleRemoverAudio}>
                <Text style={styles.reRecordText}>Regravar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* O botão agora aciona a função handleSubmit do React Hook Form */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.saveButtonText}>SALVAR ORDEM DE SERVIÇO</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  row: { flexDirection: "row", gap: 10 },
  selectorButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  selectorActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectorText: { color: colors.textSecondary, fontWeight: "600" },
  selectorTextActive: { color: colors.surface },

  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    marginTop: 12,
    fontSize: 16,
    color: "#000000",
  },
  inputError: { borderColor: "#D32F2F", borderWidth: 1.5 },
  errorText: { color: "#D32F2F", fontSize: 12, marginTop: 4, marginLeft: 4 },

  statusContainer: { flexDirection: "column", gap: 8 },
  statusButton: {
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  statusActiveConcluido: { backgroundColor: "#2E7D32", borderColor: "#2E7D32" },
  statusActivePendente: { backgroundColor: "#1976D2", borderColor: "#1976D2" },
  statusActiveRetirado: { backgroundColor: "#424242", borderColor: "#424242" },
  statusText: { color: colors.textSecondary, fontWeight: "600" },
  statusTextActive: { color: colors.surface },
  audioContainer: { marginBottom: 30 },
  recordButton: {
    backgroundColor: "#EAEAEA",
    borderWidth: 1,
    borderColor: "#CCC",
    paddingVertical: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  recordButtonText: { color: colors.text, fontWeight: "bold", fontSize: 16 },
  recordingActiveContainer: { gap: 15 },
  timerText: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
  },
  stopButton: {
    backgroundColor: "#FFEBEB",
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  stopButtonText: { color: colors.primary, fontWeight: "bold", fontSize: 16 },
  audioSuccessContainer: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    gap: 10,
  },
  audioSuccessText: { color: "#2E7D32", fontWeight: "bold" },
  reRecordText: {
    color: colors.primary,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: colors.surface, fontWeight: "bold", fontSize: 16 },
});
