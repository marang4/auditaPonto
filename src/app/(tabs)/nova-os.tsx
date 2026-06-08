import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
  View
} from 'react-native';
import { OrdemServico, StorageService } from '../../services/StorageService';
import { useAudioService } from '../../services/useAudioService';
import { colors } from '../../theme/colors';

export default function NovaOSTela() {
  const router = useRouter();
  
  const { iniciarGravacao, pararGravacao, isRecording, tempoFormatado } = useAudioService();

  const [tipo, setTipo] = useState<'REP' | 'Controle de Acesso'>('REP');
  const [fabricante, setFabricante] = useState('');
  const [modelo, setModelo] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [status, setStatus] = useState<'Concluído' | 'Pendente' | 'Retirado para manutenção'>('Concluído');

  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleGravarAudio = async () => {
    try {
      const sucesso = await iniciarGravacao();
      if (!sucesso) {
        Alert.alert('Permissão Negada', 'É necessário acesso ao microfone para gravar a evidência.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível iniciar a gravação.');
    }
  };

  const handlePararGravacao = async () => {
    try {
      const uri = await pararGravacao();
      if (uri) {
        setAudioUri(uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o ficheiro de áudio.');
    }
  };

  const handleRemoverAudio = () => {
    setAudioUri(null);
  };

  const handleSalvar = async () => {
    if (isRecording) {
      Alert.alert('Gravação Ativa', 'Pare a gravação de áudio antes de salvar a Ordem de Serviço.');
      return;
    }

    if (!fabricante || !modelo || !numeroSerie || !empresa) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os dados do equipamento e empresa.');
      return;
    }

    if (!audioUri) {
      Alert.alert('Evidência Faltante', 'Grave um áudio a descrever o problema e a solução antes de salvar a OS.');
      return;
    }

    setIsSaving(true);

    try {
      const novaOS: OrdemServico = {
        id: Date.now().toString(),
        tipo,
        fabricante,
        modelo,
        numeroSerie,
        empresa,
        status,
        audioUri,
        transcricao: null,
        dataCriacao: new Date().toISOString(),
      };

      await StorageService.salvarOS(novaOS);
      Alert.alert('Sucesso', 'O.S cadastrada!');
      
      setFabricante('');
      setModelo('');
      setNumeroSerie('');
      setEmpresa('');
      setAudioUri(null);
      setTipo('REP');
      setStatus('Concluído');

      router.push('/');
      
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar a Ordem de Serviço');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.sectionTitle}>Tipo de Equipamento</Text>
        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.selectorButton, tipo === 'REP' && styles.selectorActive]}
            onPress={() => setTipo('REP')}
          >
            <Text style={[styles.selectorText, tipo === 'REP' && styles.selectorTextActive]}>REP</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.selectorButton, tipo === 'Controle de Acesso' && styles.selectorActive]}
            onPress={() => setTipo('Controle de Acesso')}
          >
            <Text style={[styles.selectorText, tipo === 'Controle de Acesso' && styles.selectorTextActive]}>Controle de Acesso</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Dados do Equipamento</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Fabricante (Ex: Control iD, Henry...)" 
          placeholderTextColor="#666666"
          value={fabricante}
          onChangeText={setFabricante}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Modelo" 
          placeholderTextColor="#666666"
          value={modelo}
          onChangeText={setModelo}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Número de Série" 
          placeholderTextColor="#666666"
          keyboardType="numeric"
          value={numeroSerie}
          onChangeText={setNumeroSerie}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Empresa / Cliente" 
          placeholderTextColor="#666666"
          value={empresa}
          onChangeText={setEmpresa}
        />

        <Text style={styles.sectionTitle}>Status do Atendimento</Text>
        <View style={styles.statusContainer}>
          {(['Concluído', 'Pendente', 'Retirado para manutenção'] as const).map((opcao) => {
            let activeStyle;
            if (opcao === 'Concluído') activeStyle = styles.statusActiveConcluido;
            else if (opcao === 'Pendente') activeStyle = styles.statusActivePendente;
            else if (opcao === 'Retirado para manutenção') activeStyle = styles.statusActiveRetirado;

            return (
              <TouchableOpacity 
                key={opcao}
                style={[
                  styles.statusButton, 
                  status === opcao && activeStyle
                ]}
                onPress={() => setStatus(opcao)}
              >
                <Text style={[
                  styles.statusText, 
                  status === opcao && styles.statusTextActive
                ]}>
                  {opcao}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Evidência em Áudio</Text>
        <View style={styles.audioContainer}>
          {!isRecording && !audioUri && (
            <TouchableOpacity style={styles.recordButton} onPress={handleGravarAudio}>
              <Text style={styles.recordButtonText}>▶ Iniciar Gravação</Text>
            </TouchableOpacity>
          )}

          {isRecording && (
            <View style={styles.recordingActiveContainer}>
              <Text style={styles.timerText}>{tempoFormatado}</Text>
              <TouchableOpacity style={styles.stopButton} onPress={handlePararGravacao}>
                <Text style={styles.stopButtonText}>■ Parar Gravação</Text>
              </TouchableOpacity>
            </View>
          )}

          {audioUri && !isRecording && (
            <View style={styles.audioSuccessContainer}>
              <Text style={styles.audioSuccessText}>✔ Áudio gravado com sucesso</Text>
              <TouchableOpacity onPress={handleRemoverAudio}>
                <Text style={styles.reRecordText}>Regravar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
          onPress={handleSalvar}
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
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginTop: 20, marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10 },
  selectorButton: { flex: 1, paddingVertical: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 8, alignItems: 'center', backgroundColor: colors.surface },
  selectorActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  selectorText: { color: colors.textSecondary, fontWeight: '600' },
  selectorTextActive: { color: colors.surface },
  
  // A cor foi fixada em #000000 para sobrepor o texto branco forçado pelo Dark Mode
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 14, marginBottom: 12, fontSize: 16, color: '#000000' },
  
  statusContainer: { flexDirection: 'column', gap: 8 },
  statusButton: {
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  statusActiveConcluido: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  statusActivePendente: { backgroundColor: '#1976D2', borderColor: '#1976D2' },
  statusActiveRetirado: { backgroundColor: '#424242', borderColor: '#424242' },
  statusText: { color: colors.textSecondary, fontWeight: '600' },
  statusTextActive: { color: colors.surface },
  audioContainer: { marginBottom: 30 },
  recordButton: { backgroundColor: '#EAEAEA', borderWidth: 1, borderColor: '#CCC', paddingVertical: 20, borderRadius: 8, alignItems: 'center' },
  recordButtonText: { color: colors.text, fontWeight: 'bold', fontSize: 16 },
  recordingActiveContainer: { gap: 15 },
  timerText: { fontSize: 32, fontWeight: 'bold', color: colors.primary, textAlign: 'center' },
  stopButton: { backgroundColor: '#FFEBEB', borderWidth: 1, borderColor: colors.primary, paddingVertical: 20, borderRadius: 8, alignItems: 'center' },
  stopButtonText: { color: colors.primary, fontWeight: 'bold', fontSize: 16 },
  audioSuccessContainer: { backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#4CAF50', paddingVertical: 16, borderRadius: 8, alignItems: 'center', gap: 10 },
  audioSuccessText: { color: '#2E7D32', fontWeight: 'bold' },
  reRecordText: { color: colors.primary, textDecorationLine: 'underline', fontWeight: '600' },
  saveButton: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: colors.surface, fontWeight: 'bold', fontSize: 16 },
});