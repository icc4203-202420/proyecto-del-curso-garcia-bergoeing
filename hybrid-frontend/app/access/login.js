import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import qs from 'qs';
import { useNavigation } from '@react-navigation/native';

const validationSchema = Yup.object({
  email: Yup.string().email('Email no válido').required('El email es requerido'),
  password: Yup.string().required('La contraseña es requerida').min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const initialValues = {
  email: '',
  password: '',
};

const LoginForm = ({ tokenHandler }) => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation(); // Hook para manejar la navegación
  const NGROK_URL = 'https://d70c-201-214-199-116.ngrok-free.app/api/v1/login' //Adjust when restarting server

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(`${NGROK_URL}/api/v1/login`, qs.stringify({ user: values }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
  
      const receivedToken = response.headers.authorization.split(' ')[1];
  
      if (receivedToken) {
        tokenHandler(receivedToken);
        Alert.alert('Login exitoso');
        navigation.navigate('Map');
      } else {
        Alert.alert('Error', 'No se recibió token. Por favor, intente de nuevo.');
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        Alert.alert('Error', 'Correo electrónico o contraseña incorrectos.');
      } else {
        Alert.alert('Error', 'Error en el servidor. Intenta nuevamente más tarde.');
      }
      console.error('Error en el envío del formulario:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        <View style={styles.container}>
          <Text style={styles.title}>Iniciar Sesión</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            onChangeText={handleChange('email')}
            onBlur={handleBlur('email')}
            value={values.email}
            keyboardType="email-address"
          />
          {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            onChangeText={handleChange('password')}
            onBlur={handleBlur('password')}
            value={values.password}
            secureTextEntry
          />
          {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <Button title="Iniciar Sesión" onPress={handleSubmit} />
          )}
          <Button title="Sign Up" onPress={() => navigation.navigate('SignUp')} />
        </View>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#213547',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    color: 'white',
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'white',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
    color: 'white',
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
});

export default LoginForm;
