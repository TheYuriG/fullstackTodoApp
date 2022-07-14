import { Alert, StyleSheet, Text, View } from 'react-native';
import React, { useState, setInput } from 'react';
import { KeyboardAvoidingView, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
	//? Handles email data
	const [email, setEmail] = useState('');
	//? Handles password data
	const [password, setPassword] = useState('');
	//? Handles password confirmation data
	const [passwordConfirmation, setPasswordConfirmation] = useState('');
	//? Handles if the user is trying to register
	const [isRegistering, setIsRegistering] = useState(false);

	const [input, setInput] = useState({ 'admin@domain.com': 'adminpassword' });

	const readData = async () => {
		try {
			const value = await AsyncStorage.getItem('logins');
			if (value !== null) {
				setInput(JSON.parse(value));
			}
			console.log(input);
		} catch (e) {
			alert('Failed to fetch the login data from storage');
		}
	};

	const login = (email, password) => {
		readData();
		if (input?.[email] == password) {
			console.log('login successful');
		} else {
			Alert.alert('Failed to login', 'Invalid credentials');
			setPassword('');
		}
	};

	const register = async (email, password, passwordConfirmation) => {
		readData();
		if (password !== passwordConfirmation) {
			Alert.alert('Failed to register', 'Passwords do not match!');
			setPassword('');
			setPasswordConfirmation('');
			return;
		} else if (input[email] != undefined) {
			Alert.alert('Failed to register', 'This email was already used!');
			setEmail('');
			setPassword('');
			setPasswordConfirmation('');
			return;
		}
		input[email] = password;
		setInput(input);
		try {
			await AsyncStorage.setItem('logins', JSON.stringify(input));
		} catch (e) {
			return alert('Failed to save the data to the storage');
		}
		console.log('Registration successful!');
	};
	return (
		//? We use a "KeyboardAvoidingView" so the fields won't be obscured by the keyboard
		<View style={styles.container} behavior="padding">
			{/* //? Container that has both input fields */}
			<KeyboardAvoidingView style={styles.inputContainer}>
				{/* //? Email field */}
				<TextInput
					placeholder="Email"
					value={email}
					onChangeText={(text) => setEmail(text)}
					style={styles.input}
				></TextInput>
				{/* //? Password field */}
				<TextInput
					placeholder="Password"
					value={password}
					onChangeText={(text) => setPassword(text)}
					style={styles.input}
					secureTextEntry
				></TextInput>
				{/* //? Password confirmation field */}
				{isRegistering == true && (
					<TextInput
						placeholder="Confirm password"
						value={passwordConfirmation}
						onChangeText={(text) => setPasswordConfirmation(text)}
						style={styles.input}
						secureTextEntry
					></TextInput>
				)}
			</KeyboardAvoidingView>
			{/* //? Container for both Login/Register buttons */}
			{isRegistering == false && (
				<View style={styles.buttonContainer}>
					<TouchableOpacity
						onPress={() => {
							login(email, password);
						}}
						style={styles.button}
					>
						<Text style={styles.buttonText}>Login</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => {
							setIsRegistering(true);
						}}
						style={[styles.button, styles.buttonOutline]}
					>
						<Text style={styles.buttonOutlineText}>Register</Text>
					</TouchableOpacity>
				</View>
			)}
			{isRegistering == true && (
				<KeyboardAvoidingView style={styles.buttonContainer}>
					<TouchableOpacity
						onPress={() => {
							register(email, password, passwordConfirmation);
						}}
						style={styles.button}
					>
						<Text style={styles.buttonText}>Register</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => {
							setIsRegistering(false);
						}}
						style={[styles.button, styles.buttonOutline]}
					>
						<Text style={styles.buttonOutlineText}>Go back</Text>
					</TouchableOpacity>
				</KeyboardAvoidingView>
			)}
		</View>
	);
};

export default LoginScreen;

const styles = StyleSheet.create({
	//? The view that will use the whole screen
	container: {
		flex: 1, //? Flex 1 for maximum stretch
		justifyContent: 'center', //? Center everything vertically
		alignItems: 'center', //? Center everything horizontally
		backgroundColor: '#44dddd', //? Paint the background light blue
	},
	inputContainer: { width: '80%' }, //? Make the input containers take 80% of the horizontal screen space
	input: {
		backgroundColor: 'white', //? Give the input containers a white background
		paddingHorizontal: 15, //? Space horizontally the input text from the edges of the containers
		paddingVertical: 10, //? Space vertically the input text from the edges of the containers
		borderRadius: 10, //? Round the edges of the input containers
		marginTop: 10, //? Space each container away from each other
	},
	buttonContainer: {
		width: '60%', //? Make the button containers take 60% of the horizontal screen space
		justifyContent: 'center', //? Center both buttons vertically
		alignItems: 'center', //? Center both buttons horizontally
		marginTop: 15, //? Space each button away from each other
	},
	button: {
		backgroundColor: '#0782F9', //? Paint the button blue
		alignItems: 'center', //? Center the button on the middle of the buttonContainer
		width: '100%', //? Make the button take the entire horizontal space on the buttonContainer
		padding: 15, //? Space the inner button text from the edges
		borderRadius: 10, //? Round the edges of the buttons
	},
	buttonOutline: {
		backgroundColor: 'white', //? Paint white the Register button
		marginTop: 5, //? Distance the Register button from the Login button
		borderColor: '#0782F9', //? Give the Register button some border color
		borderWidth: 2, //? Give the Register button some border width
	},
	buttonText: { color: 'white', fontWeight: '700', fontSize: 16 }, //? Login button's text
	buttonOutlineText: { color: '#0782F9', fontWeight: '700', fontSize: 16 }, //? Register button's text
});
