import { Platform } from 'react-native';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const dataHoraConsulta = (consulta) => {
  const [ano, mes, dia] = consulta.data.split('-').map(Number);
  const [hora, minuto] = consulta.hora.split(':').map(Number);
  return new Date(ano, mes - 1, dia, hora, minuto);
};

export const agendarLembreteConsulta = async (consulta, nomeMedico) => {
  if (Platform.OS === 'web') {
    throw new Error('Notificações locais estão disponíveis somente no aplicativo mobile.');
  }

  if (Platform.OS === 'android') {
    await setNotificationChannelAsync('consultas', {
      name: 'Lembretes de consultas',
      importance: AndroidImportance.DEFAULT,
    });
  }

  let permissao = await getPermissionsAsync();
  if (!permissao.granted) {
    permissao = await requestPermissionsAsync();
  }
  if (!permissao.granted) {
    throw new Error('Permissão de notificações não concedida.');
  }

  const consultaEm = dataHoraConsulta(consulta);
  const umaHoraAntes = new Date(consultaEm.getTime() - 60 * 60 * 1000);
  const lembreteEm = umaHoraAntes > new Date() ? umaHoraAntes : consultaEm;

  return scheduleNotificationAsync({
    content: {
      title: 'Lembrete de consulta',
      body: `Sua consulta com ${nomeMedico} está marcada para ${consulta.data} às ${consulta.hora}.`,
      data: { consultaId: consulta.id },
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date: lembreteEm,
      channelId: 'consultas',
    },
  });
};

export const cancelarLembreteConsulta = (identificador) =>
  identificador
    ? cancelScheduledNotificationAsync(identificador)
    : Promise.resolve();
