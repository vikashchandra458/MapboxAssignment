import React from "react";
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import Animated from "react-native-reanimated";

export default function Lesson9ListScreen({
    navigation,
}) {

    return (

        <View style={styles.container}>

            <Pressable
                onPress={() => { }}
            >

                <Animated.Image

                    sharedTransitionTag="profile-image"

                    source={{
                        uri: "https://picsum.photos/300",
                    }}

                    style={styles.image}

                />

            </Pressable>

            <Text style={styles.name}>
                Alex Johnson
            </Text>

        </View>

    );

}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    image: {
        width: 140,
        height: 140,
        borderRadius: 70,
    },

    name: {
        marginTop: 20,
        fontSize: 22,
        fontWeight: "700",
    }

});