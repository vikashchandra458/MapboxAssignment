import React from "react";
import {
    StyleSheet,
    View,
} from "react-native";

import Loader from "./Loader";
import ChangingShapeLoader from "./ChangingShapeLoader";
import AnimatedBorderBox from "./AnimatedBorderBox";

export default function LoaderAnimation() {

    return (
        <View style={styles.container}>
            {/* <Loader />
            <ChangingShapeLoader /> */}

            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <AnimatedBorderBox
                    width={300}
                    height={200}
                    borderWidth={4}
                    borderRadius={24}
                    segmentLength={100}
                    duration={2200}
                    borderColor="#D8DCE1"
                    glowColor="#0099FF"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});