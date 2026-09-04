// src/screens/Paciente/CadastroEdicaoPacienteScreen.js
//
// Espelha CadastroEdicaoMedicoScreen.js: POST para cadastrar, PUT para
// editar, sobre o endpoint /pacientes.
import React from 'react';
import PacienteForm from '../../components/PacienteForm';
import { View } from 'react-native';

// Em dispositivo fisico (Expo Go), troque pelo IP da maquina rodando o
// json-server, na mesma rede Wi-Fi.
const BASE_URL = 'http://localhost:3000';

const CadastroEdicaoPacienteScreen = ({ route, navigation }) => {
  const { paciente } = route.params || {};

  const handleSave = async (novoDadosPaciente) => {
    const editando = !!paciente;
    const url = editando
      ? `${BASE_URL}/pacientes/${paciente.id}`
      : `${BASE_URL}/pacientes`;

    const resposta = await fetch(url, {
      method: editando ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoDadosPaciente),
    });

    if (!resposta.ok) {
      throw new Error(`Erro HTTP ${resposta.status} ao salvar paciente`);
    }

    return await resposta.json();
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
      />
    </View>
  );
};

export default CadastroEdicaoPacienteScreen;
