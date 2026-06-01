// src/services/StorageService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

// Chave única para evitar conflitos no armazenamento do celular
const OS_STORAGE_KEY = "@audita_ponto_os";

export interface OrdemServico {
  id: string;
  tipo: "REP" | "Controle de Acesso";
  fabricante: string;
  modelo: string;
  numeroSerie: string;
  empresa: string;
  status: "Concluído" | "Pendente" | "Retirado para manutenção";
  audioUri: string | null;
  transcricao: string | null;
  dataCriacao: string;
}
export const StorageService = {
  // Salva uma nova Ordem de Serviço
  async salvarOS(novaOS: OrdemServico): Promise<void> {
    try {
      const osExistentes = await this.buscarTodasOS();
      const listaAtualizada = [...osExistentes, novaOS];
      await AsyncStorage.setItem(
        OS_STORAGE_KEY,
        JSON.stringify(listaAtualizada),
      );
    } catch (error) {
      console.error("Erro ao salvar OS:", error);
      throw new Error(
        "Falha ao persistir a Ordem de Serviço no armazenamento local.",
      );
    }
  },

  // Retorna todas as Ordens de Serviço (usado no Dashboard)
  async buscarTodasOS(): Promise<OrdemServico[]> {
    try {
      const dados = await AsyncStorage.getItem(OS_STORAGE_KEY);
      return dados ? JSON.parse(dados) : [];
    } catch (error) {
      console.error("Erro ao buscar OSs:", error);
      throw new Error("Falha ao recuperar a lista de Ordens de Serviço.");
    }
  },

  // Retorna uma OS específica pelo ID (usado na Tela de Detalhes)
  async buscarOSPorId(id: string): Promise<OrdemServico | undefined> {
    try {
      const osExistentes = await this.buscarTodasOS();
      return osExistentes.find((os) => os.id === id);
    } catch (error) {
      console.error(`Erro ao buscar OS com ID ${id}:`, error);
      throw new Error("Falha ao recuperar os detalhes desta Ordem de Serviço.");
    }
  },
};
