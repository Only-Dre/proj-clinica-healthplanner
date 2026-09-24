import React from 'react';
import MedicoForm from '../../components/MedicoForm';
import { View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.110.12.82:3001';

const CadastroEdicaoMedicoScreen = ({ route, navigation }) => {
  const { medico } = route.params || {};

  const handleSave = async (novoDadosMedico) => {
    const editando = !!medico;
    const url = editando
      ? `${BASE_URL}/medicos/${medico.id}`
      : `${BASE_URL}/medicos`;

    const token = await AsyncStorage.getItem('token');

    // Cria timeout de 8s
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const resposta = await fetch(url, {
        method: editando ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(novoDadosMedico),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!resposta.ok) {
        throw new Error(`Erro HTTP ${resposta.status} ao salvar médico`);
      }

      return await resposta.json();
    } catch (e) {
      clearTimeout(timeout);
      
      // Trata timeout
      if (e.name === 'AbortError') {
        throw new Error('Tempo limite de 8s excedido. Tente novamente.');
      }
      
      throw e;
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1 }}>
      <MedicoForm
        medico={medico}
        onSave={handleSave}
        onCancel={handleCancel}
        navigation={navigation}
      />
    </View>
  );
};

export default CadastroEdicaoMedicoScreen;