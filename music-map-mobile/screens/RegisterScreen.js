import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/AuthStyles';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Errore', 'Compila tutti i campi');
      return;
    }

    try {
      const response = await fetch('https://music-map.onrender.com/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Successo', 'Registrazione completata!');
        navigation.navigate('LoginScreen');
      } else {
        Alert.alert('Errore', data.error || 'Registrazione fallita');
      }
    } catch (error) {
      Alert.alert('Errore', 'Impossibile connettersi al server');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrati</Text>
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrati</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
        <Text style={styles.linkText}>Hai già un account? Accedi</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;
