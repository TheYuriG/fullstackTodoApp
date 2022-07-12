import { StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, TextInput, TouchableOpacity } from 'react-native';

const LoginScreen = () => {
	//? Handles email data
	const [email, setEmail] = useState('');
	//? Handles password data
	const [password, setPassword] = useState('');

	return (
		//? We use a "KeyboardAvoidingView" so the fields won't be obscured by the keyboard
		<KeyboardAvoidingView style={styles.container} behavior="padding">
			{/* //? Container that has both input fields */}
			<View style={styles.inputContainer}>
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
			</View>
			{/* //? Container for both Login/Register buttons */}
			<View style={styles.buttonContainer}>
				<TouchableOpacity onPress={() => {}} style={styles.button}>
					<Text style={styles.buttonText}>Login</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => {}} style={[styles.button, styles.buttonOutline]}>
					<Text style={styles.buttonOutlineText}>Register</Text>
				</TouchableOpacity>
			</View>
		</KeyboardAvoidingView>
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
