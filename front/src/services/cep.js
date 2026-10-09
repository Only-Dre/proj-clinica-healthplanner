export const buscarEnderecoPorCep = async (cep) => {
  const cepLimpo = cep.replace(/\D/g, '');
  if (cepLimpo.length !== 8) {
    throw new Error('Informe um CEP válido com 8 números.');
  }

  let resposta;
  try {
    resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
  } catch (erro) {
    throw new Error('Não foi possível consultar o CEP. Verifique sua conexão.');
  }

  if (!resposta.ok) {
    throw new Error('O serviço de CEP está indisponível no momento.');
  }

  let endereco;
  try {
    endereco = await resposta.json();
  } catch {
    throw new Error('O serviço de CEP retornou uma resposta inválida.');
  }
  if (endereco.erro) {
    throw new Error('CEP não encontrado.');
  }

  return endereco;
};
