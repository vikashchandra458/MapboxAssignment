import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import CompassHeading from 'react-native-compass-heading';

const CompassComponent = () => {
    const [currentDirection, setCurrentDirection] = useState("Unknown");
    const [currentFace, setCurrentFace] = useState("Unknown");
    const [currentDegree, setCurrentDegree] = useState(null); // Store the degree
    const [isTracking, setIsTracking] = useState(false);

    // Function to start or stop tracking the compass
    const toggleTracking = async () => {
        if (!isTracking) {
            setIsTracking(true);
            await continuousCompassHeading();  // Start compass tracking
        } else {
            setIsTracking(false);
            CompassHeading.stop();  // Stop compass tracking when not needed
        }
    };

    // Function to watch compass heading continuously
    const continuousCompassHeading = async () => {
        const degreeUpdateRate = 3;
        const directionRanges = [
            { range: [330, 360], direction: 'North' }, // 330° to 360° - North
            { range: [0, 1], direction: 'North' }, // 0° to 1° - North
            { range: [1, 89], direction: 'North East' }, // 1° to 89° - North East
            { range: [90, 179], direction: 'South East' }, // 90° to 179° - South East
            { range: [180, 269], direction: 'South West' }, // 180° to 269° - South West
            { range: [270, 359], direction: 'North West' }, // 270° to 359° - North West
        ];

        // Start compass heading updates
        await CompassHeading.start(degreeUpdateRate, ({ heading }) => {
            console.log(`Raw Heading: ${heading}`);

            // Normalize heading to clockwise
            let normalizedHeading = 360 - heading;

            // Update the degree state
            setCurrentDegree(normalizedHeading);

            // Find the corresponding direction from directionRanges
            const direction = directionRanges.find(range => {
                return (
                    (normalizedHeading >= range.range[0] && normalizedHeading < range.range[1])
                    || (range.range[0] > range.range[1] && (
                        normalizedHeading >= range.range[0] || normalizedHeading < range.range[1])
                    )
                );
            });

            // Set the direction state
            setCurrentDirection(direction ? direction.direction : "Unknown");
        });
    };

    // Function to manually check the current compass heading and direction
    const watchCompassHeading = async () => {
        const degreeUpdateRate = 3;
        const directionRanges = [
            { range: [330, 360], direction: 'North' },
            { range: [0, 1], direction: 'North' },
            { range: [1, 89], direction: 'North East' },
            { range: [90, 179], direction: 'South East' },
            { range: [180, 269], direction: 'South West' },
            { range: [270, 329], direction: 'North West' },
        ];

        return new Promise((resolve, reject) => {
            // Start compass tracking
            CompassHeading.start(degreeUpdateRate, ({ heading }) => {
                console.log(`Current Heading: ${heading}`);

                // Normalize heading to clockwise
                let normalizedHeading = 360 - heading;
                setCurrentFace(normalizedHeading);

                // Find the corresponding direction from directionRanges
                const direction = directionRanges.find(range => {
                    return (
                        (normalizedHeading >= range.range[0] && normalizedHeading < range.range[1]) ||
                        (range.range[0] > range.range[1] && (
                            normalizedHeading >= range.range[0] || normalizedHeading < range.range[1])
                        )
                    );
                });

                // Set the direction to state
                setCurrentFace(direction ? direction.direction : "Unknown");

                // If direction is valid, resolve the promise and return the direction
                if (direction && direction.direction !== "Unknown") {
                    // CompassHeading.stop(); // Stop the compass tracking
                    resolve(direction.direction); // Resolve with the direction
                }
            });

            // Stop tracking after 2 seconds if no direction found
            setTimeout(() => {
                // CompassHeading.stop();
                resolve("Unknown"); // Resolve with "Unknown" if no valid direction
            }, 2000);
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Compass Direction:</Text>
            <Text style={styles.direction}>{currentDirection}</Text>
            <Text style={styles.degree}>Degree: {currentDegree !== null ? currentDegree.toFixed(2) : "Unknown"}</Text>
            <Button
                title={isTracking ? "Stop Tracking" : "Start Tracking"}
                onPress={toggleTracking}
            />
            <View style={{ position: 'absolute', top: 50 }}>
                <Text style={styles.heading}>Current Face:</Text>
                <Text style={styles.direction}>{currentFace}</Text>
                <Button
                    title={"Check Current Face"}
                    onPress={watchCompassHeading}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    heading: {
        fontSize: 20,
        fontWeight: 'bold',
        color: "#757575"
    },
    direction: {
        fontSize: 36,
        fontWeight: 'bold',
        marginVertical: 10,
        color: "#757575"
    },
    degree: {
        fontSize: 18,
        color: "#757575"
    },
});

export default CompassComponent;
