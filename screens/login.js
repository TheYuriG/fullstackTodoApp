import {
	Alert,
	StyleSheet,
	Text,
	View,
	KeyboardAvoidingView,
	TextInput,
	TouchableOpacity,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { COLORS } from '../colors/colors.js';
import auth from '@react-native-firebase/auth';

const LoginScreen = ({ navigation }) => {
	//? Handles email data
	const [email, setEmail] = useState('');
	//? Handles password data
	const [password, setPassword] = useState('');
	//? Handles password confirmation data
	const [passwordConfirmation, setPasswordConfirmation] = useState('');
	//? Handles if the user is trying to register
	const [isRegistering, setIsRegistering] = useState(false);

	//? Handle user state changes (login, logoff)
	function onAuthStateChanged(user) {
		if (user) {
			//? If the user is logged in (user is valid), pass their email as
			//? route.params.user to the todo page so their TODOs will fetch
			navigation.navigate('todo', { user: user?.email });
		}
	}

	//? When the app starts, check for authentication once
	useEffect(() => {
		const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
		return subscriber; //? unsubscribe on unmount
	}, []);

	//? Compares the email/password input from user to database entries
	//? cached in "input"
	const login = (email, password) => {
		//? Check if the email and password provide a good match in the database
		auth()
			.signInWithEmailAndPassword(email, password)
			.then(() => {
				//? If successful, navigate to the next screen while providing
				//? the email as navigation parameters
			})
			.catch((error) => {
				//? If the email isn't present or the password doesn't match,
				//? inform the user of login failure
				Alert.alert('Failed to login', 'Invalid credentials');
				setPassword('');
				console.error(error);
			});
	};

	//? Creates a new login entry on local storage
	const register = async (email, password, passwordConfirmation) => {
		//? Checks if the password and password confirmation match
		if (password !== passwordConfirmation) {
			Alert.alert('Failed to register', 'Passwords do not match!');
			setPassword('');
			setPasswordConfirmation('');
			return;
		}
		auth()
			.createUserWithEmailAndPassword(email, password)
			.then(() => {
				//? If the passwords match and the authentication didn't return
				//? a Promise.reject(), the user will be logged in and "onAuthStateChanged()"
				//? will fire and navigate to the next screen
			})
			.catch((error) => {
				if (error.code === 'auth/email-already-in-use') {
					Alert.alert('Failed to register', 'This email was already used!');
					setEmail('');
					setPassword('');
					setPasswordConfirmation('');
				} else if (error.code === 'auth/invalid-email') {
					Alert.alert('Failed to register', 'This email is invalid!');
					setEmail('');
					setPassword('');
					setPasswordConfirmation('');
				} else if (error.code === 'auth/weak-password') {
					Alert.alert('Failed to register', "Password isn't long enough!");
				} else {
					console.error(error);
				}
			});
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
		backgroundColor: COLORS.tertiary, //? Paint the background light blue
	},
	inputContainer: { width: '80%' }, //? Make the input containers take 80% of the horizontal screen space
	input: {
		backgroundColor: COLORS.white, //? Give the input containers a white background
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
		backgroundColor: COLORS.secondary, //? Paint the button blue
		alignItems: 'center', //? Center the button on the middle of the buttonContainer
		width: '100%', //? Make the button take the entire horizontal space on the buttonContainer
		padding: 15, //? Space the inner button text from the edges
		borderRadius: 10, //? Round the edges of the buttons
	},
	buttonOutline: {
		backgroundColor: COLORS.white, //? Paint white the Register button
		marginTop: 5, //? Distance the Register button from the Login button
		borderColor: COLORS.secondary, //? Give the Register button some border color
		borderWidth: 3, //? Give the Register button some border width
	},
	buttonText: { color: COLORS.white, fontWeight: '700', fontSize: 16 }, //? Login button's text
	buttonOutlineText: { color: COLORS.secondary, fontWeight: '700', fontSize: 16 }, //? Register button's text
});
