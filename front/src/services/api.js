import BASE_URL from '../config/BaseURL';
import { useStorage } from '../hooks/useStorage';

const { getItem, removeItem } = useStorage();

const criarErro = (status, mensagem) => {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
};

const request = async (rota, { method = 'GET', body, timeoutMs = 8000 } = {}) => {
  const token = await getItem('token');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resposta = await fetch(`${BASE_URL}${rota}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (resposta.status === 204) return null;

    let dados = null;
    try {
      dados = await resposta.json();
    } catch (e) {}

    if (!resposta.ok) {
      if (resposta.status === 401 && rota !== '/login') {
        await removeItem('token');
        throw criarErro(401, 'Sessão expirada. Faça login novamente.');
      }
      throw criarErro(
        resposta.status,
        dados?.erro || `Erro HTTP ${resposta.status}`,
      );
    }

    return dados;
  } catch (e) {
    if (e.name === 'AbortError') {
      throw criarErro(0, 'Tempo limite de 8s excedido. Tente novamente.');
    }
    if (e.status === undefined) {
      throw criarErro(0, 'Não foi possível conectar ao servidor.');
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }
};

export const login = (email, senha) =>
  request('/login', { method: 'POST', body: { email, senha } });

export const listarMedicos = () => request('/medicos');
export const salvarMedico = (medico) =>
  medico.id
    ? request(`/medicos/${medico.id}`, { method: 'PUT', body: medico })
    : request('/medicos', { method: 'POST', body: medico });
export const excluirMedico = (id) =>
  request(`/medicos/${id}`, { method: 'DELETE' });

export const listarPacientes = () => request('/pacientes');
export const salvarPaciente = (paciente) =>
  paciente.id
    ? request(`/pacientes/${paciente.id}`, { method: 'PUT', body: paciente })
    : request('/pacientes', { method: 'POST', body: paciente });
export const excluirPaciente = (id) =>
  request(`/pacientes/${id}`, { method: 'DELETE' });

export const sessaoExpirou = (e) => e?.status === 401;

export const irParaLogin = (navigation) =>
  navigation.reset({ index: 0, routes: [{ name: 'Login' }] });