import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

interface TabIconProps {
  name: string;
  color: string;
  size: number;
}

export default function TabIcon({ name, color, size }: TabIconProps) {
  const strokeWidth = 1.8;

  switch (name) {
    case 'compass':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle
            cx={12}
            cy={12}
            r={10}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Path
            d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'map-pin':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Circle cx={12} cy={9} r={2.5} stroke={color} strokeWidth={strokeWidth} />
        </Svg>
      );

    case 'plus-circle':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle
            cx={12}
            cy={12}
            r={10}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Line
            x1={12}
            y1={8}
            x2={12}
            y2={16}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <Line
            x1={8}
            y1={12}
            x2={16}
            y2={12}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'bookmark':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M6 4a1 1 0 011-1h10a1 1 0 011 1v17l-6-4-6 4V4z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'user':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={strokeWidth} />
          <Path
            d="M4 21v-1a6 6 0 0112 0v1"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </Svg>
      );

    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect
            x={4}
            y={4}
            width={16}
            height={16}
            stroke={color}
            strokeWidth={strokeWidth}
          />
        </Svg>
      );
  }
}
