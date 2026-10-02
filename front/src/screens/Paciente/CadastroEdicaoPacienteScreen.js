import { useState } from 'react';
import { Alert, View } from 'react-native';
import PacienteForm from '../../components/PacienteForm';
import { irParaLogin, salvarPaciente, sessaoExpirou } from '../../services/api';

const CadastroEdicaoPacienteScreen = ({ route, navigation }) => {
  const { paciente } = route.params || {};
  const [salvando, setSalvando] = useState(false);

  const handleSave = async (novoDadosPaciente) => {
    setSalvando(true);

    try {
      const editando = !!paciente;

      // Com id => PUT (o servidor substitui o registro inteiro, então o
      // formulário precisa enviar todos os campos). Sem id => POST.
      const payload = editando
        ? { ...novoDadosPaciente, id: paciente.id }
        : novoDadosPaciente;

      // Timeout (8s) e limpeza dele ficam em services/api.js
      const dados = await salvarPaciente(payload);

      Alert.alert(
        'Sucesso!',
        editando
          ? 'Paciente atualizado com sucesso'
          : 'Paciente cadastrado com sucesso',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

      return dados;
    } catch (e) {
      if (sessaoExpirou(e)) {
        irParaLogin(navigation);
        throw e;
      }
      // Mantido: a tela mostra o alerta de erro e relança.
      // Se o PacienteForm também mostrar alerta, remova UM dos dois
      // (me envie o PacienteForm que eu confirmo qual).
      Alert.alert('Erro', e.message || 'Erro desconhecido ao salvar');
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