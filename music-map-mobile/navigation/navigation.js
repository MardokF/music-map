import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();

const Navigation = () => {
  return (
      <Stack.Navigator>
        <Stack.Screen name="MapScreen" component={MapScreen} options={{ title: 'Mappa' }} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ title: 'Profilo' }} />
      </Stack.Navigator>
  );
};

export default Navigation;
