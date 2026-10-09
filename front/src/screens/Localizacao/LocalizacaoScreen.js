import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  Linking,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { obterPermissaoEPosicao } from '../../services/localizacao';

const CLINICA = {
  latitude: -22.0175,
  longitude: -47.8909,
  endereco: 'Centro de São Carlos - SP (referência temporária fictícia)',
};

const calcularDistanciaMetros = (latitude, longitude) => {
  const radianos = (graus) => (graus * Math.PI) / 180;
  const diferencaLatitude = radianos(CLINICA.latitude - latitude);
  const diferencaLongitude = radianos(CLINICA.longitude - longitude);
  const a =
    Math.sin(diferencaLatitude / 2) ** 2 +
    Math.cos(radianos(latitude)) *
      Math.cos(radianos(CLINICA.latitude)) *
      Math.sin(diferencaLongitude / 2) ** 2;

  return 2 * 6371000 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatarDistancia = (metros) =>
  metros >= 1000
    ? `${(metros / 1000).toFixed(1).replace('.', ',')} km`
    : `${Math.round(metros)} m`;

const LocalizacaoScreen = () => {
  const [carregando, setCarregando] = useState(true);
  const [posicao, setPosicao] = useState(null);
  const [erro, setErro] = useState(null);
  const [podeAbrirAjustes, setPodeAbrirAjustes] = useState(false);

  const buscarPosicao = async () => {
    setCarregando(true);
    setErro(null);
    setPodeAbrirAjustes(false);

    try {
      const resultado = await obterPermissaoEPosicao();
      if (!resultado.concedida) {
        setErro('A permissão de localização foi negada. O endereço de referência permanece disponível.');
        setPodeAbrirAjustes(!resultado.podePerguntarNovamente);
        setPosicao(null);
        return;
      }
      setPosicao(resultado);
    } catch {
      setErro('Não foi possível obter a posição atual. Verifique se o serviço de localização está ativo.');
      setPosicao(null);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarPosicao();
  }, []);

  const distancia =
    posicao && calcularDistanciaMetros(posicao.latitude, posicao.longitude);
  const minutosCaminhando = distancia
    ? Math.max(1, Math.round((distancia / 1000 / 5) * 60))
    : null;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Localização da clínica</Text>
      <Text style={styles.endereco}>{CLINICA.endereco}</Text>

      {carregando && (
        <View style={styles.carregando}>
          <ActivityIndicator size="large" />
          <Text>Obtendo sua localização...</Text>
        </View>
      )}

      {erro && <Text style={styles.erro}>{erro}</Text>}

      {posicao && (
        <View style={styles.resultado}>
          <Text style={styles.distancia}>{formatarDistancia(distancia)}</Text>
          <Text>
            Distância em linha reta; o percurso real pode ser diferente.
          </Text>
          <Text>Tempo estimado a pé: cerca de {minutosCaminhando} min (5 km/h).</Text>
          <Text>
            {posicao.precisao == null
              ? 'Precisão não informada pelo aparelho.'
              : `Precisão indicada pelo aparelho: ±${Math.round(posicao.precisao)} m`}
          </Text>
        </View>
      )}

      {podeAbrirAjustes && (
        <Button title="Abrir ajustes do aparelho" onPress={() => Linking.openSettings()} />
      )}

      {!carregando && (
        <Button title="Tentar novamente" onPress={buscarPosicao} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    gap: 14,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
  },
  endereco: {
    fontSize: 16,
    color: '#444',
  },
  carregando: {
    alignItems: 'center',
    gap: 10,
    marginVertical: 24,
  },
  erro: {
    color: '#9b2c2c',
  },
  resultado: {
    gap: 10,
    padding: 16,
    backgroundColor: '#f2f7fa',
    borderRadius: 10,
  },
  distancia: {
    color: '#007AFF',
    fontSize: 30,
    fontWeight: '700',
  },
});

export default LocalizacaoScreen;
