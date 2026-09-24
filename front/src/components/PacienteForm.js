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
  SafeAreaView,
} from 'react-native';

const initialPacienteState = {
  nome: '',
  cpf: '',
  dataNascimento: '',
  telefone: '',
  email: '',
};

const PacienteForm = ({ paciente, onSave, onCancel, navigation }) => {
  // Inicializa uma vez apenas
  const [formData, setFormData] = useState(() => paciente ? { ...paciente } : initialPacienteState);
  const [errors, setErrors] = useState({});
  const [salvando, setSalvando] = useState(false);

  const isEditing = useMemo(() => !!paciente, [paciente?.id]);
  const buttonTitle = isEditing ? 'Concluir Edição' : 'Concluir Cadastro';

  const requiredFields = ['nome', 'cpf', 'dataNascimento', 'telefone', 'email'];

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
        <Text style={styles.title}>
          {isEditing ? 'Editar Paciente' : 'Novo Paciente'}
        </Text>

        <Text style={styles.sectionHeader}>👤 Informações Pessoais</Text>

        <ValidatedInput 
          label="Nome Completo" 
          name="nome" 
          placeholder="Lucas Pereira Silva"
        />

        <ValidatedInput 
          label="CPF" 
          name="cpf" 
          placeholder="000.000.000-00" 
          keyboardType="numeric"
        />

        <ValidatedInput
          label="Data de Nascimento"
          name="dataNascimento"
          placeholder="AAAA-MM-DD"
          keyboardType="numeric"
        />

        <Text style={styles.sectionHeader}>📞 Contatos</Text>

        <ValidatedInput
          label="Telefone Celular"
          name="telefone"
          placeholder="(31) 99999-9999"
          keyboardType="phone-pad"
        />

        <ValidatedInput
          label="Email"
          name="email"
          placeholder="email@exemplo.com"
          keyboardType="email-address"
        />
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            formStyles.button,
            formStyles.saveButton,
            salvando && formStyles.buttonDisabled,
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

export default PacienteForm;