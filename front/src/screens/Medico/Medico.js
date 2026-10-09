// src/screens/Medico/Medico.js
//
// Lista de médicos: GET /medicos, exclusão com confirmação (DELETE).
// Todas as chamadas passam por src/services/api.js (token, timeout, 401).
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  LayoutAnimation,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  excluirMedico as apiExcluirMedico,
  irParaLogin,
  listarMedicos,
  sessaoExpirou,
} from "../../services/api";

const IconeLupa = require("../../../assets/lupa.png");
const IconeSeta = require("../../../assets/seta.png");

// =========================================================================
// FUNCAO AUXILIAR PARA AGRUPAR E FILTRAR OS DADOS (defensiva: campos podem faltar)
// =========================================================================
const groupAndFilterMedicos = (medicos, searchText) => {
  const busca = searchText.toLowerCase();

  const filteredMedicos = medicos.filter(
    (medico) =>
      (medico.nome || "").toLowerCase().includes(busca) ||
      (medico.especialidade || "").toLowerCase().includes(busca),
  );

  const grouped = filteredMedicos.reduce((acc, medico) => {
    const firstLetter = (medico.nome?.[0] || "#").toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(medico);
    return acc;
  }, {});

  return Object.keys(grouped)
    .sort()
    .map((letter) => ({
      title: letter,
      data: grouped[letter],
    }));
};

// =========================================================================
// COMPONENTE CARD EXPANSIVEL
// =========================================================================
const MedicoCard = ({ medico, navigation, onExcluir }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={cardStyles.card}>
      <TouchableOpacity onPress={toggleExpand} style={cardStyles.mainInfo}>
        <View>
          <Text style={cardStyles.nome}>{medico.nome}</Text>
          <Text style={cardStyles.especialidade}>
            {medico.especialidade} | CRM: {medico.crm}
          </Text>
        </View>

        <Image
          source={IconeSeta}
          style={[
            cardStyles.arrowIcon,
            { transform: [{ rotate: isExpanded ? "90deg" : "0deg" }] },
          ]}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={cardStyles.details}>
          <Text style={cardStyles.detailText}>Email: {medico.email}</Text>
          <Text style={cardStyles.detailText}>Telefone: {medico.telefone}</Text>
          <Text style={cardStyles.detailText}>Endereço: {medico.endereco}</Text>

          <View style={cardStyles.actionButtons}>
            <Button
              title="Editar"
              onPress={() => navigation.navigate("MedicoForm", { medico })}
            />
            <Button
              title="Excluir"
              color="red"
              onPress={() => onExcluir(medico)}
            />
          </View>
        </View>
      )}
    </View>
  );
};

// =========================================================================
// TELA PRINCIPAL
// =========================================================================
const Medico = ({ navigation }) => {
  const [medicos, setMedicos] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const buscarMedicos = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await listarMedicos();
      setMedicos(dados);
    } catch (e) {
      if (sessaoExpirou(e)) {
        irParaLogin(navigation);
        return;
      }
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  };

  // A lista se atualiza toda vez que a tela recebe o foco (volta do
  // formulario de cadastro/edicao, por exemplo), nao so na primeira montagem.
  useFocusEffect(
    useCallback(() => {
      buscarMedicos();
    }, []),
  );

  // ---------------------------------------------------------------------
  // EXCLUSAO - DELETE /medicos/:id
  // ---------------------------------------------------------------------
  const excluirMedico = async (medico) => {
    try {
      await apiExcluirMedico(medico.id);
      await buscarMedicos();
    } catch (e) {
      if (sessaoExpirou(e)) {
        irParaLogin(navigation);
        return;
      }
      Alert.alert("Não foi possível excluir", e.message);
    }
  };

  const confirmarExclusao = (medico) => {
    Alert.alert("Excluir médico", `Deseja realmente excluir ${medico.nome}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => excluirMedico(medico),
      },
    ]);
  };

  const sections = groupAndFilterMedicos(medicos, searchText);

  if (carregando && medicos.length === 0) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" />
        <Text style={styles.textoCentro}>Carregando médicos...</Text>
      </View>
    );
  }

  if (erro && medicos.length === 0) {
    return (
      <View style={styles.centro}>
        <Text style={styles.textoErro}>
          Não foi possível carregar os médicos.
        </Text>
        <Text style={styles.textoCentro}>{erro}</Text>
        <Button title="Tentar novamente" onPress={buscarMedicos} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* CAMPO PESQUISAR (Nao rolavel) */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar Médico ou Especialidade"
          value={searchText}
          onChangeText={setSearchText}
        />
        <Image source={IconeLupa} style={styles.searchIcon} />
      </View>

      {erro && (
        <Text style={styles.avisoErro}>
          Não foi possível atualizar a lista: {erro}
        </Text>
      )}

      {/* LISTA ROLAVEL */}
      <View style={styles.listWrapper}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MedicoCard
              medico={item}
              navigation={navigation}
              onExcluir={confirmarExclusao}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          contentContainerStyle={styles.sectionListContent}
          stickySectionHeadersEnabled={true}
          onRefresh={buscarMedicos}
          refreshing={carregando}
        />
      </View>

      {/* BOTAO FIXO */}
      <View style={styles.fixedButtonContainer}>
        <Button
          title="Cadastrar Novo Perfil"
          onPress={() => navigation.navigate("MedicoForm")}
        />
      </View>
    </View>
  );
};

// =========================================================================
// ESTILOS
// =========================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  centro: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  textoCentro: { marginTop: 8, color: "#444", textAlign: "center" },
  textoErro: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#c0392b",
    textAlign: "center",
    marginBottom: 8,
  },
  avisoErro: {
    color: "#c0392b",
    backgroundColor: "#fdf1f1",
    borderWidth: 1,
    borderColor: "#e6c4c4",
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginLeft: 10,
    tintColor: "#aaa",
  },
  listWrapper: {
    flex: 1,
  },
  sectionListContent: {
    paddingBottom: 10,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    backgroundColor: "#f5f5f5",
    paddingVertical: 5,
    paddingHorizontal: 10,
    color: "#333",
  },
  fixedButtonContainer: {
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    marginBottom: 25,
  },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 5,
    marginHorizontal: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },
  mainInfo: {
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },
  especialidade: {
    fontSize: 14,
    color: "#555",
  },
  arrowIcon: {
    width: 15,
    height: 15,
    tintColor: "#007AFF",
  },
  details: {
    padding: 15,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  detailText: {
    fontSize: 14,
    marginBottom: 5,
    color: "#333",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
});

export default Medico;