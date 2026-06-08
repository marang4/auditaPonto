import { AudioModule, useAudioRecorder } from "expo-audio";
import { useEffect, useState } from "react";

export function useAudioService() {
  const recorder = useAudioRecorder({
    // 1. Configurações Universais
    extension: ".amr",
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,

    // 2. Configurações Específicas Nativas
    android: {
      outputFormat: "amr_wb", // O compilador confirmou este formato
      audioEncoder: "amr_wb", // O compilador confirmou este encoder
    },
  });
  const [isRecording, setIsRecording] = useState(false);
  const [duracao, setDuracao] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => {
        setDuracao((prev) => prev + 1);
      }, 1000);
    } else {
      setDuracao(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const solicitarPermissao = async (): Promise<boolean> => {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      return status.granted;
    } catch (error) {
      console.error("Erro ao solicitar permissão de áudio:", error);
      return false;
    }
  };

  const iniciarGravacao = async (): Promise<boolean> => {
    try {
      // 1. Verifica as permissões de privacidade primeiro
      const permissao = await solicitarPermissao();
      if (!permissao) return false;

      // 2. NOVO E OBRIGATÓRIO: Pede ao Android para pré-alocar o arquivo em cache
      await recorder.prepareToRecordAsync();

      // 3. Dispara efetivamente a captação de dados do microfone
      recorder.record();

      setIsRecording(true);
      return true;
    } catch (error) {
      console.error("Erro ao iniciar a captação de áudio:", error);
      return false;
    }
  };
  const pararGravacao = async () => {
    try {
      // Executa a parada do motor de áudio no hardware
      await recorder.stop();

      // FALTAVA ESTA LINHA: Desliga o relógio e libera a interface visual
      setIsRecording(false);

      const uriReal = recorder.uri;

      if (uriReal) {
        return uriReal;
      } else {
        throw new Error("Falha no motor nativo: O ficheiro não foi gerado.");
      }
    } catch (error) {
      console.error("Erro na gravação:", error);
      setIsRecording(false); // Garantia de desligamento do estado em caso de falha
      return null;
    }
  };

  const tempoFormatado = () => {
    const minutos = Math.floor(duracao / 60)
      .toString()
      .padStart(2, "0");
    const segundos = (duracao % 60).toString().padStart(2, "0");
    return `${minutos}:${segundos}`;
  };

  return {
    iniciarGravacao,
    pararGravacao,
    isRecording,
    tempoFormatado: tempoFormatado(),
  };
}
