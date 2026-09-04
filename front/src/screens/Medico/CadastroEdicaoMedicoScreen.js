// src/screens/Medico/CadastroEdicaoMedicoScreen.js
//
// Aula 3 - Passo 4: handleSave deixou de ser um console.log e passou a
// gravar de verdade no servidor (POST para cadastrar, PUT para editar).
import React from 'react';
import MedicoForm from '../../components/MedicoForm';
import { View } from 'react-native';
import { useRoute } from '@react-navigation/native';

// Em dispositivo fisico (Expo Go), troque pelo IP da maquina rodando o
// json-server, na mesma rede Wi-Fi.
const BASE_URL = 'http://localhost:3000';

const CadastroEdicaoMedicoScreen = ({ route, navigation }) => {
  // A prop 'medico' vira via route.params
  const { medico } = route.params || {};

  // handleSave decide o verbo pelo modo da tela: sem medico -> POST
  // (cadastro); com medico -> PUT no id existente (edicao).
  const handleSave = async (novoDadosMedico) => {
    const editando = !!medico;
    const url = editando
      ? `${BASE_URL}/medicos/${medico.id}`
      : `${BASE_URL}/medicos`;

    const resposta = await fetch(url, {
      method: editando ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoDadosMedico),
    });

    if (!resposta.ok) {
      throw new Error(`Erro HTTP ${resposta.status} ao salvar médico`);
    }

    return await resposta.json();
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
