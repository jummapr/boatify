import { atom } from "jotai";
import { WidgetScreen } from "../types";

// Basics widget state atoms
export const screenAtom = atom<WidgetScreen>("auth");