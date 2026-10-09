import { useEffect, useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
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
  const [estadoBiometria, setEstadoBiometria] = useState(null);
  const { getItem, setItem } = useStorage();

  useEffect(() => {
    let ativo = true;
    const verificarBiometria = async () => {
      const token = await getItem('token');
      if (!ativo || !token) return;

      try {
        const temHardware = await LocalAuthentication.hasHardwareAsync();
        if (!temHardware) {
          setEstadoBiometria('Este aparelho não possui sensor biométrico.');
          return;
        }

        const biometriaCadastrada = await LocalAuthentication.isEnrolledAsync();
        if (!biometriaCadastrada) {
          setEstadoBiometria('Este aparelho não possui biometria cadastrada.');
          return;
        }

        setEstadoBiometria('disponivel');
      } catch {
        if (ativo) {
          setEstadoBiometria('Não foi possível verificar a biometria deste aparelho.');
        }
      }
    };

    verificarBiometria();
    return () => {
      ativo = false;
    };
  }, []);

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

  const handleLoginBiometrico = async () => {
    setCarregando(true);
    try {
      const resultado = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Desbloquear a sessão salva do HealthPlanner',
        cancelLabel: 'Entrar com e-mail e senha',
        disableDeviceFallback: true,
      });

      if (!resultado.success) {
        if (
          resultado.error !== 'user_cancel' &&
          resultado.error !== 'system_cancel' &&
          resultado.error !== 'app_cancel'
        ) {
          Alert.alert('Biometria não concluída', 'Tente novamente ou entre com e-mail e senha.');
        }
        return;
      }

      const token = await getItem('token');
      if (!token) {
        setEstadoBiometria(null);
        Alert.alert('Sessão indisponível', 'Entre com e-mail e senha para iniciar uma nova sessão.');
        return;
      }

      navigation.replace('Menu');
    } catch {
      Alert.alert('Erro', 'Não foi possível desbloquear a sessão. Entre com e-mail e senha.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Health Planner</Text>

      {estadoBiometria === 'disponivel' && (
        <View style={styles.biometria}>
          <Button
            title="Entrar com biometria"
            onPress={handleLoginBiometrico}
            disabled={carregando}
          />
          <Text style={styles.infoBiometria}>
            A biometria desbloqueia a sessão salva; ela não autentica na API.
          </Text>
        </View>
      )}

      {estadoBiometria && estadoBiometria !== 'disponivel' && (
        <Text style={styles.infoBiometria}>{estadoBiometria}</Text>
      )}

      <Text style={styles.subtitulo}>Entrar com e-mail e senha</Text>
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
      ) : null}
      <Button
        title="Entrar com e-mail e senha"
        onPress={handleLogin}
        disabled={carregando}
      />

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
  subtitulo: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  biometria: {
    marginBottom: 24,
  },
  infoBiometria: {
    color: '#555',
    textAlign: 'center',
    marginBottom: 18,
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