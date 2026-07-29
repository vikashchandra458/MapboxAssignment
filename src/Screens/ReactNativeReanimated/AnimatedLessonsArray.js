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