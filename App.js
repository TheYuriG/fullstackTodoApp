//? Dependencies
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState, useEffect } from 'react';
import LoginScreen from './screens/login';
import TodoScreen from './screens/todo';
import auth from '@react-native-firebase/auth';
import { View, Text } from 'react-native';
import { COLORS } from './colors/colors';

const Stack = createNativeStackNavigator();

export default function App() {
	//? Set an initializing state whilst Firebase connects
	const [initializing, setInitializing] = useState(true);
	const [user, setUser] = useState();

	//? Handle user state changes (login, logoff)
	function onAuthStateChanged(user) {
		setUser(user);
		if (initializing) setInitializing(false);
	}

	//? When the app starts, check for authentication once
	useEffect(() => {
		const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
		return subscriber; //? unsubscribe on unmount
	}, []);

	//? Starting splash screen when checking for authentication
	if (initializing)
		return (
			<View
				styles={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: COLORS.tertiary,
				}}
			>
				<Text>Loading</Text>
			</View>
		);

	//? Loads Login screen or Todos, depending if user is authenticated
	return (
		<NavigationContainer>
			<Stack.Navigator>
				{!user && (
					<Stack.Screen
						options={{ headerShown: false }}
						name="Login"
						component={LoginScreen}
					/>
				)}
				<Stack.Screen
					options={{
						headerShown: false,
					}}
					name="todo"
					component={TodoScreen}
					//? If the user is logged in (user is valid), pass their email as
					//? route.params.user to the todo page so their TODOs will fetch
					initialParams={{ user: user?.email }}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
}
