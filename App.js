//? Dependencies
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/login';
import TodoScreen from './screens/todo';

const Stack = createNativeStackNavigator();

export default function App() {
	//? Loads Login screen or Todos, depending if user is authenticated
	return (
		<NavigationContainer>
			<Stack.Navigator>
				<Stack.Screen
					options={{ headerShown: false }}
					name="Login"
					component={LoginScreen}
				/>
				<Stack.Screen
					options={{
						headerShown: false,
					}}
					name="todo"
					component={TodoScreen}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
}
