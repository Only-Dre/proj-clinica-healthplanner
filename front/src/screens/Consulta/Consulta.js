import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  excluirConsultaMock,
  listarConsultasMock,
} from '../../services/consultas';
import { cancelarLembreteConsulta } from '../../services/notificacoes';
import {
  irParaLogin,
  listarMedicos,
  listarPacientes,
  sessaoExpirou,
} from '../../services/api';

const Consulta = ({ navigation }) => {
  const [consultas, setConsultas] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarDados = async () => {
    setCarregando(true);
    setErro('');
    try {
      const [dadosConsultas, dadosMedicos, dadosPacientes] = await Promise.all([
        listarConsultasMock(),
        listarMedicos(),
        listarPacientes(),
      ]);
      setConsultas(dadosConsultas);
      setMedicos(dadosMedicos);
      setPacientes(dadosPacientes);
    } catch (falha) {
      if (sessaoExpirou(falha)) {
        irParaLogin(navigation);
        return;
      }
      setErro(falha.message);
    } finally {
      setCarregando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [navigation]),
  );

  const cancelarConsulta = (consulta) => {
    Alert.alert('Cancelar consulta', 'Deseja cancelar esta consulta agendada?', [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Cancelar consulta',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelarLembreteConsulta(consulta.notificationId);
            await excluirConsultaMock(consulta.id);
            await carregarDados();
          } catch (falha) {
            Alert.alert('Não foi possível cancelar', falha.message);
          }
        },
      },
    ]);
  };

  const nomePorId = (lista, id) =>
    lista.find((item) => String(item.id) === String(id))?.nome || 'Não informado';

  if (carregando && consultas.length === 0) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" />
        <Text>Carregando consultas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!!erro && (
        <View style={styles.erroBox}>
          <Text style={styles.erro}>{erro}</Text>
          <Button title="Tentar novamente" onPress={carregarDados} />
        </View>
      )}
      <FlatList
        data={consultas}
        keyExtractor={(consulta) => String(consulta.id)}
        onRefresh={carregarDados}
        refreshing={carregando}
        ListEmptyComponent={
          !erro ? <Text style={styles.vazio}>Nenhuma consulta agendada.</Text> : null
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nome}>{nomePorId(pacientes, item.pacienteId)}</Text>
            <Text>Médico(a): {nomePorId(medicos, item.medicoId)}</Text>
            <Text>Data: {item.data} às {item.hora}</Text>
            <View style={styles.acoes}>
              <Button
                title="Editar"
                onPress={() => navigation.navigate('ConsultaForm', { consulta: item })}
              />
              <Button
                title="Cancelar"
                color="#c0392b"
                onPress={() => cancelarConsulta(item)}
              />
            </View>
          </View>
        )}
      />
      <View style={styles.rodape}>
        <Button
          title="Agendar consulta"
          onPress={() => navigation.navigate('ConsultaForm')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f5f5f5',
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  erroBox: {
    padding: 12,
    gap: 8,
  },
  erro: {
    color: '#a93226',
  },
  vazio: {
    textAlign: 'center',
    marginTop: 32,
    color: '#555',
  },
  card: {
    padding: 16,
    marginVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 8,
    gap: 6,
  },
  nome: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  acoes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  rodape: {
    paddingVertical: 10,
  },
});

export default Consulta;
