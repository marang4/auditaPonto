import { AudioModule, RecordingPresets, useAudioRecorder } from "expo-audio";

export function useAudioService() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

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
      const temPermissao = await solicitarPermissao();
      if (!temPermissao) {
        return false;
      }

      await recorder.record();
      return true;
    } catch (error) {
      console.error("Falha ao iniciar a gravação:", error);
      throw new Error("Não foi possível acessar o microfone.");
    }
  };

  const pararGravacao = async (): Promise<string | null> => {
    try {
      await recorder.stop();
      return recorder.uri;
    } catch (error) {
      console.error("Falha ao parar a gravação:", error);
      throw new Error("Erro ao salvar o arquivo de áudio.");
    }
  };

  return {
    iniciarGravacao,
    pararGravacao,
    isRecording: recorder.isRecording,
  };
}
