import Lesson1FadingBox from "./Lesson1FadingBox";
import Lesson2ScaleCard from "./Lesson2ScaleCard";
import Lesson3DraggableCircle from "./Lesson3DraggableCircle";
import Lesson4SnapCard from "./Lesson4SnapCard";
import Lesson5SwipeDelete from "./Lesson5SwipeDelete";
import Lesson6BottomSheet from "./Lesson6BottomSheet";
import Lesson7TinderCard from "./Lesson7TinderCard";
import Lesson8FabMenu from "./Lesson8FabMenu";
import Lesson9ListScreen from "./Lesson9ListScreen";
import Lesson10CombinedGestures from "./Lesson10CombinedGestures";

import { Easing } from "react-native-reanimated";

export const lessons = [
    {
        id: 1,
        lesson: "Fading Box",
        icon: "🎭",
        difficulty: "Easy",
        time: "5 min",
        component: Lesson1FadingBox,
    },
    {
        id: 2,
        lesson: "Scale Card",
        icon: "📦",
        difficulty: "Easy",
        time: "5 min",
        component: Lesson2ScaleCard,
    },
    {
        id: 3,
        lesson: "Draggable Circle",
        icon: "⚪",
        difficulty: "Easy",
        time: "10 min",
        component: Lesson3DraggableCircle,
    },
    {
        id: 4,
        lesson: "Snap Card",
        icon: "🧲",
        difficulty: "Medium",
        time: "10 min",
        component: Lesson4SnapCard,
    },
    {
        id: 5,
        lesson: "Swipe Delete",
        icon: "🗑️",
        difficulty: "Medium",
        time: "15 min",
        component: Lesson5SwipeDelete,
    },
    {
        id: 6,
        lesson: "Bottom Sheet",
        icon: "⬆️",
        difficulty: "Medium",
        time: "20 min",
        component: Lesson6BottomSheet,
    },
    {
        id: 7,
        lesson: "Tinder Card",
        icon: "❤️",
        difficulty: "Hard",
        time: "20 min",
        component: Lesson7TinderCard,
    },
    {
        id: 8,
        lesson: "FAB Menu",
        icon: "➕",
        difficulty: "Hard",
        time: "20 min",
        component: Lesson8FabMenu,
    },
    {
        id: 9,
        lesson: "Shared Transition",
        icon: "🔄",
        difficulty: "Hard",
        time: "25 min",
        component: Lesson9ListScreen,
    },
    {
        id: 10,
        lesson: "Pan + Pinch + Rotate",
        icon: "🤏",
        difficulty: "Expert",
        time: "30 min",
        component: Lesson10CombinedGestures,
    },
];

export const animations = [
    { title: "Linear", easing: Easing.linear },
    { title: "Ease", easing: Easing.ease },
    { title: "Quad", easing: Easing.quad },
    { title: "Cubic", easing: Easing.cubic },
    { title: "Sin", easing: Easing.sin },
    { title: "Exp", easing: Easing.exp },
    { title: "Circle", easing: Easing.circle },
    { title: "Back", easing: Easing.back(1.5) },
    { title: "Bounce", easing: Easing.bounce },
    { title: "Elastic", easing: Easing.elastic(1) },

    { title: "In Ease", easing: Easing.in(Easing.ease) },
    { title: "Out Ease", easing: Easing.out(Easing.ease) },
    { title: "InOut Ease", easing: Easing.inOut(Easing.ease) },

    { title: "In Quad", easing: Easing.in(Easing.quad) },
    { title: "Out Quad", easing: Easing.out(Easing.quad) },
    { title: "InOut Quad", easing: Easing.inOut(Easing.quad) },

    { title: "In Cubic", easing: Easing.in(Easing.cubic) },
    { title: "Out Cubic", easing: Easing.out(Easing.cubic) },
    { title: "InOut Cubic", easing: Easing.inOut(Easing.cubic) },

    { title: "In Sin", easing: Easing.in(Easing.sin) },
    { title: "Out Sin", easing: Easing.out(Easing.sin) },
    { title: "InOut Sin", easing: Easing.inOut(Easing.sin) },

    { title: "In Exp", easing: Easing.in(Easing.exp) },
    { title: "Out Exp", easing: Easing.out(Easing.exp) },
    { title: "InOut Exp", easing: Easing.inOut(Easing.exp) },

    { title: "In Circle", easing: Easing.in(Easing.circle) },
    { title: "Out Circle", easing: Easing.out(Easing.circle) },
    { title: "InOut Circle", easing: Easing.inOut(Easing.circle) },

    { title: "In Back", easing: Easing.in(Easing.back(1.5)) },
    { title: "Out Back", easing: Easing.out(Easing.back(1.5)) },
    { title: "InOut Back", easing: Easing.inOut(Easing.back(1.5)) },

    { title: "In Bounce", easing: Easing.in(Easing.bounce) },
    { title: "Out Bounce", easing: Easing.out(Easing.bounce) },
    { title: "InOut Bounce", easing: Easing.inOut(Easing.bounce) },

    { title: "In Elastic", easing: Easing.in(Easing.elastic(1)) },
    { title: "Out Elastic", easing: Easing.out(Easing.elastic(1)) },
    { title: "InOut Elastic", easing: Easing.inOut(Easing.elastic(1)) },
];

export const animationProperties = [
    "TranslateX",
    "TranslateY",
    "Scale",
    "Rotate",
    "Width",
    "Height",
    "BorderRadius",
    "Opacity",
];