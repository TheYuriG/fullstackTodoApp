//? Dependencies
import { useState } from 'react';
import {
	SafeAreaView,
	StyleSheet,
	Modal,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	FlatList,
	Alert,
} from 'react-native';
import DatePicker from 'react-native-date-picker'; //? Documentation: https://github.com/henninghall/react-native-date-picker
import BouncyCheckbox from 'react-native-bouncy-checkbox'; //? Documentation: https://github.com/WrathChaos/react-native-bouncy-checkbox
import ICON from 'react-native-vector-icons/MaterialIcons'; //? Documentation: https://github.com/oblador/react-native-vector-icons
import firestore from '@react-native-firebase/firestore'; //? Documentation: https://rnfirebase.io/firestore/usage

//? Colors theme
const COLORS = { primary: '#800080', white: '#ffffff', grey: '#dddddd' };

const TodoScreen = ({ navigation, route }) => {
	//? Tracks the text input at the footer
	const [textInput, setTextInput] = useState('');
	//? Tracks the TODO list in the app body
	const [allCachedTodos, setTodos] = useState([]);
	//? Tracks the TODO time limit
	const [date, setDate] = useState(new Date());
	//? Manages the opening and closing of the date picker
	const [modalVisible, setModalVisible] = useState(false);
	//? ID of the todo being edited, if any
	const [todoToBeEdited, setEditTodo] = useState();
	//? logged in data of the user
	const user = route.params.user;

	//? Processes the snapshot result of the database query for todos
	function databaseReadResult(QuerySnapshot) {
		//? Go through every document fetched from the database and
		//? transform it in useful data for the app
		const databaseFetchedTodos = QuerySnapshot['_docs'].map((document) => {
			const individualDatabaseTodo = {
				id: document._ref._documentPath._parts[1],
				taskDescription: document._data.taskDescription,
				completionStatus: document._data.completionStatus,
				editedAt: document._data.editedAt.seconds,
				creationTime: document._data.creationTime.seconds,
				targetDate: document._data.targetDate.seconds,
			};
			return individualDatabaseTodo;
		});

		//? Sort the useful data by creation date
		const sortedByCreationTodos = databaseFetchedTodos.sort(
			(a, b) => a.creationTime > b.creationTime
		);

		//? Update the UI with the useful data
		setTodos(sortedByCreationTodos);
	}

	//? Helper function that will read the database for a specific user and
	//? then update the UI accordingly
	function performOneDatabaseRead() {
		//? Access the database and then use "databaseReadResult()" to
		//? modify the result into useful data for the UI
		firestore()
			.collection('Todos') //? Queries the 'Todos' collection
			.where('taskOwner', '==', user) //? Retrieves documents where the taskOwner is the same person who is logged in
			.get()
			.then((result) => {
				databaseReadResult(result);
			});
	}

	const user = route.params.user;

	if (user == 'admin@domain.com') {
		firestore()
			.collection('Todos') //? Queries the 'Todos' collection
			.limit(10)
			.onSnapshot(onSnapshotResult, onSnapshotError);
	} else {
		//? If any other user is logged in, display all todos
		performOneDatabaseRead();
	}

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
			taskDescription: textInput,
			completionStatus: false,
			creationTime: new Date(),
			editedAt: new Date(),
			targetDate: date,
			taskOwner: route.params.user,
		};

		//? Save this todo to the database
		firestore()
			.collection('Todos')
			.add(newTodo)
			.then(() => {
				//? Once document creation is finished, update UI with new data
				performOneDatabaseRead();
				//? And reset the input so the user doesn't have to
				setTextInput('');
				setDate(new Date());
			})
			.catch((err) => alert('failed to save this todo on the database: ' + err));
	};

	//? This is the function that runs once the user clicks the grey edit
	//? button on any todo item
	const clickEditTodo = (editingTodo) => {
		//? Sets the text as same saved
		setTextInput(editingTodo.taskDescription);
		//? Uses old target date in case the user wants to reuse it
		setDate(new Date(editingTodo.targetDate * 1000));
		//? Sets this variable to the todo object so when the user confirms
		//? the date, it updates the old todo instead of creating a new one
		setEditTodo(editingTodo);
	};

	//? Sends a database request to update this todo after confirming the date
	const databaseEditTodo = () => {
		//? Save it to the database
		firestore()
			.collection('Todos')
			.doc(todoToBeEdited.id)
			.update({
				taskDescription: textInput,
				editedAt: new Date(),
				targetDate: date,
			})
			.then(() => {
				//? And reset the input so the user doesn't have to
				setTextInput('');
				setDate(new Date());
				setEditTodo();
				//? Then update UI accordingly
				performOneDatabaseRead();
			});
	};

	//? This function will delete one or all todos from the list, depending
	//? if the removal button was clicked in the header or within one todo
	const deleteTodo = (deletionTodoId) => {
		//? Checks if the deletion button was clicked at the top to
		//? delete all items. The "0000" string is a placeholder and
		//? could be replaced by anything else
		if (deletionTodoId === '0000') {
			//? Function to iterate through this user's local todos and
			//? send an individual deletion for each of them
			const deleteAllTodos = () => {
				allCachedTodos.forEach((todo) => {
					firestore().collection('Todos').doc(todo.id).delete();
				});
				performOneDatabaseRead();
			};

			//? Prompt the user for confirmation regarding deleting all of their todos
			Alert.alert('Clear todos?', 'Warning: This action is not reversible!', [
				{
					text: 'Confirm',
					onPress: deleteAllTodos,
				}, //? If confirmed, run the function "deleteAllTodos" above
				{ text: 'Cancel' },
			]);
			return;
		}

		//? Query firestore for this specific document ID and request a deletion
		firestore()
			.collection('Todos')
			.doc(deletionTodoId)
			.delete()
			.then(() => {
				//? Alert the user upon completion
				alert('Todo deleted!');
				//? Update UI accordingly
				performOneDatabaseRead();
			})
			.catch((error) => alert('Error deleting this todo: ' + error));
	};

	//? Update the status of this TODO. True will become false and vice versa
	const changeTodoStatus = (status, completingTodoId) => {
		//? Update completion status for this todo, then update UI
		firestore()
			.collection('Todos')
			.doc(completingTodoId)
			.update({
				completionStatus: status,
				editedAt: new Date(),
			})
			.then(() => performOneDatabaseRead());
	};

	//? This is the component that will be rendered for every index within the allCachedTodos
	const ListItem = ({ todo: { item: oneOfTheTodos } }) => (
		<View
			style={[
				styles.listItem,
				{
					//? Background color will be defined by these principles:
					//? (1) check if the task was finished and paint it green if so
					//? (2) check if there is still time to complete the task, paint
					//? the background white if so.
					//? (3) If both of the previous checks failed, it means that the
					//? task isn't completed yet and it ran out of time, so paint it red
					backgroundColor: oneOfTheTodos?.completionStatus
						? '#90ee90'
						: oneOfTheTodos?.targetDate < new Date() / 1000
						? '#eeaaaa'
						: COLORS.grey,
				},
			]}
		>
			{/* //? Creates the checkbox and the respective TODO text around it */}
			<View flex={1} flexDirection="row" padding={5}>
				{user !== 'admin@domain.com' && (
					<BouncyCheckbox
						onPress={(isChecked) => changeTodoStatus(isChecked, oneOfTheTodos?.id)}
						unfillColor={
							oneOfTheTodos?.completionStatus
								? '#90ee90'
								: oneOfTheTodos?.targetDate < new Date() / 1000
								? '#eeaaaa'
								: COLORS.grey
						} //? Inner color of the checkbox
						fillColor="green" //? Outer color (radius) of the checkbox
						isChecked={oneOfTheTodos?.completionStatus} //? Checks initial state, doesn't update state yet
						size={35} //? Size of the checkbox
						iconStyle={{
							borderWidth: 3, //? Make the TODO checkbox thicker than default
						}}
					></BouncyCheckbox>
				)}
				{/* //? Task description text box */}
				<Text
					style={[
						styles.listItemText,
						{
							textDecorationLine: oneOfTheTodos?.completionStatus
								? 'line-through'
								: 'none',
						},
					]}
				>
					{oneOfTheTodos?.taskDescription}
				</Text>
			</View>
			{/* //? View containing the edit and delete buttons */}
			{user !== 'admin@domain.com' && (
				<View style={styles.iconsArea}>
					{/* //? Edit button */}
					{!oneOfTheTodos?.completionStatus && (
						<View marginRight={5}>
							<TouchableOpacity
								style={[styles.deleteBox, { backgroundColor: 'grey' }]}
							>
								<ICON
									name="edit"
									size={20}
									color={COLORS.white}
									onPress={() => clickEditTodo(oneOfTheTodos)}
								></ICON>
							</TouchableOpacity>
						</View>
					)}
					{/* //? Delete button */}
					<TouchableOpacity style={[styles.deleteBox]}>
						<ICON
							name="delete"
							size={20}
							color={COLORS.white}
							onPress={() => deleteTodo(oneOfTheTodos?.id)}
						></ICON>
					</TouchableOpacity>
				</View>
			)}
		</View>
	);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
			{/* //? Section for the header, that has the bold title for our application */}
			<View style={styles.header}>
				<Text style={styles.headerText}>To-Do List</Text>
				{/* //? The UI will only render the DELETE ALL button on the header
            //? if there is even anything to be deleted in the first place */}
				{allCachedTodos.length > 0 && user !== 'admin@domain.com' && (
					<ICON name="delete" size={25} color="red" onPress={() => deleteTodo('0000')} />
				)}
			</View>
			{/* //? This is the prompt box that displays once you click to add a todo */}
			<Modal animationType="slide" transparent={true} visible={modalVisible}>
				<View style={styles.centeredView}>
					<View style={[styles.modalView, { backgroundColor: '#dddddd' }]}>
						<Text style={[styles.listItemText, { flex: null }]}>
							Pick the limit for this task:
						</Text>
						<DatePicker
							date={date}
							onDateChange={setDate}
							minimumDate={new Date()}
							textColor={COLORS.primary}
							fadeToColor={COLORS.grey}
						/>
						<View style={styles.buttonsRow}>
							<TouchableOpacity
								style={styles.button}
								onPress={() => {
									//? Close the box
									setModalVisible(!modalVisible);

									//? If the user was updating a todo,
									//? closing a modal will cancel the update
									if (todoToBeEdited != undefined) {
										todoToBeEdited = undefined;
										setDate(new Date());
										setTextInput('');
									}
								}}
							>
								<Text style={styles.listItemText}>
									{/* //? Display different text if the user is editing a todo or not */}
									{todoToBeEdited == undefined ? 'Close' : 'Cancel update'}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[
									styles.button,
									{ backgroundColor: COLORS.primary, marginLeft: 10 },
								]}
								onPress={() => {
									if (todoToBeEdited == undefined) {
										addTodo();
									} else {
										databaseEditTodo();
									}
									setModalVisible(!modalVisible);
								}}
							>
								<Text style={styles.textStyle}>Select Date</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
			{/* //? Section for the TODO list */}
			<FlatList
				showVerticalScrollIndicator={false}
				style={{ backgroundColor: 'coral' }}
				contentContainerStyle={{ padding: 5, paddingRight: 10, paddingBottom: 65 }}
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
				{/* //? Footer's "Add" button */}
				<TouchableOpacity onPress={() => setModalVisible(true)}>
					<View style={styles.iconContainer}>
						<ICON name="add" color={COLORS.white} size={30} />
					</View>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
};

export default TodoScreen;

const styles = StyleSheet.create({
	//? The title of our app
	header: {
		padding: 15, //? Inner spacing between items and the edges of the container
		flexDirection: 'row', //? How the items should be align (Row = horizontal)
		alignItems: 'center', //? Align items vertically on the axis
		justifyContent: 'space-between', //? Put space between the items, but not around them
		backgroundColor: 'pink',
	},
	//? Inner text of the title of our app
	headerText: {
		fontSize: 20, //? Big
		fontWeight: 'bold', //? Strong
		color: COLORS.primary, //? Eyes flaming gold
	},
	//? Styling for each individual box of our todo list
	listItem: {
		padding: 5, //? Inner spacing between items and the edges of the container
		flexDirection: 'row', //? Display items on the horizontal axis
		elevation: 10, //? Gives the impression of depth/distance from the background
		marginVertical: 5, //? Outer vertical spacing to separate our container from the other containers or device edges
		marginLeft: 5, //? Outer left spacing to separate our container from the other containers or device edges
		borderRadius: 20, //? Rounds the edges of the list Item box
	},
	//? Text inside a todo item
	listItemText: {
		flex: 1,
		fontSize: 15, //? Not that big
		fontWeight: 'bold', //? Strong
		color: COLORS.primary, //? Contrasting purple
		//? If the "todo" has "completionStatus" equal to "true",
		//? line-through the text. Do nothing otherwise
		textAlignVertical: 'center', //? Center the text vertically
	},
	//? Protecting area where the edit and delete buttons are
	iconsArea: {
		flexDirection: 'row', //? Distribute edit and delete icons horizontally
		alignItems: 'center', //? Align items centralized vertically
		justifyContent: 'flex-end', //? Display items at the right end of the list
		paddingRight: 10, //? Spacing between the delete icon and the edge of the list item
	},
	//? The red/grey box that holds the editing/deletion icon
	deleteBox: {
		height: 28, //? Determines how much height this will have
		width: 25, //? Determines how much width this will have
		backgroundColor: 'red', //? Defines the icon delete box to have a red background. The edit icon overrides this with grey
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
	//? The Date/Time box
	modalView: {
		margin: 20,
		backgroundColor: 'white',
		borderRadius: 20,
		padding: 35,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	//? Centers the Date/Time box
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 22,
	},
	//? Modal text
	//! Could use refactoring
	modalText: {
		marginBottom: 15,
		textAlign: 'center',
	},
	//? Basic button definition for the modal box
	//! Could use refactoring
	button: {
		borderRadius: 20,
		padding: 10,
	},
	//? Row of buttons inside the modal
	buttonsRow: {
		width: '100%', //? Expand row to take all horizontal space in the modal
		flexDirection: 'row', //? Display items horizontally within the modal
		alignSelf: 'flex-end', //? Display items at the right end of the modal
	},
	//? Modal button text
	//! Could use refactoring
	textStyle: {
		color: 'white',
		fontWeight: 'bold',
		textAlign: 'center',
	},
});
