import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Platform,
  SafeAreaView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const especialidades = ['Cardiologia', 'Pediatria', 'Dermatologia', 'Ginecologia', 'Neurologia', 'Oftalmologia', 'Clínica Geral'];

const initialMedicoState = {
  nome: '',
  especialidade: especialidades[0],
  crm: '',
  email: '',
  telefone: '',
  logradouro: '',
  numero: '',
  complemento: '',
  cidade: '',
  uf: '',
  cep: '',
};

const MedicoForm = ({ medico, onSave, onCancel, navigation }) => {
  // Inicializa uma vez apenas
  const [formData, setFormData] = useState(() => medico ? { ...medico } : initialMedicoState);
  const [errors, setErrors] = useState({});
  const [salvando, setSalvando] = useState(false);

  const isEditing = useMemo(() => !!medico, [medico?.id]);
  const buttonTitle = isEditing ? 'Concluir Edição' : 'Concluir Cadastro';

  const requiredFields = [
    'nome', 'especialidade', 'crm', 'email', 'telefone', 
    'logradouro', 'numero', 'cidade', 'uf', 'cep'
  ];

  // Função estável para atualizar campo
  const handleChange = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const validate = useCallback(() => {
    let valid = true;
    const newErrors = {};

    requiredFields.forEach(field => {
      if (!formData[field] || String(formData[field]).trim() === '') {
        newErrors[field] = 'Campo Obrigatório';
        valid = false;
      }
    });

    setErrors(newErrors);
    return valid;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setSalvando(true);
    try {
      await onSave(formData);
    } catch (e) {
      Alert.alert('Não foi possível salvar', e.message);
    } finally {
      setSalvando(false);
    }
  }, [formData, validate, onSave]);
  
  const ValidatedInput = useCallback(({ label, name, ...props }) => (
    <View style={formStyles.inputGroup}>
      <Text style={formStyles.label}>{label}</Text>
      <TextInput
        style={[formStyles.input, errors[name] && formStyles.inputError]}
        value={formData[name]}
        onChangeText={(text) => handleChange(name, text)}
        placeholderTextColor="#aaa"
        autoCorrect={false}
        autoCapitalize="none"
        {...props}
      />
      {errors[name] && <Text style={formStyles.errorText}>{errors[name]}</Text>}
    </View>
  ), [formData, errors, handleChange]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{isEditing ? 'Editar Perfil' : 'Novo Cadastro'}</Text>

        <Text style={styles.sectionHeader}>👨‍⚕️ Profissional</Text>
        <ValidatedInput 
          label="Nome Completo" 
          name="nome" 
          placeholder="Ana Maria da Silva" 
        />
        
        <View style={formStyles.inputGroup}>
          <Text style={formStyles.label}>Especialidade</Text>
          <View style={[formStyles.pickerWrapper, errors.especialidade && formStyles.inputError]}>
            <Picker
              selectedValue={formData.especialidade}
              onValueChange={(itemValue) => handleChange('especialidade', itemValue)}
              style={formStyles.picker}
            >
              {especialidades.map(esp => (
                <Picker.Item key={esp} label={esp} value={esp} />
              ))}
            </Picker>
          </View>
          {errors.especialidade && <Text style={formStyles.errorText}>{errors.especialidade}</Text>}
        </View>

        <ValidatedInput 
          label="CRM" 
          name="crm" 
          placeholder="12345/MG" 
        />

        <Text style={styles.sectionHeader}>📱 Contatos</Text>
        <ValidatedInput 
          label="Email" 
          name="email" 
          placeholder="email@exemplo.com" 
          keyboardType="email-address"
        />
        <ValidatedInput 
          label="Telefone Celular" 
          name="telefone" 
          placeholder="(31) 99999-9999" 
          keyboardType="phone-pad"
        />

        <Text style={styles.sectionHeader}>🏢 Endereço Profissional</Text>
        <ValidatedInput 
          label="Logradouro" 
          name="logradouro" 
          placeholder="Rua das Flores" 
        />
        
        <View style={formStyles.row}>
          <View style={formStyles.col50}>
            <ValidatedInput 
              label="Número" 
              name="numero" 
              placeholder="Nº" 
              keyboardType="numeric"
            />
          </View>
          <View style={formStyles.col50}>
            <ValidatedInput 
              label="Complemento" 
              name="complemento" 
              placeholder="Apto/Sala"
            />
          </View>
        </View>

        <ValidatedInput 
          label="Cidade" 
          name="cidade" 
          placeholder="Belo Horizonte" 
        />

        <View style={formStyles.row}>
          <View style={formStyles.col30}>
            <ValidatedInput 
              label="UF" 
              name="uf" 
              placeholder="MG" 
              maxLength={2}
            />
          </View>
          <View style={formStyles.col70}>
            <ValidatedInput 
              label="CEP" 
              name="cep" 
              placeholder="30123-456" 
              keyboardType="numeric"
              maxLength={9}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            formStyles.button, 
            formStyles.saveButton, 
            salvando && formStyles.buttonDisabled
          ]}
          onPress={handleSubmit}
          disabled={salvando}
          activeOpacity={0.8}
        >
          <Text style={formStyles.buttonText}>
            {salvando ? '⏳ Salvando...' : '✓ ' + buttonTitle}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[formStyles.button, formStyles.cancelButton]}
          onPress={onCancel || (() => navigation.goBack())}
          disabled={salvando}
          activeOpacity={0.8}
        >
          <Text style={formStyles.buttonText}>✕ Cancelar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: '#007AFF',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
    color: '#333',
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
    paddingBottom: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    gap: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
});

const formStyles = StyleSheet.create({
  inputGroup: { 
    marginBottom: 14,
  },
  label: { 
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '600', 
    color: '#333',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fff',
    height: 48,
    color: '#333',
  },
  inputError: { 
    borderColor: '#e74c3c', 
    borderWidth: 2,
    backgroundColor: '#fadbd8',
  },
  errorText: { 
    fontSize: 11,
    color: '#c0392b',
    marginTop: 4,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  col50: {
    flex: 1,
  },
  col30: {
    flex: 0.3,
  },
  col70: {
    flex: 0.7,
  },
  pickerWrapper: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    height: 48,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    height: 48,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default MedicoForm;