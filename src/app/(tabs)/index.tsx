import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { OrdemServico, StorageService } from '../../services/StorageService';
import { colors } from '../../theme/colors';

export default function DashboardTela() {
  const router = useRouter();
  
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const carregarOrdens = async () => {
    setIsLoading(true);
    try {
      const dados = await StorageService.buscarTodasOS();
      setOrdens(dados || []);
    } catch (error) {
      console.error('Erro ao carregar Ordens de Serviço:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarOrdens();
    }, [])
  );

  const renderItem = ({ item }: { item: OrdemServico }) => {
    // Roteamento dinâmico da cor do selo no Dashboard
    let badgeStyle;
    if (item.status === 'Concluído') badgeStyle = styles.badgeConcluido;
    else if (item.status === 'Pendente') badgeStyle = styles.badgePendente;
    else if (item.status === 'Retirado para manutenção') badgeStyle = styles.badgeRetirado;

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push(`/detalhes/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.tipo} - {item.fabricante}</Text>
          <View style={[styles.badge, badgeStyle]}>
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.cardSubtitle}>Modelo: {item.modelo}</Text>
        <Text style={styles.cardSubtitle}>Empresa: {item.empresa}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : ordens.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhuma Ordem de Serviço registada.</Text>
        </View>
      ) : (
        <FlatList
          data={ordens}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loader: {
    marginTop: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeConcluido: {
    backgroundColor: '#2E7D32', // Verde
  },
  badgePendente: {
    backgroundColor: '#1976D2', // Azul
  },
  badgeRetirado: {
    backgroundColor: '#424242', // Cinza escuro
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF', // Fonte branca para dar contraste de leitura
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});