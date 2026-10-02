import { View } from 'react-native';
import MedicoForm from '../../components/MedicoForm';
import { irParaLogin, salvarMedico, sessaoExpirou } from '../../services/api';

const CadastroEdicaoMedicoScreen = ({ route, navigation }) => {
  const { medico } = route.params || {};

  // O erro é relançado para o MedicoForm exibir (mesmo padrão de antes).
  // Timeout, token e 401 são tratados em services/api.js.
  const handleSave = async (novoDadosMedico) => {
    try {
      // Com id => PUT (o servidor substitui o registro inteiro, então o
      // formulário precisa enviar todos os campos). Sem id => POST.
      const payload = medico
        ? { ...novoDadosMedico, id: medico.id }
        : novoDadosMedico;

      return await salvarMedico(payload);
    } catch (e) {
      if (sessaoExpirou(e)) {
        irParaLogin(navigation);
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