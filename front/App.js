// App.js
import React from 'react';
import {View, Text, StyleSheet} from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importa todos os componentes de tela
import LoginScreen from './src/screens/Login/LoginScreen';
import Splash from './src/screens/Splash/Splash';
import MenuScreen from './src/screens/Menu/MenuScreen';
import Medico from './src/screens/Medico/Medico';
import Paciente from './src/screens/Paciente/Paciente';
import Op3Screen from './src/screens/Consulta/Consulta';
import CadastroEdicaoMedicoScreen from './src/screens/Medico/CadastroEdicaoMedicoScreen';
import CadastroEdicaoPacienteScreen from './src/screens/Paciente/CadastroEdicaoPacienteScreen';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {/* Login é a primeira tela */}
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        
        {/* Depois vem o Menu */}
        <Stack.Screen name="Menu" component={MenuScreen} options={{ title: 'Menu Principal' }} />

        {/* Médicos */}
        <Stack.Screen name="Medicos" component={Medico} options={{ title: 'Médico(a)s' }} />
        <Stack.Screen name="MedicoForm" component={CadastroEdicaoMedicoScreen} options={{ title: 'Gerenciar Médico' }} />

        {/* Pacientes */}
        <Stack.Screen name="Pacientes" component={Paciente} options={{ title: 'Pacientes' }} />
        <Stack.Screen name="PacienteForm" component={CadastroEdicaoPacienteScreen} options={{ title: 'Gerenciar Paciente' }} />

        {/* Consultas */}
        <Stack.Screen name="Consultas" component={Op3Screen} options={{ title: 'Consultas' }} />

        {/* Tela de construção */}
        <Stack.Screen name="EmConstrucao" component={() => (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 24 }}>Em Construção!</Text>
            </View>
        )} options={{ title: 'Em Construção' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;