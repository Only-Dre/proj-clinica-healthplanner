import React, { useState } from 'react';
import PacienteForm from '../../components/PacienteForm';
import { View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.110.12.82:3001';

const CadastroEdicaoPacienteScreen = ({ route, navigation }) => {
  const { paciente } = route.params || {};
  const [salvando, setSalvando] = useState(false);

  const handleSave = async (novoDadosPaciente) => {
    setSalvando(true);
    
    try {
      const editando = !!paciente;
      const url = editando
        ? `${BASE_URL}/pacientes/${paciente.id}`
        : `${BASE_URL}/pacientes`;

      const token = await AsyncStorage.getItem('token');

      // Cria timeout de 8s
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const resposta = await fetch(url, {
        method: editando ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(novoDadosPaciente),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!resposta.ok) {
        throw new Error(`Erro HTTP ${resposta.status} ao salvar paciente`);
      }

      const dados = await resposta.json();

      // Alert de sucesso
      Alert.alert(
        'Sucesso!',
        editando ? 'Paciente atualizado com sucesso' : 'Paciente cadastrado com sucesso',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

      return dados;
    } catch (e) {
      // Trata timeout
      if (e.name === 'AbortError') {
        Alert.alert('Erro', 'Tempo limite de 8s excedido. Tente novamente.');
      } else {
        Alert.alert('Erro', e.message || 'Erro desconhecido ao salvar');
      }
      throw e;
    } finally {
      setSalvando(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1 }}>
      <PacienteForm
        paciente={paciente}
        onSave={handleSave}
        onCancel={handleCancel}
        navigation={navigation}
        salvando={salvando}
      />
    </View>
  );
};

export default CadastroEdicaoPacienteScreen;