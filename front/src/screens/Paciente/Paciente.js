// src/screens/Paciente/Paciente.js
//
// Aula 3 - Passo 3 (leitura via GET /pacientes, FlatList simples, sem
// agrupamento por letra) + Passo 7 - extensao (escrita: POST/PUT/DELETE
// seguindo o mesmo padrao aplicado em Medico.js).
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Button,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// Em dispositivo fisico (Expo Go), troque pelo IP da maquina rodando o
// json-server, na mesma rede Wi-Fi.
const BASE_URL = 'http://localhost:3000';

const PacienteCard = ({ paciente, navigation, onExcluir }) => (
  <View style={cardStyles.card}>
    <Text style={cardStyles.nome}>{paciente.nome}</Text>
    <Text style={cardStyles.detalhe}>CPF: {paciente.cpf}</Text>
    <Text style={cardStyles.detalhe}>Nascimento: {paciente.dataNascimento}</Text>
    <Text style={cardStyles.detalhe}>Telefone: {paciente.telefone}</Text>
    <Text style={cardStyles.detalhe}>Email: {paciente.email}</Text>
    <View style={cardStyles.actionButtons}>
      <Button
        title="Editar"
        onPress={() => navigation.navigate('PacienteForm', { paciente })}
      />
      <Button title="Excluir" color="red" onPress={() => onExcluir(paciente)} />
    </View>
  </View>
);

const Paciente = ({ navigation }) => {
  const [pacientes, setPacientes] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const buscarPacientes = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await fetch(`${BASE_URL}/pacientes`);
      if (!resposta.ok) {
        throw new Error(`Erro HTTP ${resposta.status}`);
      }
      const dados = await resposta.json();
      setPacientes(dados);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buscarPacientes();
    }, [])
  );

  const excluirPaciente = async (paciente) => {
    try {
      const resposta = await fetch(`${BASE_URL}/pacientes/${paciente.id}`, {
        method: 'DELETE',
      });
      if (!resposta.ok) {
        throw new Error(`Erro HTTP ${resposta.status} ao excluir`);
      }
      await buscarPacientes();
    } catch (e) {
      Alert.alert('Não foi possível excluir', e.message);
    }
  };

  const confirmarExclusao = (paciente) => {
    Alert.alert(
      'Excluir paciente',
      `Deseja realmente excluir ${paciente.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => excluirPaciente(paciente) },
      ]
    );
  };

  const filtrados = pacientes.filter((p) =>
    p.nome.toLowerCase().includes(searchText.toLowerCase()) ||
    (p.cpf || '').includes(searchText)
  );

  if (carregando && pacientes.length === 0) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" />
        <Text style={styles.textoCentro}>Carregando pacientes...</Text>
      </View>
    );
  }

  if (erro && pacientes.length === 0) {
    return (
      <View style={styles.centro}>
        <Text style={styles.textoErro}>Não foi possível carregar os pacientes.</Text>
        <Text style={styles.textoCentro}>{erro}</Text>
        <Button title="Tentar novamente" onPress={buscarPacientes} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar paciente por nome ou CPF"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {erro && (
        <Text style={styles.avisoErro}>Não foi possível atualizar a lista: {erro}</Text>
      )}

      <FlatList
        style={styles.listWrapper}
        data={filtrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PacienteCard paciente={item} navigation={navigation} onExcluir={confirmarExclusao} />
        )}
        onRefresh={buscarPacientes}
        refreshing={carregando}
        ListEmptyComponent={
          <Text style={styles.textoCentro}>Nenhum paciente encontrado.</Text>
        }
      />

      <View style={styles.fixedButtonContainer}>
        <Button
          title="Cadastrar Novo Paciente"
          onPress={() => navigation.navigate('PacienteForm')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  textoCentro: { marginTop: 8, color: '#444', textAlign: 'center' },
  textoErro: { fontSize: 16, fontWeight: 'bold', color: '#c0392b', textAlign: 'center', marginBottom: 8 },
  avisoErro: {
    color: '#c0392b',
    backgroundColor: '#fdf1f1',
    borderWidth: 1,
    borderColor: '#e6c4c4',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    fontSize: 12,
  },
  searchContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  searchInput: { height: 40 },
  listWrapper: { flex: 1 },
  fixedButtonContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginBottom: 25,
  },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 5,
    padding: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  nome: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
  detalhe: { fontSize: 14, color: '#555', marginTop: 2 },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
});

export default Paciente;
