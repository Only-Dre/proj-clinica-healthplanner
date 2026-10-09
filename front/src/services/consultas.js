import Constants from 'expo-constants';

const PORTA_MOCK = 3000;
const obterBaseUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0] || 'localhost';
  return `http://${host}:${PORTA_MOCK}`;
};

const requisitar = async (rota, opcoes = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  let resposta;
  try {
    resposta = await fetch(`${obterBaseUrl()}${rota}`, {
      ...opcoes,
      headers: {
        'Content-Type': 'application/json',
        ...opcoes.headers,
      },
      signal: controller.signal,
    });
  } catch (erro) {
    if (erro.name === 'AbortError') {
      throw new Error('A conexão com o mock de consultas excedeu o tempo limite.');
    }
    throw new Error('Não foi possível conectar ao mock server na porta 3000.');
  } finally {
    clearTimeout(timeout);
  }

  if (!resposta.ok) {
    throw new Error(`Erro HTTP ${resposta.status} ao acessar o mock de consultas.`);
  }
  if (resposta.status === 204) return null;

  try {
    return await resposta.json();
  } catch {
    throw new Error('O mock de consultas retornou uma resposta inválida.');
  }
};

export const listarConsultasMock = () =>
  requisitar('/consultas?_sort=data&_order=asc');

export const salvarConsultaMock = (consulta) =>
  consulta.id
    ? requisitar(`/consultas/${consulta.id}`, {
        method: 'PUT',
        body: JSON.stringify(consulta),
      })
    : requisitar('/consultas', {
        method: 'POST',
        body: JSON.stringify(consulta),
      });

export const excluirConsultaMock = (id) =>
  requisitar(`/consultas/${id}`, { method: 'DELETE' });
