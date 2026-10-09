# HealthPlanner — Sistema de Agendamento para Clínica Médica

> Projeto integrador da Unidade Curricular **Aplicações Mobile**, construído ao longo de 16 aulas.

**Squad:** André Luiz Rodrigues Fernandes, Edson Henrique Abreu de Souza, Gustavo dos Santos Oliveira
**Curso:** Superior de Tecnologia em Análise e Desenvolvimento de Sistemas — Turma STADS
**Professor:** Prof. Dr. Maurício Falvo

---

## Sobre o desafio

Este projeto é a resposta à Situação de Aprendizagem Desafiadora da unidade curricular:
criar a aplicação mobile de um sistema de agendamento de consultas para uma clínica
médica, atendendo pacientes e médicos com um aplicativo que vai além do CRUD básico.

O aplicativo está em desenvolvimento e usa o servidor local de autenticação/CRUD já
disponível para médicos e pacientes, além de `json-server` para consultas agendadas.
As conexões de desenvolvimento usam HTTP; uma API de produção com HTTPS ainda não está
configurada. O cadastro de endereço consulta o ViaCEP por HTTPS.

- **Recursos nativos implementados:** câmera para foto de médico, autenticação biométrica
  local e localização em primeiro plano para estimar distância até a clínica.
- **Notificações:** lembrete local de consultas agendadas; push ainda não implementado.
- **Recursos ainda pendentes:** Bluetooth, mapas, SMS e processamento em segundo plano.

## Funcionalidades

Checklist dos entregáveis previstos na Situação de Aprendizagem Desafiadora do Plano de
Ensino. Marque conforme cada item for implementado pela squad — cada aula do curso avança
alguns destes itens.

- [ ] Protótipo wireframe das interfaces da aplicação (Figma)
- [x] Projeto do aplicativo configurado e versionado no Git
- [x] Cadastro opcional de foto de perfil do médico via câmera do dispositivo
- [x] Login biométrico local para desbloquear uma sessão/token já salvo
- [x] Geolocalização em primeiro plano e estimativa de distância/tempo até a clínica
- [ ] Importação de sinais vitais de um periférico via Bluetooth antes da consulta
- [x] Listagem de pacientes e médicos usando os endpoints existentes
- [x] Cadastro, edição e exclusão de pacientes e médicos usando os endpoints existentes
- [ ] Listagem e operações para especialidades e horários
- [ ] Integração com login via HTTPS (o servidor local atual usa HTTP)
- [x] Integração com ViaCEP para preencher endereço pelo CEP no cadastro de médico
- [x] Notificação local como lembrete de consulta agendada
- [ ] Push notifications
- [ ] Processamento multithread para tarefas pesadas não travarem a interface
- [ ] Sincronização da agenda em segundo plano (tarefa/serviço background)
- [ ] Mapa exibindo a localização da clínica dentro do aplicativo
- [ ] Confirmação/cancelamento de consulta enviado por SMS
- [x] Agendamento e edição de consultas no `json-server` local
- [x] Listagem das consultas agendadas
- [x] Cancelamento de consulta e de seu lembrete local
- [ ] Funcionalidade de visualização de agenda para o médico
- [ ] Aplicação com testes end-to-end rodando com sucesso
- [ ] Documentação completa do sistema — guia do usuário e técnica
- [ ] Build de produção gerado e documentação dos passos de publicação nas lojas (App
      Store/Google Play)
- [ ] Versão final do aplicativo pronta para apresentação 

## Telas principais

<!-- Documentem cada tela conforme forem construindo, descrevendo função e navegação. -->

| Tela | Funcionalidade | Navega para |
|---|---|---|
| Login | Login por e-mail/senha ou desbloqueio biométrico de sessão salva | Menu |
| Menu | Acesso às áreas principais e à distância até a clínica | Médicos, Pacientes, Consultas, Localização |
| Médicos (listagem) | Pesquisa, consulta, edição e exclusão | Cadastro/Edição de Médico |
| Cadastro/Edição de Médico | Formulário com foto opcional e preenchimento de endereço pelo CEP | Médicos |
| Pacientes (listagem) | Pesquisa, consulta e exclusão | Cadastro/Edição de Paciente |
| Cadastro/Edição de Paciente | Cadastro e edição de pacientes | Pacientes |
| Consultas (listagem) | Lista, edição e cancelamento de consultas do mock | Cadastro/Edição de Consulta |
| Cadastro/Edição de Consulta | Agendamento com lembrete local | Consultas |
| Localização | Distância em linha reta e tempo estimado até a referência da clínica | — |

## Tecnologias

- [React Native](https://reactnative.dev/) com [Expo](https://expo.dev/)
- React Navigation (`@react-navigation/native`, `@react-navigation/stack`)
- `expo-image-picker`, `expo-local-authentication`, `expo-location` e `expo-notifications`
- `@react-native-async-storage/async-storage` para sessão local
- API local existente para autenticação e dados de médicos/pacientes
- `json-server` e `db_clinica.json` para consultas agendadas
- ViaCEP para consulta de endereço por CEP

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão LTS recomendada)
- npm
- [Expo Go](https://expo.dev/go) instalado no celular físico, **ou** um emulador
  Android/iOS configurado
- Git

## Instalação e configuração

Na pasta `front` do repositório:

```bash
npm install
```

### Variáveis de configuração

O endereço do servidor de autenticação e CRUD é definido em `src/config/BaseURL.js`
(porta 3001). O mock de consultas usa a porta 3000 e deriva o endereço IP do host Expo.
Em dispositivo físico, computador e celular precisam estar na mesma rede Wi-Fi.

### Iniciando os servidores locais

```bash
node servidor/auth-api.js
```

Em outro terminal, inicie o mock de consultas:

```bash
npm run mock-api
```

O mock de consultas escuta em `0.0.0.0:3000` para que o aparelho físico na mesma rede
possa acessá-lo. Ele usa a coleção `consultas` de `db_clinica.json`. Médicos e pacientes
continuam sendo lidos e gravados pelo servidor local existente na porta 3001.

## Como executar

```bash
npx expo start
```

Escaneie o QR Code com o app Expo Go, ou pressione `a`/`i` no terminal para abrir em um
emulador Android/iOS.

## Permissões do dispositivo

| Recurso | Quando é solicitado | Comportamento se negado |
|---|---|---|
| Câmera | Ao tocar em adicionar/alterar foto no formulário de médico | Explica a recusa; a foto é opcional e o cadastro continua disponível |
| Biometria | Ao tocar em entrar com biometria; só é oferecida se existir token salvo e o aparelho tiver sensor/cadastro biométrico | Permanece disponível o login por e-mail e senha |
| Localização (GPS) | Ao abrir Localização; somente em primeiro plano | Mantém a referência da clínica na tela; se a permissão não puder ser solicitada novamente, oferece os ajustes |
| Bluetooth | Ainda não implementado | Não solicitada |
| Notificações | Ao agendar uma consulta | Informa que a consulta foi salva sem lembrete se a permissão for negada |

As coordenadas atuais da clínica são fictícias e apontam para o centro de São Carlos - SP.
Atualize `CLINICA` em `src/screens/Localizacao/LocalizacaoScreen.js` quando tiver a
localização real. A distância exibida é em linha reta; o tempo é uma estimativa a pé.

## Testes

Não há suíte automatizada configurada no momento.

## Build de produção e publicação

Build de produção e publicação nas lojas ainda não estão configurados. A URL de produção
da API também precisa ser definida; atualmente o servidor de autenticação é local e usa
HTTP.

## Equipe e colaboração

Consulte o combinado de colaboração da squad definido na Aula 1 (branches, padrão de
commit, revisão em pares) para saber como contribuir com este repositório.

## Licença

Ainda não definida pela squad.