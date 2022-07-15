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
const COLORS = { primary: '#800080', white: '#ffffff' };

const TodoScreen = ({ navigation, route }) => {
	//? Tracks the text input at the footer
	const [textInput, setTextInput] = useState('');
	//? Tracks the TODO list in the app body
	const [allCachedTodos, setTodos] = useState([]);
	//? Tracks the TODO time limit
	const [date, setDate] = useState(new Date());
	//? Manages the opening and closing of the date picker
	const [modalVisible, setModalVisible] = useState(false);

	//? Processes the snapshot result of the database query for todos
	function onSnapshotResult(QuerySnapshot) {
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
		const sortedByCreationTodos = databaseFetchedTodos.sort(
			(a, b) => a.creationTime > b.creationTime
		);
		if (allCachedTodos.toString() != sortedByCreationTodos.toString()) {
			setTodos(sortedByCreationTodos);
		}
	}

	//? Displays error upon snapshot error of the database query for todos
	function onSnapshotError(error) {
		alert('Failed to retrieve database data: ' + error);
	}

	firestore()
		.collection('Todos') //? Queries the 'Todos' collection
		.where('taskOwner', '==', route.params.user) //? Retrieves documents where the taskOwner is the same person who is logged in
		//? .limit(10) for pagination
		.onSnapshot(onSnapshotResult, onSnapshotError);

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
			.catch((err) => alert('failed to save this todo on the database: ' + err));

		//? And reset the input so the user doesn't have to
		setTextInput('');
		setDate(new Date());
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
			})
			.catch((error) => alert('Error deleting this todo: ' + error));
	};

	//? Update the status of this TODO. True will become false and vice versa
	const changeTodoStatus = (status, completingTodoId) => {
		firestore().collection('Todos').doc(completingTodoId).update({
			completionStatus: status,
		});
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
						: '#eeeeee',
				},
			]}
		>
			{/* //? Creates the checkbox and the respective TODO text around it */}
			<View flex={1} flexDirection="row">
				<BouncyCheckbox
					onPress={(isChecked) => changeTodoStatus(isChecked, oneOfTheTodos?.id)}
					unfillColor={
						oneOfTheTodos?.completionStatus
							? '#90ee90'
							: oneOfTheTodos?.targetDate < new Date() / 1000
							? '#eeaaaa'
							: '#eeeeee'
					} //? Inner color of the checkbox
					fillColor="green" //? Outer color (radius) of the checkbox
					isChecked={oneOfTheTodos?.completionStatus} //? Checks initial state, doesn't update state yet
					size={35}
					iconStyle={{
						borderWidth: 3, //? Make the TODO checkbox thicker than default
					}}
				></BouncyCheckbox>
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
			<View style={styles.iconsArea}>
				{!oneOfTheTodos?.completionStatus && (
					<View marginRight={5}>
						<TouchableOpacity style={[styles.deleteBox, { backgroundColor: 'grey' }]}>
							<ICON
								name="edit"
								size={20}
								color={COLORS.white}
								onPress={() => editTodo(oneOfTheTodos?.id)}
							></ICON>
						</TouchableOpacity>
					</View>
				)}
				<TouchableOpacity style={[styles.deleteBox]}>
					<ICON
						name="delete"
						size={20}
						color={COLORS.white}
						onPress={() => deleteTodo(oneOfTheTodos?.id)}
					></ICON>
				</TouchableOpacity>
			</View>
		</View>
	);

	return (
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
			{/* //? This is the prompt box that displays once you click to add a todo */}
			<Modal animationType="slide" transparent={true} visible={modalVisible}>
				<View style={styles.centeredView}>
					<View style={styles.modalView}>
						<Text style={styles.modalText}>Pick the limit for this task:</Text>
						<DatePicker date={date} onDateChange={setDate} />
						<View style={styles.buttonsRow}>
							<TouchableOpacity
								style={[styles.button, styles.buttonOpen]}
								onPress={() => setModalVisible(!modalVisible)}
							>
								<Text style={styles.textStyle}>Close</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.button, styles.buttonClose, { marginLeft: 10 }]}
								onPress={() => {
									addTodo();
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
				style={{ backgroundColor: 'coral', flex: 1 }}
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
					<TouchableOpacity onPress={() => setModalVisible(true)}>
						<View style={styles.iconContainer}>
							<ICON name="add" color={COLORS.white} size={30} />
						</View>
					</TouchableOpacity>
				)}
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
	listItemText: {
		fontSize: 15, //? Not that big
		fontWeight: 'bold', //? Strong
		color: COLORS.primary, //? Contrasting purple
		//? If the "todo" has "completionStatus" equal to "true",
		//? line-through the text. Do nothing otherwise
		textAlignVertical: 'center', //? Center the text vertically
	},
	iconsArea: {
		width: 60,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-end',
		paddingRight: 10,
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
	buttonsRow: {
		width: '100%',
		flexDirection: 'row', //? Display items horizontally within the footer
		alignSelf: 'flex-end',
	},
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 22,
	},
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
	button: {
		borderRadius: 20,
		padding: 10,
		elevation: 2,
	},
	buttonOpen: {
		backgroundColor: '#F194FF',
	},
	buttonClose: {
		backgroundColor: COLORS.primary,
	},
	textStyle: {
		color: 'white',
		fontWeight: 'bold',
		textAlign: 'center',
	},
	modalText: {
		marginBottom: 15,
		textAlign: 'center',
	},
});
