import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import SettingsMenu from '../components/buttons/SettingsMenu'
import { useTheme } from '../contexts/theme'
import HistoryMenu from '../modules/history/ui/components/HistoryMenu'
import Home from '../screens/Home'
import SenderScreen from '../screens/SenderScreen'
import ReceiverScreen from '../screens/ReceiverScreen'
import BluetoothHome from '../screens/BluetoothHome'
import { HomeStackParams, Screens } from '../types/navigators'

import { useDefaultStackOptions } from './defaultStackOptions'
import { TOKENS, useServices } from '../container-api'

const HomeStack: React.FC = () => {
  const Stack = createStackNavigator<HomeStackParams>()
  const theme = useTheme()
  const { t } = useTranslation()
  const defaultStackOptions = useDefaultStackOptions(theme)
  const [ScreenOptionsDictionary, historyEnabled] = useServices([TOKENS.OBJECT_SCREEN_CONFIG, TOKENS.HISTORY_ENABLED])

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.Home}
        component={Home}
        options={() => ({
          title: t('Screens.Home'),
          headerRight: () => (historyEnabled ? <HistoryMenu /> : null),
          headerLeft: () => <SettingsMenu />,
          ...ScreenOptionsDictionary[Screens.Home],
        })}
      />
      <Stack.Screen
        name={Screens.SendScreen}
        component={SenderScreen}
        options={{ title: t('Screens.Send') }}
      />
      <Stack.Screen
        name={Screens.ReceiveScreen}
        component={ReceiverScreen}
        options={{ title: t('Screens.Receive') }}
      />
      <Stack.Screen
        name={Screens.BluetoothHome}
        component={BluetoothHome}
        options={{ title: 'Bluetooth' }}
      />
    </Stack.Navigator>
  )
}

export default HomeStack
