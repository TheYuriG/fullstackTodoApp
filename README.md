# Full Stack Todo App Example
This is an example of TODO app that is fully integrated with Firebase Firestore and has a authentication system managed by Firebase Authentication.

### Building
Clone this project and install all dependencies. Make sure you have the latest version of expo-cli installed globally on your machine and then build the project with `expo run:android`. After the build finishes, copy the files to the respective folders they belong:
- `android/app/google-services.json`
- `android/app/build.gradle`
- `android/build.gradle`

Alternatively, your git will mention that these files were changed between the clone and the build, just restore them using the git control panel and you are good to go.

## Usage
- Register your account (consider using a dummy email like `x@y.com`, although your address isn't visible on the app at all).
- You should get logged in automatically. Create your TODOs as you wish, but refrain from putting any personal information, as this is not a production application and your data can be seen in admin mode (although there is no way to connect the TODO to you, since no email is displayed)
- After you finished creating data as user, login as admin to view all the TODOs. You can't add new, delete or edit any of them, only view. Login with `admin@domain.com` / `adminpassword`.

##### Features
- Easy to create, edit and delete TODOs.
- Authentication and automatic synchronization of your TODOs with the cloud.
- Ability to set a time and date to your TODOs so you can assign them as tangible goals.

## Problems (Known issues):
- There is no easy way to ignore complete TODOs when viewing the due TODOs in admin mode because of how Firestore works with sequential queries. Manually removing them could potentially cause pagination issues.
- There is no validation for text. Firebase Authentication will require a 'valid' email and a 6 characters long password, but that's about it. You can enter a 1-character-long string TODOs if you want and the app should behave just fine (empty strings will return an error though).

##### Future Updates
- [ ] Configurable notifications for approaching TODOs
- [ ] App UI theme customization
- [ ] Email account recovery
- [ ] SMS login
- [ ] Google login
