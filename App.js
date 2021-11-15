//Importing modules and components
import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './Components/navigation/TabNavigator';

export default function App() {
  const Stack = createNativeStackNavigator();

  // Stacknavigator, that uses the TabNavigator component to navigate between screens in the bottom.
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          options={{ headerShown: false }}
          name='HomeScreen'
          component={TabNavigator}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
