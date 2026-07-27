import React, { useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    Pressable,
    StatusBar,
} from 'react-native';

// import DraggableFlatList, {
//     ScaleDecorator,
// } from 'react-native-draggable-flatlist';

const INITIAL_DATA = [
    {
        id: '1',
        title: 'Field Survey',
        subtitle: 'Survey Farm A',
        color: '#22C55E',
    },
    {
        id: '2',
        title: 'Crop Inspection',
        subtitle: 'Cotton',
        color: '#3B82F6',
    },
    {
        id: '3',
        title: 'Harvest',
        subtitle: 'North Farm',
        color: '#F97316',
    },
    {
        id: '4',
        title: 'Irrigation',
        subtitle: 'Zone 4',
        color: '#A855F7',
    },
    {
        id: '5',
        title: 'Fertilizer',
        subtitle: 'NPK',
        color: '#EF4444',
    },
];

export default function DraggableCard() {
    const [data, setData] = useState(INITIAL_DATA);

    // const renderItem = ({ item, drag, isActive, getIndex }) => (
    //     <ScaleDecorator>
    //         <Pressable
    //             onLongPress={drag}
    //             delayLongPress={150}
    //             disabled={isActive}
    //             style={[
    //                 styles.card,
    //                 isActive && styles.activeCard,
    //             ]}>
    //             <View
    //                 style={[
    //                     styles.colorBar,
    //                     { backgroundColor: item.color },
    //                 ]}
    //             />

    //             <View style={styles.content}>
    //                 <Text style={styles.title}>{item.title}</Text>
    //                 <Text style={styles.subtitle}>{item.subtitle}</Text>
    //             </View>

    //             <View style={styles.right}>
    //                 <Text style={styles.index}>
    //                     #{(getIndex?.() ?? 0) + 1}
    //                 </Text>

    //                 <Text style={styles.dragIcon}>☰</Text>
    //             </View>
    //         </Pressable>
    //     </ScaleDecorator>
    // );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="#08111F"
            />

            <Text style={styles.header}>
                Reorderable List
            </Text>

            <Text style={styles.description}>
                Long press any card to reorder.
            </Text>

            {/* <DraggableFlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                activationDistance={10}
                onDragEnd={({ data }) => {
                    setData(data);
                    // console.log(data);
                }}
                contentContainerStyle={{
                    paddingBottom: 20,
                }}
            /> */}

            <Pressable
                style={styles.button}
                onPress={() => setData(INITIAL_DATA)}>
                <Text style={styles.buttonText}>
                    Reset
                </Text>
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#08111F',
        paddingHorizontal: 16,
        paddingTop: 10,
    },

    header: {
        color: '#FFF',
        fontSize: 28,
        fontWeight: 'bold',
    },

    description: {
        color: '#94A3B8',
        marginTop: 6,
        marginBottom: 20,
    },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#172033',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        elevation: 4,
    },

    activeCard: {
        opacity: 0.9,
    },

    colorBar: {
        width: 8,
        height: 60,
        borderRadius: 10,
        marginRight: 15,
    },

    content: {
        flex: 1,
    },

    title: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },

    subtitle: {
        color: '#AAB4C5',
        marginTop: 4,
    },

    right: {
        alignItems: 'center',
    },

    index: {
        color: '#FFF',
        marginBottom: 6,
        fontWeight: '700',
    },

    dragIcon: {
        fontSize: 24,
        color: '#94A3B8',
    },

    button: {
        backgroundColor: '#2563EB',
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        marginVertical: 15,
    },

    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});