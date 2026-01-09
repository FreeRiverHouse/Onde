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
          headerTintColor: '#FF6B35',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#FFF8E7',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'KidsChefStudio',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="recipe/[id]"
          options={{
            title: 'Ricetta',
          }}
        />
        <Stack.Screen
          name="play/[id]"
          options={{
            title: 'Cuciniamo!',
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
