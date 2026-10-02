import Constants from 'expo-constants';

// Troque pela porta usada no app.listen(...) do servidor/auth-api.js
const PORTA_API = 3001;

// URL de produção (quando existir uma API publicada)
// const PROD_URL = 'https://api.seudominio.com';

const getDevURL = () => {
  // hostUri vem no formato "192.168.0.10:8081"
  const hostUri = Constants.expoConfig?.hostUri;
  const ip = hostUri?.split(':')[0];
  return ip ? `http://${ip}:${PORTA_API}` : `http://localhost:${PORTA_API}`;
};

const BASE_URL = __DEV__ ? getDevURL() : PROD_URL;

export default BASE_URL;