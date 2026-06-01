import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { OrdemServico, StorageService } from '../../services/StorageService';
import { colors } from '../../theme/colors';

export default function DetalhesOSTela() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [os, setOs] = useState<OrdemServico | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const carregarDetalhes = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const dados = await StorageService.buscarOSPorId(id);
      if (dados) {
        setOs(dados);
      } else {
        Alert.alert('Ordem de Serviço não encontrada.');
        router.back();
      }
    } catch (error) {
      Alert.alert('Falha ao carregar os detalhes da O.S.');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarDetalhes();
    }, [id])
  );

  const alterarStatus = async (novoStatus: OrdemServico['status']) => {
    if (!os || os.status === novoStatus) return;
    
    setIsSaving(true);
    try {
      const osAtualizada = { ...os, status: novoStatus };
      await StorageService.atualizarOS(osAtualizada);
      setOs(osAtualizada);
      Alert.alert(' Ordem de Serviço atualizada com sucesso.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a ordem de serviço.');
    } finally {
      setIsSaving(false);
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
        <Text style={styles.value}>{new Date(os.dataCriacao).toLocaleDateString('pt-PT')}</Text>
      </View>

      <Text style={styles.sectionTitle}>Alterar Estado</Text>
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
                os.status === opcao && activeStyle
              ]}
              onPress={() => alterarStatus(opcao)}
              disabled={isSaving}
            >
              {isSaving && os.status !== opcao ? (
                <ActivityIndicator color={colors.textSecondary} size="small" />
              ) : (
                <Text style={[
                  styles.statusText, 
                  os.status === opcao && styles.statusTextActive
                ]}>
                  {opcao}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: 'bold',
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
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 5,
  },
  statusContainer: {
    flexDirection: 'column',
    gap: 8,
  },
 statusButton: {
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  // NOVOS ESTILOS SEMÂNTICOS
  statusActiveConcluido: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  statusActivePendente: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  statusActiveRetirado: {
    backgroundColor: '#424242',
    borderColor: '#424242',
  },
  statusText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 15,
  },
  statusTextActive: {
    color: colors.surface, // Mantém o texto branco quando selecionado
  },
});