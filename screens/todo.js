//? Dependencies
import { useState, useEffect } from 'react';
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
import { COLORS } from '../colors/colors.js';
import DatePicker from 'react-native-date-picker'; //? Documentation: https://github.com/henninghall/react-native-date-picker
import BouncyCheckbox from 'react-native-bouncy-checkbox'; //? Documentation: https://github.com/WrathChaos/react-native-bouncy-checkbox
import ICON from 'react-native-vector-icons/MaterialIcons'; //? Documentation: https://github.com/oblador/react-native-vector-icons
import firestore from '@react-native-firebase/firestore'; //? Documentation: https://rnfirebase.io/firestore/usage
import auth from '@react-native-firebase/auth'; //? Documentation: https://rnfirebase.io/auth/usage

const TodoScreen = ({ navigation, route }) => {
	//? Tracks the text input at the footer
	const [textInput, setTextInput] = useState('');
	//? Tracks the TODO list in the app body
	const [displayedTodos, setTodos] = useState([]);
	//? Tracks ALL the TODOs (only relevant in admin mode)
	const [allTodos, setAllTodos] = useState([]);
	//? Tracks the TODO time limit
	const [date, setDate] = useState(new Date());
	//? Manages the opening and closing of the date picker
	const [modalVisible, setModalVisible] = useState(false);
	//? Filter to display all TODOs or only the ones that are due
	const [filterByDue, setFilterByDue] = useState(false);
	//? Pagination system
	const [lastDocument, setLastDocument] = useState();
	//? ID of the todo being edited, if any
	const [todoToBeEdited, setEditTodo] = useState();
	//? Page the user is currently viewing
	const [page, setPage] = useState(1);
	//? Disable the next button if you have not fetched the limit of items per page
	const [nextEnabled, setEnableNextButton] = useState(true);
	//? Email of the logged user, passed as parameters when navigating to "todo"
	const user = route.params.user;
	//? Define a subjective limit of items per page. The number itself
	//? doesn't matter, we just need to have one number, any number, defined
	//! The lower the number, the more pages we need to load and
	//! network requests we need to make. We want to be efficient
	const limitPerPage = 10;

	//? Processes the snapshot result of the database query for todos
	function databaseReadResult(databaseData, due = false) {
		//? Go through every document fetched from the database and
		//? transform it in useful data for the app
		let databaseFetchedTodos = databaseData['_docs'].map((document) => {
			const individualDatabaseTodo = {
				id: document._ref._documentPath._parts[1],
				taskDescription: document._data.taskDescription,
				completionStatus: document._data.completionStatus,
				editedAt: document._data.editedAt,
				creationTime: document._data.creationTime,
				targetDate: document._data.targetDate,
			};
			return individualDatabaseTodo;
		});

		//? Sort the useful data by creation date
		const sortedByCreationTodos = databaseFetchedTodos.sort(
			(a, b) => a.creationTime > b.creationTime
		);

		//? Update the UI with the useful data sorted by creation date
		setTodos(sortedByCreationTodos);

		//? Run special functions if in admin mode
		if (user == 'admin@domain.com') {
			//? We store the last document for the admin pagination system
			const numOfDocsFetched = databaseData['_docs'].length;
			if (numOfDocsFetched > 0) {
				setLastDocument(databaseData['_docs'][numOfDocsFetched - 1]);
			}

			//? Check if there is a mismatch with the filterByDue value,
			//? which would mean the admin just clicked to toggle due TODOs
			if (due != filterByDue) {
				//? If the user just clicked the due TODOs toggle, overwrite
				//? the cached TODOs with the ones just fetched
				setAllTodos(sortedByCreationTodos);
			} else {
				//? If there is no mismatch, add to the cached TODOs
				setAllTodos([...allTodos, ...sortedByCreationTodos]);
			}
		}

		//? If the database request fetched less than the limit of items
		//? per page, then we should disable the "NEXT" button as we have
		//? reached the limit of documents available
		if (databaseFetchedTodos.length < limitPerPage) {
			setEnableNextButton(false);
		}
	}

	//? Helper function that will read the database for a specific user, pull all of their TODOs
	//? and then update the UI accordingly
	function performOneDatabaseRead() {
		//? Access the database and then use "databaseReadResult()" to
		//? modify the result into useful data for the UI
		firestore()
			.collection('Todos') //? Queries the 'Todos' collection
			.where('taskOwner', '==', user) //? Retrieves documents where the taskOwner is the same person who is logged in
			// .orderBy('createdAt', 'asc')
			.get()
			.then((result) => {
				databaseReadResult(result);
			});
	}

	//? Handles pagination for admin mode, obeying "limitPerPage"
	function adminPagination(page, due = filterByDue) {
		//? Check if the passed in filterByDue matches the current state
		//! This will be false when the user clicks to enable/disable the
		//! filterByDue button on the header, due to how setState works
		const dueMismatch = due != filterByDue;

		//? Check if the cached todos array is bigger than the sequence
		//? of requested items. If yes, the user is requesting to view
		//? items that are not cached in memory and therefore we will now
		//? fetch said items
		//! If we have a filterByDue mismatch, fetch all items again
		if (allTodos.length == 0 || dueMismatch) {
			//? Making first request when loading in admin mode or when the admin
			//? toggles between all TODOs and due TODOs
			firestore()
				.collection('Todos') //? Queries the 'Todos' collection
				//? Check due time if the admin requested this filter
				.where('targetDate', due ? '<' : '>', due ? new Date().getTime() : 0)
				//? Sorting is unnecessary here, but Firestore cries about it if we don't do it
				.orderBy('targetDate', 'asc')
				.limit(limitPerPage) //? Limit items per request
				.get()
				.then((result) => {
					databaseReadResult(result, due);
				});
		} else if (allTodos.length <= (page - 1) * limitPerPage) {
			//? Requesting additional database documents if the next page
			//? of todos wasn't cached in memory yet
			firestore()
				.collection('Todos') //? Queries the 'Todos' collection
				//? Check due time if the admin requested this filter
				.where('targetDate', due ? '<' : '>', due ? new Date().getTime() : 0)
				//? Sorting is unnecessary here, but Firestore cries about it if we don't do it
				.orderBy('targetDate', 'asc')
				.limit(limitPerPage) //? Limit items per request
				.startAfter(lastDocument)
				.get()
				.then((result) => {
					databaseReadResult(result, due);
				});
		} else {
			//? If the user is requesting to see items we have already cached,
			//? we load those from the cached array and display them
			const nowDisplayingTodos = allTodos.slice(
				(page - 1) * limitPerPage, //? Starting point (inclusive)
				page * limitPerPage //? Ending point (not inclusive)
			);
			setTodos(nowDisplayingTodos);

			//? If the retrieved data from a database request is less items than
			//? the limit per page, then you assume to have reached the end of
			//? the database and disable the "NEXT" pagination button
			//! Sadly firebase doesn't offer an easy way to check the size
			//! of a collection (like MongoDB's countDocuments()'s function)
			//! so this 'hack' is what we gotta settle for, at the moment
			if (allTodos.length >= page * limitPerPage) {
				setEnableNextButton(true);
			} else {
				setEnableNextButton(false);
			}
		}
	}

	//? Loads app data from database upon first mount
	useEffect(() => {
		//? Checks who is accessing the app and provides the UI accordingly
		if (user == 'admin@domain.com') {
			//? If the admin is logged in, display todos in pagination mode
			adminPagination(page);
		} else {
			//? If any other user is logged in, display all todos for that user
			performOneDatabaseRead();
		}
	}, []);

	//? This is the function that will get whatever text was inputted at
	//? the bottom and add it to "displayedTodos"
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
			creationTime: new Date().getTime(),
			editedAt: new Date().getTime(),
			targetDate: date.getTime(),
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
				displayedTodos.forEach((todo) => {
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

	//? This is the component that will be rendered for every index within the displayedTodos
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
						? COLORS.taskComplete
						: oneOfTheTodos?.targetDate < new Date().getTime()
						? COLORS.taskDue
						: COLORS.white,
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
								? COLORS.taskComplete
								: oneOfTheTodos?.targetDate < new Date().getTime()
								? COLORS.taskDue
								: COLORS.white
						} //? Inner color of the checkbox
						fillColor={COLORS.checkBox} //? Outer color (radius) of the checkbox
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
							flex: 1,
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
								style={[styles.actionBox, { backgroundColor: COLORS.grey }]}
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
					<TouchableOpacity style={[styles.actionBox]}>
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

	//? The UI being rendered and displayed
	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: COLORS.tertiary }}>
			{/* //? Section for the header, that has the bold title for our application */}
			<View style={styles.header}>
				<Text style={styles.headerText}>To-Do List{filterByDue ? ' (only due)' : ''}</Text>
				<View flexDirection="row">
					{/* //? The UI will only render the DELETE ALL button on the header
            		//? if there is even anything to be deleted in the first place */}
					{displayedTodos.length > 0 && user !== 'admin@domain.com' && (
						<View marginRight={10}>
							<ICON
								name="delete"
								size={25}
								color={COLORS.danger}
								onPress={() => deleteTodo('0000')}
							/>
						</View>
					)}
					{/* //? Button to display only TODOs that are due */}
					{displayedTodos.length > 0 && user === 'admin@domain.com' && (
						<View marginRight={10}>
							<ICON
								name="timer"
								size={25}
								color={filterByDue ? COLORS.danger : COLORS.white}
								onPress={() => {
									//? Toggle whether to display only due TODOs or all
									setFilterByDue(!filterByDue);
									//? Reset to page 1
									setPage(1);
									//? Enable next button if the admin was on the last page
									//? (will be disabled again by "adminPagination()" if needed)
									setEnableNextButton(true);
									//? Refresh todos on the screen considering the data above
									adminPagination(1, !filterByDue);
								}}
							/>
						</View>
					)}
					{/* //? Logout button */}
					<ICON
						name="logout"
						size={25}
						color={COLORS.white}
						onPress={() => {
							auth()
								.signOut()
								.then(() => {
									//? Once the user logs out, return to the login screen
									navigation.popToTop();
								});
						}}
					/>
				</View>
			</View>
			{/* //? This is the prompt box that displays once you click to add a todo */}
			<Modal animationType="slide" transparent={true} visible={modalVisible}>
				<View style={styles.centeredView}>
					<View style={[styles.modalView, { backgroundColor: COLORS.tertiary }]}>
						<Text style={[styles.listItemText, { flex: null }]}>
							Pick the limit for this task:
						</Text>
						<DatePicker
							date={date}
							onDateChange={setDate}
							minimumDate={new Date()}
							textColor={COLORS.primary}
							fadeToColor={COLORS.tertiary}
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
										setEditTodo(undefined);
										setDate(new Date());
										setTextInput('');
									}
								}}
							>
								<Text style={[styles.listItemText, { color: COLORS.primary }]}>
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
								<Text style={[styles.listItemText, { color: COLORS.white }]}>
									Select Date
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
			{/* //? Section for the TODO list */}
			<FlatList
				showVerticalScrollIndicator={false}
				style={{ backgroundColor: COLORS.tertiary }}
				contentContainerStyle={{ padding: 5, paddingRight: 10, paddingBottom: 65 }}
				data={displayedTodos}
				renderItem={(oneTodo) => <ListItem todo={oneTodo} />}
			/>
			{/* //? Section for the footer where users can add new items to
			//? the list. This will not display in admin mode */}
			{user != 'admin@domain.com' && (
				<View style={styles.footer}>
					{/* //? Footer's input data section */}
					<View style={styles.inputContainer}>
						<TextInput
							placeholder="Add new todo..."
							value={textInput}
							onChangeText={(text) => setTextInput(text)}
						></TextInput>
					</View>
					{/* //? Footer's "Add" button if new, "Edit" button if old */}
					<TouchableOpacity onPress={() => setModalVisible(true)}>
						<View style={styles.iconContainer}>
							<ICON
								name={todoToBeEdited != undefined ? 'edit' : 'add'}
								color={COLORS.white}
								size={30}
							/>
						</View>
					</TouchableOpacity>
				</View>
			)}
			{/* //? Admin mode pagination */}
			{user == 'admin@domain.com' && (
				<View
					backgroundColor={COLORS.tertiary}
					flexDirection="row"
					justifyContent="space-around"
					paddingBottom={20}
				>
					{/* //? The "previous" button only renders if not on page 1 */}
					{page != 1 && (
						<TouchableOpacity
							style={[
								styles.button,
								{ backgroundColor: COLORS.white, elevation: 10 },
							]}
							onPress={() => {
								adminPagination(page - 1);
								setPage((page) => page - 1);
							}}
						>
							<View flexDirection="row" padding={3}>
								<ICON name="chevron-left" color={COLORS.primary} size={20} />
								<Text style={styles.listItemText}>Previous</Text>
							</View>
						</TouchableOpacity>
					)}
					{/* //? The "next" button only renders if the current loaded page has
					//? as many items as the limit per page inside the pagination function */}
					{nextEnabled && (
						<TouchableOpacity
							style={[
								styles.button,
								{ backgroundColor: COLORS.white, elevation: 10 },
							]}
							onPress={() => {
								adminPagination(page + 1);
								setPage((page) => page + 1);
							}}
						>
							<View flexDirection="row" padding={3}>
								<Text style={styles.listItemText}>Next</Text>
								<ICON name="chevron-right" color={COLORS.primary} size={20} />
							</View>
						</TouchableOpacity>
					)}
				</View>
			)}
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
		backgroundColor: COLORS.secondary,
		elevation: 10,
	},
	//? Inner text of the title of our app
	headerText: {
		fontSize: 20, //? Big
		fontWeight: 'bold', //? Strong
		color: COLORS.white, //? Eyes flaming gold
	},
	//? Styling for each individual box of our todo list
	listItem: {
		padding: 5, //? Inner spacing between items and the edges of the container
		flexDirection: 'row', //? Display items on the horizontal axis
		elevation: 10, //? Gives the impression of depth/distance from the background
		marginVertical: 5, //? Outer vertical spacing to separate our container from the other containers or device edges
		marginLeft: 5, //? Outer left spacing to separate our container from the other containers or device edges
		borderRadius: 20, //? Rounds the edges of the list Item box
		borderColor: COLORS.secondary, //? Border color for the list items
		borderWidth: 3, //? How thick the list item border is
	},
	//? Text inside a todo item
	listItemText: {
		fontSize: 15, //? Not that big
		fontWeight: 'bold', //? Strong
		color: COLORS.secondary, //? Contrasting purple
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
	actionBox: {
		height: 28, //? Determines how much height this will have
		width: 25, //? Determines how much width this will have
		backgroundColor: COLORS.danger, //? Defines the icon delete box to have a red background. The edit icon overrides this with grey
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
		elevation: 50, //? Gives the impression of depth to this input text box
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
		elevation: 50, //? Gives the impression of depth/distance from the background
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
		backgroundColor: COLORS.white,
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
	//? Basic button definition for the modal box
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
});
