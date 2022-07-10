//? Dependencies
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import ICON from 'react-native-vector-icons/MaterialIcons';

//? Colors theme
const COLORS = { primary: '#1f145c', white: '#fff' };

export default function App() {
	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
			<View style={styles.header}>
				<Text style={styles.headerText}>To-Do List</Text>
				<ICON name="delete" size={25} color="red" />
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	header: {
		padding: 20,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	headerText: {
		fontWeight: 'bold',
		fontSize: 20,
		color: COLORS.primary,
	},
});
