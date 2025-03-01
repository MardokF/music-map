import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './context/AuthContext'; // ? Importa il provider
import MainNavigator from './navigation/MainNavigator';

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
