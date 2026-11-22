import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const IS_SMALL = width < 768;
export const IS_BIG_SCREEN = width >= 768;
