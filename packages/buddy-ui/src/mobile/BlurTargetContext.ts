import {createContext, useContext, type RefObject} from 'react';
import type {View} from 'react-native';

export type BlurTargetRef = RefObject<View | null>;

const BlurTargetContext = createContext<BlurTargetRef | null>(null);

export const BlurTargetProvider = BlurTargetContext.Provider;
export const useBlurTarget = () => useContext(BlurTargetContext);
