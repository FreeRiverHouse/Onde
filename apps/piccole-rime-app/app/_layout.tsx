import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFF8E7',
          },
          headerTintColor: '#2C3E50',
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: '#FFF8E7',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Piccole Rime',
            headerLargeTitle: true,
          }}
        />
        <Stack.Screen
          name="poem/[id]"
          options={{
            title: '',
            headerBackTitle: 'Indietro',
          }}
        />
      </Stack>
    </>
  );
}
