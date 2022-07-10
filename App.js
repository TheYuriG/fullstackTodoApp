//? Dependencies
import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox'; //? Documentation: https://github.com/WrathChaos/react-native-bouncy-checkbox
import ICON from 'react-native-vector-icons/MaterialIcons'; //? Documentation: https://github.com/oblador/react-native-vector-icons

//? Colors theme
const COLORS = { primary: '#800080', white: '#ffffff' };

export default function App() {
	const [allCachedTodos, setTodos] = useState([
		{ id: 1, taskDescription: 'First TODO', completionStatus: true },
		{ id: 2, taskDescription: 'Second TODO', completionStatus: false },
		{ id: 3, taskDescription: 'Third TODO', completionStatus: false },
	]);

	//? This is the component that will be rendered for every index within
	const ListItem = ({ todo: { item: oneOfTheTodos } }) => (
		<View
			style={[
				styles.listItem,
				{
					backgroundColor: oneOfTheTodos?.completionStatus ? '#90ee90' : 'white',
				},
			]}
		>
			<View flex={1}>
				<BouncyCheckbox
					unfillColor="white"
					fillColor="green"
					isChecked={oneOfTheTodos?.completionStatus}
					text={oneOfTheTodos?.taskDescription}
					textStyle={{
						fontSize: 15, //? Not that big
						fontWeight: 'bold', //? Strong
						color: COLORS.primary, //? Contrasting purple
						textDecorationLine: oneOfTheTodos?.completionStatus ? 'line-through' : 'none',
						//? If the "todo" has "completionStatus" equal to "true",
						//? line-through the text. Do nothing otherwise
					}}
				></BouncyCheckbox>
			</View>
			<TouchableOpacity style={[styles.deleteBox]}>
				<ICON name="delete" size={20} color={COLORS.white}></ICON>
			</TouchableOpacity>
		</View>
	);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
			{/* //? Section for the header, that has the bold title for our application */}
			<View style={styles.header}>
				<Text style={styles.headerText}>To-Do List</Text>
				<ICON name="delete" size={25} color="red" />
			</View>
			{/* //? Section for the TODO list */}
			<FlatList
				showVerticalScrollIndicator={false}
				contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
				data={allCachedTodos}
				renderItem={(oneTodo) => <ListItem todo={oneTodo} />}
			/>
			{/* //? Section for the footer where we can add new items to the list */}
			<View style={styles.footer}>
				{/* //? Footer's input data section */}
				<View style={styles.inputContainer}>
					<TextInput placeholder="Add new todo..."></TextInput>
				</View>
				{/* //? Footer's "Add" button */}
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
	listItem: {
		padding: 20,
		flexDirection: 'row',
		elevation: 12,
		borderRadius: 7,
		marginVertical: 10,
		marginLeft: 5,
		borderRadius: 10,
	},
	deleteBox: {
		height: 25,
		width: 25,
		backgroundColor: 'red',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 5,
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
		flex: 1, //? Asks this container to stretch as much as possible while still respecting the others
		height: 50, //? Determines how much height this will have
		marginVertical: 10, //? Margin on vertical axis
		marginHorizontal: 10, //? Margin to the right, giving space to the "adding" todo button
		borderRadius: 30, //? Rounds the edges of the input text box
		justifyContent: 'center', //? Vertically aligns the inner text within the box
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
