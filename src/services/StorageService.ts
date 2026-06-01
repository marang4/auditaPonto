
import AsyncStorage from "@react-native-async-storage/async-storage";


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
        "Falha ao salvar a o.s localmente.",
      );
    }
  },

 
  async buscarTodasOS(): Promise<OrdemServico[]> {
    try {
      const dados = await AsyncStorage.getItem(OS_STORAGE_KEY);
      return dados ? JSON.parse(dados) : [];
    } catch (error) {
      console.error("Erro ao buscar OS:", error);
      throw new Error("Falha ao recuperar a lista de Ordens de Serviço.");
    }
  },

  
  async buscarOSPorId(id: string): Promise<OrdemServico | undefined> {
  
      const osExistentes = await this.buscarTodasOS();
      return osExistentes.find((os) => os.id === id);


  },

  async atualizarOS(osAtualizada: OrdemServico): Promise<void> {
   
      const osExistentes = await this.buscarTodasOS();
      const index = osExistentes.findIndex(os => os.id === osAtualizada.id);

      if (index === -1) {
        throw new Error("Ordem de Serviço não encontrada.");
      }

      osExistentes[index] = osAtualizada;
      
      await AsyncStorage.setItem(
        OS_STORAGE_KEY,
        JSON.stringify(osExistentes)
      );

  },
};
