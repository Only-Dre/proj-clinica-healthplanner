import * as Location from 'expo-location';

export const obterPermissaoEPosicao = async () => {
  const permissao = await Location.requestForegroundPermissionsAsync();
  if (permissao.status !== 'granted') {
    return {
      concedida: false,
      podePerguntarNovamente: permissao.canAskAgain,
    };
  }

  const posicao = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    concedida: true,
    latitude: posicao.coords.latitude,
    longitude: posicao.coords.longitude,
    precisao: posicao.coords.accuracy,
  };
};
