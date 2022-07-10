//? Dependencies
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ICON from 'react-native-vector-icons/MaterialIcons';

//? Colors theme
const COLORS = { primary: '#1f145c', white: '#fff' };

export default function App() {
	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
			{/* //? Section for the header, that has the bold title for our application */}
			<View style={styles.header}>
				<Text style={styles.headerText}>To-Do List</Text>
				<ICON name="delete" size={25} color="red" />
			</View>
			{/* //? Section for the footer where we can add new items to the list*/}
			<View style={styles.footer}>
				<View style={styles.inputContainer}>
					<TextInput placeholder="Add new todo..."></TextInput>
				</View>
				<TouchableOpacity>
					<View style={styles.iconContainer}>
						<ICON name="add" color={COLORS.white} size={30} />
					</View>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	header: {
		margin: 10,
		padding: 20, //? Internal spacing to children to avoid hitting edges of device
		flexDirection: 'row', //? How the items should be align (Row = horizontal)
		alignItems: 'center', //? Align items vertically on the axis
		justifyContent: 'space-between', //? Put space between the items, but not around them
	},
	headerText: {
		fontSize: 20, //? Big
		fontWeight: 'bold', //? Strong
		color: COLORS.primary, //? Eyes flaming gold
	},
	footer: {
		position: 'absolute', //? Sets the position of this view
		bottom: 0, //? Straight at the bottom
		color: COLORS.white, //? Color white not really relevant currently as the background is already white
		width: '100%', //? Makes the footer take the entire horizontal space, side to side
		flexDirection: 'row', //? Display items horizontally within the footer
		alignItems: 'center', //? Align items vertically within the footer
		paddingHorizontal: 2, //? Horizontally space out internal items by 2 to the edges
	},
	inputContainer: {
		backgroundColor: COLORS.white, //? The input text box also has a white background
		elevation: 40, //? Gives the impression of depth to this input text box
		flex: 1,
		height: 50, //? Determines how much height this will have
		marginVertical: 10, //? Margin on vertical axis
		marginHorizontal: 10, //? Margin to the right, giving space to the "adding" todo button
		borderRadius: 30, //? Rounds the edges of the input text box
		padding: 15,
	},
	iconContainer: {
		backgroundColor: COLORS.primary, //? The input text box also has a white background
		elevation: 40, //? Gives the impression of depth to this input text box
		height: 50, //? Determines how much height this will have
		width: 50,
		marginVertical: 10, //? Margin on vertical axis
		marginRight: 10, //? Margin to the right, giving space to the "adding" todo button
		borderRadius: 25, //? Rounds the edges of the input text box
		justifyContent: 'center',
		alignItems: 'center',
	},
});
