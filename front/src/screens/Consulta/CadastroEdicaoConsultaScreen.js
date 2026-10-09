import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
  salvarConsultaMock,
} from '../../services/consultas';
import {
  irParaLogin,
  listarMedicos,
  listarPacientes,
  sessaoExpirou,
} from '../../services/api';
import {
  agendarLembreteConsulta,
  cancelarLembreteConsulta,
} from '../../services/notificacoes';

const CadastroEdicaoConsultaScreen = ({ route, navigation }) => {
  const consultaOriginal = route.params?.consulta;
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicoId, setMedicoId] = useState(String(consultaOriginal?.medicoId || ''));
  const [pacienteId, setPacienteId] = useState(String(consultaOriginal?.pacienteId || ''));
  const [data, setData] = useState(consultaOriginal?.data || '');
  const [hora, setHora] = useState(consultaOriginal?.hora || '');
  const [carregandoListas, setCarregandoListas] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    Promise.all([listarMedicos(), listarPacientes()])
      .then(([listaMedicos, listaPacientes]) => {
        if (!ativo) return;
        setMedicos(listaMedicos);
        setPacientes(listaPacientes);
        if (!consultaOriginal) {
          setMedicoId(String(listaMedicos[0]?.id || ''));
          setPacienteId(String(listaPacientes[0]?.id || ''));
        }
      })
      .catch((falha) => {
        if (!ativo) return;
        if (sessaoExpirou(falha)) {
          irParaLogin(navigation);
          return;
        }
        setErro(falha.message);
      })
      .finally(() => {
        if (ativo) setCarregandoListas(false);
      });

    return () => {
      ativo = false;
    };
  }, [consultaOriginal, navigation]);

  const handleSave = async () => {
    setErro('');
    if (!medicoId || !pacienteId || !/^\d{4}-\d{2}-\d{2}$/.test(data) || !/^\d{2}:\d{2}$/.test(hora)) {
      setErro('Selecione médico e paciente e informe data (AAAA-MM-DD) e hora (HH:MM).');
      return;
    }

    const [ano, mes, dia] = data.split('-').map(Number);
    const [horas, minutos] = hora.split(':').map(Number);
    const dataHora = new Date(ano, mes - 1, dia, horas, minutos);
    if (
      dataHora.getFullYear() !== ano ||
      dataHora.getMonth() !== mes - 1 ||
      dataHora.getDate() !== dia ||
      horas > 23 ||
      minutos > 59
    ) {
      setErro('A data ou hora informada não é válida.');
      return;
    }
    if (dataHora <= new Date()) {
      setErro('A consulta deve ser agendada para uma data e hora futuras.');
      return;
    }

    setSalvando(true);
    try {
      const medico = medicos.find((item) => String(item.id) === medicoId);
      const paciente = pacientes.find((item) => String(item.id) === pacienteId);
      const salvo = await salvarConsultaMock({
        ...(consultaOriginal || {}),
        medicoId: Number(medicoId),
        medicoNome: medico?.nome || 'médico(a)',
        pacienteId: Number(pacienteId),
        pacienteNome: paciente?.nome || 'paciente',
        data,
        hora,
        notificationId: null,
      });

      if (consultaOriginal?.notificationId) {
        try {
          await cancelarLembreteConsulta(consultaOriginal.notificationId);
        } catch (falhaCancelamento) {
          Alert.alert(
            'Consulta salva',
            `Não foi possível substituir o lembrete anterior: ${falhaCancelamento.message}`,
            [{ text: 'OK', onPress: () => navigation.goBack() }],
          );
          return;
        }
      }

      let novoLembrete;
      try {
        novoLembrete = await agendarLembreteConsulta(salvo, salvo.medicoNome);
        await salvarConsultaMock({ ...salvo, notificationId: novoLembrete });
        Alert.alert('Consulta agendada', 'Um lembrete local foi programado para uma hora antes da consulta.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } catch (falhaLembrete) {
        let detalheCancelamento = '';
        if (novoLembrete) {
          try {
            await cancelarLembreteConsulta(novoLembrete);
          } catch (falhaCancelamento) {
            detalheCancelamento = ` Não foi possível cancelar a notificação incompleta: ${falhaCancelamento.message}`;
          }
        }
        Alert.alert(
          'Consulta salva sem lembrete',
          `A consulta foi salva no mock server, mas não foi possível programar a notificação: ${falhaLembrete.message}.${detalheCancelamento}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      }
    } catch (falha) {
      if (sessaoExpirou(falha)) {
        irParaLogin(navigation);
        return;
      }
      setErro(falha.message);
    } finally {
      setSalvando(false);
    }
  };

  if (carregandoListas) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" />
        <Text>Carregando médicos e pacientes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        {consultaOriginal ? 'Editar consulta' : 'Agendar consulta'}
      </Text>

      {!!erro && <Text style={styles.erro}>{erro}</Text>}

      <Text style={styles.label}>Paciente</Text>
      <View style={styles.picker}>
        <Picker selectedValue={pacienteId} onValueChange={setPacienteId}>
          {pacientes.map((paciente) => (
            <Picker.Item
              key={paciente.id}
              label={paciente.nome}
              value={String(paciente.id)}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Médico(a)</Text>
      <View style={styles.picker}>
        <Picker selectedValue={medicoId} onValueChange={setMedicoId}>
          {medicos.map((medico) => (
            <Picker.Item
              key={medico.id}
              label={medico.nome}
              value={String(medico.id)}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Data (AAAA-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={data}
        onChangeText={setData}
        placeholder="2026-12-31"
        keyboardType="numbers-and-punctuation"
        editable={!salvando}
      />

      <Text style={styles.label}>Hora (HH:MM)</Text>
      <TextInput
        style={styles.input}
        value={hora}
        onChangeText={setHora}
        placeholder="14:30"
        keyboardType="numbers-and-punctuation"
        editable={!salvando}
      />

      <Text style={styles.ajuda}>
        O app tentará enviar um lembrete local uma hora antes da consulta.
      </Text>
      <Button
        title={salvando ? 'Salvando...' : 'Salvar consulta'}
        onPress={handleSave}
        disabled={salvando || medicos.length === 0 || pacientes.length === 0}
      />
      <View style={styles.cancelar}>
        <Button
          title="Cancelar"
          color="#666"
          onPress={() => navigation.goBack()}
          disabled={salvando}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  erro: {
    color: '#a93226',
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    overflow: 'hidden',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
  },
  ajuda: {
    color: '#555',
    marginVertical: 18,
  },
  cancelar: {
    marginTop: 10,
  },
});

export default CadastroEdicaoConsultaScreen;
