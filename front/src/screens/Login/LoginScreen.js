import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useStorage } from '../../hooks/useStorage';
import { login } from '../../services/api';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('recepcao@clinica.com');
  const [senha, setSenha] = useState('clinica123');
  const [carregando, setCarregando] = useState(false);
  const { setItem } = useStorage();

  const handleLogin = async () => {
    setCarregando(true);
    try {
      // Erros já vêm com mensagem apropriada:
      // 401 -> "E-mail ou senha inválidos."
      // sem rede -> "Não foi possível conectar ao servidor."
      const dados = await login(email, senha);
      await setItem('token', dados.token);
      await setItem('usuario', JSON.stringify(dados.usuario)); // { id, nome, perfil }
      navigation.replace('Menu');
    } catch (e) {
      Alert.alert('Erro', e.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Health Planner</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!carregando}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        editable={!carregando}
      />

      {carregando ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}

      <Text style={styles.teste}>
        {'\n'}Teste: recepcao@clinica.com / clinica123
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    borderRadius: 5,
  },
  teste: {
    marginTop: 20,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default LoginScreen;