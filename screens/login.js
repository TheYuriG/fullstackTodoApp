import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { KeyboardAvoidingView, TextInput, TouchableOpacity } from 'react-native';

const LoginScreen = () => {
	return (
		<KeyboardAvoidingView style={styles.container} behavior="padding">
			<View style={styles.inputContainer}>
				<TextInput
					placeholder="Email"
					//value={''} onChangedText={(text) => ''}
					style={styles.input}
				></TextInput>
				<TextInput
					placeholder="Password"
					//		value={''}
					//			onChangedText={(text) => ''}
					secureTextEntry
					style={styles.input}
				></TextInput>
			</View>
			<View>
				<View style={styles.buttonContainer}>
					<TouchableOpacity onPress={() => {}} style={styles.button}>
						<Text style={[styles.buttonText, styles.buttonOutline]}>Login</Text>
						<Text style={styles.buttonOutlineText}>Register</Text>
					</TouchableOpacity>
				</View>
			</View>
		</KeyboardAvoidingView>
	);
};

export default LoginScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
