// Fallback for using Ionicons on Android, iOS, and Web.

import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

// Mapping from SF Symbols names to Ionicons names
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'paper-plane',
  'chevron.left.forwardslash.chevron.right': 'code-slash',
  'chevron.right': 'chevron-forward',
  'chart.bar.fill': 'stats-chart',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'bubble.left.and.bubble.right.fill': 'chatbubbles',
} as const;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native Ionicons across all platforms.
 * This ensures a consistent look and cross-platform compatibility.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: string;
}) {
  return <Ionicons color={color} size={size} name={MAPPING[name]} style={style} />;
}

