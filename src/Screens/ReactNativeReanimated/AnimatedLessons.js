import React, { useCallback, useRef, useState } from "react";
import {
    FlatList,
    SafeAreaView,
    ScrollView,
    Text,
    View,
    Pressable,
} from "react-native";

import { lessons } from "./AnimatedLessonsArray";
import { styles } from "./AnimatedStyles";

export default function AnimatedLessons() {
    const flatListRef = useRef(null);

    const [selectedLesson, setSelectedLesson] = useState(null);

    const onSelect = useCallback((item, index) => {
        setSelectedLesson(item);

        flatListRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5,
        });
    }, []);

    const renderItem = useCallback(
        ({ item, index }) => {
            const isSelected =
                selectedLesson?.id === item.id;

            return (
                <Pressable
                    onPress={() =>
                        onSelect(item, index)
                    }
                    style={[
                        styles.lessonButton,
                        isSelected &&
                        styles.lessonButtonSelected,
                    ]}
                >
                    <Text style={styles.icon}>
                        {item.icon}
                    </Text>

                    <Text
                        numberOfLines={2}
                        style={[
                            styles.lessonText,
                            isSelected &&
                            styles.lessonTextSelected,
                        ]}
                    >
                        {item.lesson}
                    </Text>
                </Pressable>
            );
        },
        [selectedLesson, onSelect]
    );

    const SelectedComponent =
        selectedLesson?.component;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 40,
                }}
            >
                {/* Header */}

                <View style={styles.header}>
                    <Text style={styles.title}>
                        React Native Reanimated
                        Course
                    </Text>

                    <Text style={styles.subtitle}>
                        {selectedLesson
                            ? `Lesson ${selectedLesson.id} / ${lessons.length}`
                            : "Choose a lesson to begin"}
                    </Text>
                </View>

                {/* Lesson List */}

                <FlatList
                    ref={flatListRef}
                    horizontal
                    data={lessons}
                    renderItem={renderItem}
                    keyExtractor={(item) =>
                        item.id.toString()
                    }
                    showsHorizontalScrollIndicator={
                        false
                    }
                    contentContainerStyle={
                        styles.list
                    }
                    initialNumToRender={5}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                    removeClippedSubviews
                    getItemLayout={(data, index) => ({
                        length: 122,
                        offset: 122 * index,
                        index,
                    })}
                />

                {/* Welcome */}

                {!selectedLesson ? (
                    <View style={styles.card}>
                        <Text style={styles.bigIcon}>
                            🎬
                        </Text>

                        <Text
                            style={styles.lessonTitle}
                        >
                            Welcome
                        </Text>

                        <Text
                            style={styles.description}
                        >
                            Welcome to the React Native
                            Reanimated course.

                            {"\n\n"}

                            Select any lesson above to
                            start learning animations.
                        </Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.lessonHeader}>
                            <View style={styles.lessonInfo}>
                                <Text style={styles.selectedIcon}>
                                    {selectedLesson.icon}
                                </Text>

                                <View style={{ flex: 1 }}>
                                    <Text style={styles.selectedTitle}>
                                        {selectedLesson.lesson}
                                    </Text>

                                    <Text style={styles.selectedMeta}>
                                        {selectedLesson.difficulty} • ⏱ {selectedLesson.time}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.lessonContainer}>
                            {SelectedComponent && <SelectedComponent />}
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}