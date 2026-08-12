import React from "react";
import {
    StyleSheet,
    View,
} from "react-native";

import Loader from "./Loader";
import ChangingShapeLoader from "./ChangingShapeLoader";

export default function LoaderAnimation() {

    return (
        <View style={styles.container}>
            <Loader />
            <ChangingShapeLoader />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});