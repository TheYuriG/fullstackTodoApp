# Full Stack Todo App Example
This is an example of TODO app that is fully integrated with a database and has a authentication system managed by Firebase Authentication.

### Usage
Clone this project and install all dependencies. Make sure you have the latest version of expo-cli installed globally on your machine and then build the project with `expo run:android`. After the build finishes, copy the files to the respective folders they belong:
- `android/app/google-services.json`
- `android/app/build.gradle`
- `android/build.gradle`

Alternatively, your git will mention that these files were changed between the clone and the build, just restore them using the git control panel and you are good to go.

##### Features
- Easy to create and delete TODOs.
- [PENDING] Authentication and automatic synchronization of your TODOs with the cloud.
- Ability to set a time and date to your TODOs so you can assign them as tangible goals.

## Problems (Known issues):
- There is no real authentication worflow due to being unable to connect to a database.
- - Couldn't get firebase to work, got consistent "auth/failed to connect" errors.
- - Couldn't get Mongo Realm to work, required downgrading to EXPO v44 since they don't have support to v45 as of now. [[1]](https://www.mongodb.com/docs/realm/sdk/react-native/install/#prerequisites) [[2]](https://github.com/realm/realm-js/issues/4639)
- Slow reads/writes because of Async Storage.

##### Future Updates
- [ ] Configurable notifications for approaching TODOs
- [ ] App UI theme customization
- [ ] Email account recovery
- [ ] SMS login
- [ ] Google login
