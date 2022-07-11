//? Dependencies
import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList, Alert } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox'; //? Documentation: https://github.com/WrathChaos/react-native-bouncy-checkbox
import ICON from 'react-native-vector-icons/MaterialIcons'; //? Documentation: https://github.com/oblador/react-native-vector-icons

//? Colors theme
const COLORS = { primary: '#800080', white: '#ffffff' };

//? Tracks the text input at the footer
const [textInput, setTextInput] = useState('');
//? Tracks the TODO list in the app body
const [allCachedTodos, setTodos] = useState([]);

//? This is the function that will get whatever text was inputted at
//? the bottom and add it to "allCachedTodos"
const addTodo = () => {
	//? Check if the textInput is empty when the user clicks the button
	//? to add a new Todo. This should never run because we don't display
	//? the "Add" button if the textInput is empty
	if (textInput == '') {
		Alert.alert('Error', 'Your todo input is empty');
		return;
	}

	//? If the textInput contains content, we create a new Todo with it
	const newTodo = {
		id: allCachedTodos.length + 1,
		taskDescription: textInput,
		completionStatus: false,
	};

	//? Then we append the new TODO to the end of the list
	setTodos([...allCachedTodos, newTodo]);
	//? And reset the input so the user doesn't have to
	setTextInput('');
};

//? This function will delete one or all todos from the list, depending
//? if the removal button was clicked in the header or within one todo
const deleteTodo = (deletionTodoId) => {
	//? Checks if the deletion button was clicked at the top to
	//? delete all items. The "0000" string is a placeholder and
	//? could be replaced by anything else
	if (deletionTodoId === '0000') {
		Alert.alert('Clear todos?', 'Warning: This action is not reversible!', [
			{ text: 'Confirm', onPress: () => setTodos([]) },
			{ text: 'Cancel' },
		]);
		return;
	}
	//? Iterate through the array of Todos and return all items but the
	//? one that has the ID matching the ID we are trying to delete
	const filteredTodoArray = allCachedTodos.filter((singleTodo) => singleTodo.id !== deletionTodoId);

	//? Update the UI with the remaining Todos
	setTodos(filteredTodoArray);
};

//? Update the status of this TODO. True will become false and vice versa
const changeTodoStatus = (status, completingTodoId) => {
	//? Iterate through the whole array of cached TODOs
	const updatedTodos = allCachedTodos.map((oneTodoFromArray) => {
		//? Find the TODO which the user clicked/tapped
		if (oneTodoFromArray.id == completingTodoId) {
			//? Change its completion state to what the tap tracked to change
			oneTodoFromArray.completionStatus = status;
		}
		return oneTodoFromArray;
	});
	//? Update TODO list state
	setTodos([...updatedTodos]);
};

//? This is the component that will be rendered for every index within the allCachedTodos
const ListItem = ({ todo: { item: oneOfTheTodos } }) => (
	<View
		style={[
			styles.listItem,
			{
				backgroundColor: oneOfTheTodos?.completionStatus ? '#90ee90' : 'white',
			},
		]}
	>
		{/* //? Creates the checkbox and the respective TODO text around it */}
		<View flex={1}>
			<BouncyCheckbox
				onPress={(isChecked) => changeTodoStatus(isChecked, oneOfTheTodos?.id)}
				unfillColor="white" //? Inner color of the checkbox
				fillColor="green" //? Outer color (radius) of the checkbox
				isChecked={oneOfTheTodos?.completionStatus} //? Checks initial state, doesn't update state yet
				text={oneOfTheTodos?.taskDescription} //? Todo text
				iconStyle={{
					borderWidth: 3, //? Make the TODO checkbox thicker than default
				}}
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
			<ICON name="delete" size={20} color={COLORS.white} onPress={() => deleteTodo(oneOfTheTodos?.id)}></ICON>
		</TouchableOpacity>
	</View>
);

const TodoScreen = () => (
	<SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
		{/* //? Section for the header, that has the bold title for our application */}
		<View style={styles.header}>
			<Text style={styles.headerText}>To-Do List</Text>
			{/* //? The UI will only render the DELETE ALL button on the header
            //? if there is even anything to be deleted in the first place */}
			{allCachedTodos.length > 0 && (
				<ICON name="delete" size={25} color="red" onPress={() => deleteTodo('0000')} />
			)}
		</View>
		{/* //? Section for the TODO list */}
		<FlatList
			showVerticalScrollIndicator={false}
			contentContainerStyle={{ padding: 10 }}
			data={allCachedTodos}
			renderItem={(oneTodo) => <ListItem todo={oneTodo} />}
		/>
		{/* //? Section for the footer where we can add new items to the list */}
		<View style={styles.footer}>
			{/* //? Footer's input data section */}
			<View style={styles.inputContainer}>
				<TextInput
					placeholder="Add new todo..."
					value={textInput}
					onChangeText={(text) => setTextInput(text)}
				></TextInput>
			</View>
			{/* //? Footer's "Add" button only renders if the textInput above isn't empty */}
			{textInput != '' && (
				<TouchableOpacity onPress={addTodo}>
					<View style={styles.iconContainer}>
						<ICON name="add" color={COLORS.white} size={30} />
					</View>
				</TouchableOpacity>
			)}
		</View>
	</SafeAreaView>
);

export default TodoScreen;

const styles = StyleSheet.create({
	//? The title of our app
	header: {
		margin: 10, //? Outer spacing to separate our container from the other containers or device edges
		padding: 20, //? Inner spacing between items and the edges of the container
		flexDirection: 'row', //? How the items should be align (Row = horizontal)
		alignItems: 'center', //? Align items vertically on the axis
		justifyContent: 'space-between', //? Put space between the items, but not around them
	},
	//? Inner text of the title of our app
	headerText: {
		fontSize: 20, //? Big
		fontWeight: 'bold', //? Strong
		color: COLORS.primary, //? Eyes flaming gold
	},
	//? Styling for each individual box of our todo list
	listItem: {
		padding: 20, //? Inner spacing between items and the edges of the container
		flexDirection: 'row',
		elevation: 12, //? Gives the impression of depth/distance from the background
		marginVertical: 10, //? Outer vertical spacing to separate our container from the other containers or device edges
		marginLeft: 5, //? Outer left spacing to separate our container from the other containers or device edges
		borderRadius: 10, //? Rounds the edges of the list Item box
	},
	//? The red box that holds the deletion/trash icon
	deleteBox: {
		height: 28, //? Determines how much height this will have
		width: 25, //? Determines how much width this will have
		backgroundColor: 'red', //? Defines the icon delete box to have a red background
		justifyContent: 'center', //? Vertically aligns the icon within the box
		alignItems: 'center', //? Horizontally aligns the icon within the box
		borderRadius: 5, //? Rounds the edges of the icon box
	},
	//? Footer of the page that will contain the new TODO input box its respective icon
	footer: {
		position: 'absolute', //? Sets the position of this view
		bottom: 0, //? Straight at the bottom
		color: COLORS.white, //? Color white not really relevant currently as the background is already white
		width: '100%', //? Makes the footer take the entire horizontal space, side to side
		flexDirection: 'row', //? Display items horizontally within the footer
		alignItems: 'center', //? Align items vertically within the footer
		paddingHorizontal: 2, //? Horizontally space out internal items by 2 to the edges
	},
	//? Inside the footer, this will be the text container that will have the new TODO
	inputContainer: {
		backgroundColor: COLORS.white, //? The input text box also has a white background
		elevation: 40, //? Gives the impression of depth to this input text box
		flex: 1, //? Asks this container to stretch as much as possible while still respecting the others
		height: 50, //? Determines how much height this will have
		margin: 10, //? Outer spacing to separate our container from the other containers or device edges
		borderRadius: 30, //? Rounds the edges of the input text box
		justifyContent: 'center', //? Vertically aligns the inner text within the box
		padding: 15, //? Inner spacing between items and the edges of the container
	},
	//? Inside the footer, this will be the PLUS icon that will add the text from "inputContainer" to the TODO list
	iconContainer: {
		backgroundColor: COLORS.primary, //? The input text box also has a white background
		elevation: 40, //? Gives the impression of depth/distance from the background
		height: 50, //? Determines how much height this will have
		width: 50, //? Determines how much width this will have
		marginVertical: 10, //? Margin on vertical axis
		marginRight: 10, //? Margin to the right, giving space to the "adding" todo button
		borderRadius: 25, //? Rounds the edges of the icon box
		justifyContent: 'center', //? Vertically aligns the icon within the box
		alignItems: 'center', //? Horizontally aligns the icon within the box
	},
});
