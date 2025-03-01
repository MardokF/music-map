import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const LoginScreen = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://192.168.1.53:5000/api/users/login', { email, password });
      login(response.data.user); // Salva l'utente nel contesto
    } catch (error) {
      Alert.alert('Errore', 'Credenziali non valide');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Login</Text>
      <TextInput
        style={{ borderWidth: 1, width: 250, marginBottom: 10, padding: 5 }}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={{ borderWidth: 1, width: 250, marginBottom: 10, padding: 5 }}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Accedi" onPress={handleLogin} />
    </View>
  );
};

export default LoginScreen;

