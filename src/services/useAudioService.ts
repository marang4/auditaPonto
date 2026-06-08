import { AudioModule, RecordingPresets, useAudioRecorder } from 'expo-audio';
import { useEffect, useState } from 'react';

export function useAudioService() {
  const [isRecording, setIsRecording] = useState(false);
  const [duracao, setDuracao] = useState(0);

  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
    android: {
      extension: '.amr',
      outputFormat: 'amrwb',
      audioEncoder: 'amr_wb',
    }
  });

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
      console.error('Erro ao solicitar permissão de áudio:', error);
      return false;
    }
  };

  const iniciarGravacao = async (): Promise<boolean> => {
    try {
      const permissao = await solicitarPermissao();
      if (!permissao) return false;

      await recorder.prepareToRecordAsync();
      recorder.record();

      setIsRecording(true);
      return true;
    } catch (error) {
      console.error('Erro ao iniciar a captação de áudio:', error);
      return false;
    }
  };

  const pararGravacao = async (): Promise<string | null> => {
    try {
      recorder.stop();
      setIsRecording(false);
      
      const uriReal = recorder.uri;
      
      if (uriReal) {
        return uriReal;
      } else {
        throw new Error('Falha no motor nativo: O ficheiro não foi gerado.');
      }
    } catch (error) {
      console.error('Erro na gravação:', error);
      setIsRecording(false);
      return null;
    }
  };

 
  const tempoFormatado = `${String(Math.floor(duracao / 60)).padStart(2, '0')}:${String(duracao % 60).padStart(2, '0')}`;

  return {
    isRecording,
    duracao,
    tempoFormatado,
    iniciarGravacao,
    pararGravacao,
  };
}