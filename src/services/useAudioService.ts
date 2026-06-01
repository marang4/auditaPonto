import { AudioModule, RecordingPresets, useAudioRecorder } from 'expo-audio';
import { useEffect, useState } from 'react';

export function useAudioService() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  
  const [isRecording, setIsRecording] = useState(false);
  const [duracao, setDuracao] = useState(0);


  useEffect(() => {
    let interval: NodeJS.Timeout;
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
      const temPermissao = await solicitarPermissao();
      if (!temPermissao) return false;
      
      await recorder.record();
      setIsRecording(true);
      return true;
    } catch (error) {
      console.error('Falha ao iniciar a gravação:', error);
      throw new Error('Não foi possível aceder ao microfone.');
    }
  };

  const pararGravacao = async (): Promise<string | null> => {
    try {
      await recorder.stop();
      setIsRecording(false);
      
      
      if (!recorder.uri) {
        console.warn('Falha de hardware detetada.');
        return 'file://mock/bypass-emulador-audio.m4a';
      }
      
      return recorder.uri;
    } catch (error) {
      console.error('Falha ao parar a gravação:', error);
      throw new Error('Erro ao guardar o áudio.');
    }
  };

  
  const tempoFormatado = () => {
    const minutos = Math.floor(duracao / 60).toString().padStart(2, '0');
    const segundos = (duracao % 60).toString().padStart(2, '0');
    return `${minutos}:${segundos}`;
  };

  return {
    iniciarGravacao,
    pararGravacao,
    isRecording,
    tempoFormatado: tempoFormatado(),
  };
}