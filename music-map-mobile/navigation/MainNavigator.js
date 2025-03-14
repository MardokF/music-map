import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import AuthContext from '../context/AuthContext'; // ? Percorso corretto
import Navigation from './navigation';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createStackNavigator();

/*const MainNavigator = () => {
  const { user } = useContext(AuthContext); // ? Ottiene il valore dal contesto

  return (
    <Stack.Navigator>
      {user ? (
        <Stack.Screen name="App" component={Navigation} options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
      )}
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};*/

const MainNavigator = () => {

    const { user } = useContext(AuthContext);
    return (
      <Stack.Navigator initialRouteName="LoginScreen">
       {user ? (
        <Stack.Screen name="App" component={Navigation} options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
      )}
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
  );
};

export default MainNavigator;
