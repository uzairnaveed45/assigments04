import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TextInput, Button, Text, View, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import firebase from 'firebase/app';
import 'firebase/firestore';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'YOUR_FIREBASE_AUTH_DOMAIN',
  projectId: 'YOUR_FIREBASE_PROJECT_ID',
  storageBucket: 'YOUR_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

// Redux setup
const initialState = {
  username: '',
  password: '',
  email: '',
  phone: '',
};
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER_DATA':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};
const store = createStore(reducer);

// Signup Screen
const SignupScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { username, password, email, phone } = useSelector((state) => state);

  const validateForm = () => {
    if (username.match(/[^a-zA-Z]/)) {
      alert('Username should contain alphabets only');
      return false;
    }
    if (password.length < 6) {
      alert('Password should be at least 6 characters long');
      return false;
    }
    if (!email.includes('@')) {
      alert('Please enter a valid email');
      return false;
    }
    if (!phone.match(/^\+92-3\d{2}-\d{7}$/)) {
      alert('Phone number should match +92-3xx-xxxxxxx');
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (validateForm()) {
      // Store data in Firebase
      try {
        await firebase.firestore().collection('users').add({
          username,
          email,
          phone,
        });
        alert('User signed up successfully!');
        navigation.navigate('Login');
      } catch (error) {
        alert('Error storing user data:', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={(text) => dispatch({ type: 'SET_USER_DATA', payload: { username: text } })}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => dispatch({ type: 'SET_USER_DATA', payload: { password: text } })}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => dispatch({ type: 'SET_USER_DATA', payload: { email: text } })}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number (+92-3xx-xxxxxxx)"
        value={phone}
        onChangeText={(text) => dispatch({ type: 'SET_USER_DATA', payload: { phone: text } })}
      />
      <Button title="Signup" onPress={handleSignup} />
    </View>
  );
};

// Login Screen
const LoginScreen = ({ navigation }) => {
  const { username } = useSelector((state) => state);

  const handleLogin = () => {
    if (username) {
      // Fetch user location
      Geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          await AsyncStorage.setItem('userLocation', JSON.stringify(location));
          navigation.navigate('Profile');
        },
        (error) => alert('Error fetching location:', error.message),
      );
    } else {
      alert('Please enter a valid username');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

// Profile Screen
const ProfileScreen = () => {
  const [location, setLocation] = React.useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      const storedLocation = await AsyncStorage.getItem('userLocation');
      setLocation(JSON.parse(storedLocation));
    };
    fetchLocation();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Welcome to your Profile!</Text>
      {location && (
        <Text>
          Your Location: Latitude {location.latitude}, Longitude {location.longitude}
        </Text>
      )}
    </View>
  );
};

// Navigation setup
const Stack = createStackNavigator();

const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Signup">
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

// Styles for the screens
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
});

export default App;
