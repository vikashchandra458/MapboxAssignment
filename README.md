# MapboxAssignment

This React Native app allows users to draw polygons on a Mapbox map, save them, and display clustered markers representing the polygons' first points. The app utilizes Mapbox's mapping services to display the map and handle polygon drawing while also clustering the markers for improved performance and user experience.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Building the APK](#building-the-apk)
- [Project Structure](#project-structure)
- [Dependencies](#dependencies)
- [License](#license)

## Features

- **Polygon Drawing**: Draw polygons on the map by tapping on the screen.
- **Polygon Saving**: Save polygons, which persist across sessions.
- **Marker Clustering**: Display markers for the polygons' first points, clustered to improve performance.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js**: Version 16.x or later
- **React Native CLI**: Version 13.6.6
- **React Native**: Version 0.74.2
- **Java Development Kit (JDK)**: Version 17
- **Android Studio**: For Android development
- **Gradle**: Version 8.5

Make sure to configure your environment for React Native and Android development by following the official React Native [environment setup guide](https://reactnative.dev/docs/environment-setup).



## Installation
1. Clone the repository:

   `git clone https://github.com/vikashchandra458/MapboxAssignment.git`
   `cd MapboxAssignment`
   `npm install`

## Install the dependencies:

`npm install`



##  Running the App
To run the app on an Android device or emulator, use the following command:

`npx react-native run-android`
Ensure your Android device is connected or the emulator is running before executing the command.



## Building the APK
To build the APK for release, follow these steps:

1. **Navigate to the Android directory**:
`cd android`

2. **Build the APK**:
`./gradlew assembleRelease`

3. **Once the build is complete**, you can find the APK in the `android/app/build/outputs/apk/release` directory.



##  Project Structure
Here’s a high-level overview of the project structure:

MapboxAssignment/
├── android/                 # Android native code
├── ios/                     # iOS native code (if applicable)
├── src/                     # Main source code
│   ├── components/          # Reusable components
│   ├── screens/             # App screens
├── App.js                   # Entry point and the Main file of the application
└── package.json             # Project metadata and dependencies




## Dependencies

The following key dependencies are used in this project:

1. **@react-native-async-storage/async-storage**: ^2.0.0 - For persisting polygon data across app sessions.
2. **@rnmapbox/maps**: ^10.1.31 - For rendering the Mapbox map and handling polygon drawing.
3. **@turf/turf**: ^7.1.0 - For geospatial analysis and manipulation of polygon data.
4. **lottie-react-native**: ^7.0.0 - For adding animations using Lottie files.
5. **react-native-dotenv**: ^3.4.11 - For managing environment variables in React Native.

Make sure to check the `package.json` file for a complete list of dependencies.




## License
This project is licensed under the MIT License. See the LICENSE file for details.


### Changes and Enhancements:
1. **Format Consistency**: Ensured consistent formatting, especially in code blocks.
2. **Clarity in Installation Steps**: Added an explanation for each command for better clarity.
3. **Project Structure Section**: Included a placeholder structure for better organization.
4. **Dependencies Section**: Added a list of key dependencies and their purposes.
5. **Markdown Improvements**: Cleaned up spacing and indentation for better readability.
