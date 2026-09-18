// auth-api.js - API completa da clínica (com CRUD)
//
// Rode com: node auth-api.js
// Sobe em http://0.0.0.0:3001

const http = require('http');
const crypto = require('crypto');
const url = require('url');

const PORTA = 3001;

// Usuários
const USUARIOS = [
  { id: 1, email: 'recepcao@clinica.com', senha: 'clinica123', nome: 'Recepção', perfil: 'recepcao' },
  { id: 2, email: 'joao@clinica.com', senha: 'medico123', nome: 'Dr. João', perfil: 'medico' },
];

// Dados em memória (reinicia ao restarter o servidor)
let MEDICOS = [
  { id: 1, nome: 'João de Oliveira', especialidade: 'Cardiologista', crm: '12345/MG', email: 'joao@clinica.com', telefone: '31999999999', endereco: 'Rua A, 123' },
  { id: 2, nome: 'Antônio Silva', especialidade: 'Pediatra', crm: '23456/MG', email: 'antonio@clinica.com', telefone: '31988888888', endereco: 'Rua B, 456' },
];

let PACIENTES = [
  { id: 1, nome: 'João Santos', cpf: '12345678901', dataNascimento: '1990-01-15', telefone: '31997777777', email: 'joao.santos@email.com' },
  { id: 2, nome: 'Maria Oliveira', cpf: '98765432100', dataNascimento: '1985-05-20', telefone: '31996666666', email: 'maria.oliveira@email.com' },
];

// Tokens válidos
const SESSOES = new Map();

// Próximos IDs
let proximoIdMedico = 3;
let proximoIdPaciente = 3;

// ============================================================================
// UTILITÁRIOS
// ============================================================================

function json(res, status, corpo) {
  const texto = JSON.stringify(corpo);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  });
  res.end(texto);
}

function lerCorpo(req) {
  return new Promise((resolve) => {
    let dados = '';
    req.on('data', (pedaco) => { dados += pedaco; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(dados || '{}'));
      } catch (e) {
        resolve(null);
      }
    });
  });
}

function usuarioDoToken(req) {
  const cabecalho = req.headers['authorization'] || '';
  const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : null;
  if (!token) return null;
  const id = SESSOES.get(token);
  if (!id) return null;
  return USUARIOS.find((u) => u.id === id) || null;
}

// ============================================================================
// SERVIDOR
// ============================================================================

const servidor = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const metodo = req.method;

  console.log(`${metodo} ${pathname}`);

  // OPTIONS para CORS preflight
  if (metodo === 'OPTIONS') return json(res, 204, {});

  // ================================================================ LOGIN
  if (metodo === 'POST' && pathname === '/login') {
    const corpo = await lerCorpo(req);
    if (!corpo || !corpo.email || !corpo.senha) {
      return json(res, 400, { erro: 'Informe e-mail e senha.' });
    }
    const usuario = USUARIOS.find(
      (u) => u.email === corpo.email && u.senha === corpo.senha
    );
    if (!usuario) {
      return json(res, 401, { erro: 'E-mail ou senha inválidos.' });
    }
    const token = crypto.randomBytes(24).toString('hex');
    SESSOES.set(token, usuario.id);
    return json(res, 200, {
      token,
      usuario: { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil },
    });
  }

  // ================================================================ PERFIL
  if (metodo === 'GET' && pathname === '/perfil') {
    const usuario = usuarioDoToken(req);
    if (!usuario) {
      return json(res, 401, { erro: 'Token ausente ou inválido.' });
    }
    return json(res, 200, { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil });
  }

  // ================================================================ MÉDICOS
  // GET /medicos - lista todos
  if (metodo === 'GET' && pathname === '/medicos') {
    const usuario = usuarioDoToken(req);
    if (!usuario) {
      return json(res, 401, { erro: 'Token ausente ou inválido.' });
    }
    return json(res, 200, MEDICOS);
  }

  // POST /medicos - criar novo médico
  if (metodo === 'POST' && pathname === '/medicos') {
    const usuario = usuarioDoToken(req);
    if (!usuario) {
      return json(res, 401, { erro: 'Token ausente ou inválido.' });
    }
    const corpo = await lerCorpo(req);
    if (!corpo || !corpo.nome || !corpo.especialidade) {
      return json(res, 400, { erro: 'Nome e especialidade são obrigatórios.' });
    }
    const novoMedico = {
      id: proximoIdMedico++,
      ...corpo,
    };
    MEDICOS.push(novoMedico);
    return json(res, 201, novoMedico);
  }

  // PUT /medicos/:id - editar médico
  const matchMedicoEdit = pathname.match(/^\/medicos\/(\d+)$/);
  if (metodo === 'PUT' && matchMedicoEdit) {
    const usuario = usuarioDoToken(req);
    if (!usuario) {
      return json(res, 401, { erro: 'Token ausente ou inválido.' });
    }
    const id = parseInt(matchMedicoEdit[1]);
    const corpo = await lerCorpo(req);
    const indice = MEDICOS.findIndex((m) => m.id === id);
    if (indice === -1) {
      return json(res, 404, { erro: 'Médico não encontrado.' });
    }
    MEDICOS[indice] = { id, ...corpo };
    return json(res, 200, MEDICOS[indice]);
  }

  // DELETE /medicos/:id - deletar médico
  const matchMedicoDelete = pathname.match(/^\/medicos\/(\d+)$/);
  if (metodo === 'DELETE' && matchMedicoDelete) {
    const usuario = usuarioDoToken(req);
    if (!usuario) {
      return json(res, 401, { erro: 'Token ausente ou inválido.' });
    }
    const id = parseInt(matchMedicoDelete[1]);
    const indice = MEDICOS.findIndex((m) => m.id === id);
    if (indice === -1) {
      return json(res, 404, { erro: 'Médico não encontrado.' });
    }
    MEDICOS.splice(indice, 1);
    return json(res, 204, {});
  }

  // ================================================================ PACIENTES
  // GET /pacientes - lista todos
  if (metodo === 'GET' && pathname === '/pacientes') {
    const usuario = usuarioDoToken(req);
    if (!usuario) {
      return json(res, 401, { erro: 'Token ausente ou inválido.' });
    }
    return json(res, 200, PACIENTES);
  }

  // POST /pacientes - criar novo paciente
  if (metodo === 'POST' && pathname === '/pacientes') {
    const usuario = usuarioDoToken(req);
    if (!usuario) {
      return json(res, 401, { erro: 'Token ausente ou inválido.' });
    }
    const corpo = await lerCorpo(req);
    if (!corpo || !corpo.nome || !corpo.cpf) {
      return json(res, 400, { erro: 'Nome e CPF são obrigatórios.' });
    }
    const novoPaciente = {
      id: proximoIdPaciente++,
      ...corpo,
    };
    PACIENTES.push(novoPaciente);
    return json(res, 201, novoPaciente);
  }

  // PUT /pacientes/:id - editar paciente
  const matchPacienteEdit = pathname.match(/^\/pacientes\/(\d+)$/);
  if (metodo === 'PUT' && matchPacienteEdit) {
    const usuario = usuarioDoToken(req);
    if (!usuario) {
      return json(res, 401, { erro: 'Token ausente ou inválido.' });
    }
    const id = parseInt(matchPacienteEdit[1]);
    const corpo = await lerCorpo(req);
    const indice = PACIENTES.findIndex((p) => p.id === id);
    if (indice === -1) {
      return json(res, 404, { erro: 'Paciente não encontrado.' });
    }
    PACIENTES[indice] = { id, ...corpo };
    return json(res, 200, PACIENTES[indice]);
  }

  // DELETE /pacientes/:id - deletar paciente
  const matchPacienteDelete = pathname.match(/^\/pacientes\/(\d+)$/);
  if (metodo === 'DELETE' && matchPacienteDelete) {
    const usuario = usuarioDoToken(req);
    if (!usuario) {
      return json(res, 401, { erro: 'Token ausente ou inválido.' });
    }
    const id = parseInt(matchPacienteDelete[1]);
    const indice = PACIENTES.findIndex((p) => p.id === id);
    if (indice === -1) {
      return json(res, 404, { erro: 'Paciente não encontrado.' });
    }
    PACIENTES.splice(indice, 1);
    return json(res, 204, {});
  }

  // 404
  json(res, 404, { erro: 'Rota não encontrada.' });
});

servidor.listen(PORTA, '0.0.0.0', () => {
  console.log(`\n✅ API da clínica rodando em http://localhost:${PORTA}`);
  console.log('\n📚 Usuários de teste:');
  USUARIOS.forEach((u) => console.log(`   ${u.email} / ${u.senha}`));
  console.log('\n📋 Endpoints disponíveis:');
  console.log('   POST   /login');
  console.log('   GET    /perfil (protegido)');
  console.log('   GET    /medicos (protegido)');
  console.log('   POST   /medicos (protegido)');
  console.log('   PUT    /medicos/:id (protegido)');
  console.log('   DELETE /medicos/:id (protegido)');
  console.log('   GET    /pacientes (protegido)');
  console.log('   POST   /pacientes (protegido)');
  console.log('   PUT    /pacientes/:id (protegido)');
  console.log('   DELETE /pacientes/:id (protegido)\n');
});