//? Import necessary dependencies
import { initializeApp } from 'firebase/app';
import {
	getAuth,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
} from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

//? Your web app's Firebase configuration
//? For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: 'AIzaSyDRx69cMb_cLUAqN1WhSV6wBF4_XZ_Onqs',
	authDomain: 'fullstacktodoapp.firebaseapp.com',
	projectId: 'fullstacktodoapp',
	storageBucket: 'fullstacktodoapp.appspot.com',
	messagingSenderId: '792218783071',
	appId: '1:792218783071:web:8e6ad5e57f875168917aea',
	measurementId: 'G-VZGJ99BM9R',
};

//? Initialize Firebase
const app = initializeApp(firebaseConfig);

//? Initialize Authentication
const auth = getAuth();
const newUser = (email, password) =>
	createUserWithEmailAndPassword(auth, email, password)
		.then((userCredential) => {
			// Signed in
			const user = userCredential.user;
			// ...
		})
		.catch((error) => {
			const errorCode = error.code;
			const errorMessage = error.message;
			// ..
		});

const login = (email, password) =>
	signInWithEmailAndPassword(auth, email, password)
		.then((userCredential) => {
			// Signed in
			const user = userCredential.user;
			// ...
		})
		.catch((error) => {
			const errorCode = error.code;
			const errorMessage = error.message;
		});
const logout = () =>
	signOut(auth)
		.then(() => {
			// Sign-out successful.
		})
		.catch((error) => {
			// An error happened.
		});

module.exports = { newUser, login, logout };
