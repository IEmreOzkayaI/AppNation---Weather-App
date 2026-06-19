import React from 'react';
import Svg, { Circle, Line, Path } from 'react-native-svg';

interface TabIconProps {
  name: string;
  color: string;
  size: number;
}

export default function TabIcon({ name, color, size }: TabIconProps) {
  const sw = 1.5;

  switch (name) {
    case 'compass':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={sw} />
          <Path
            d="M14.5 9.5l-1.5 4.5-4.5 1.5 1.5-4.5z"
            fill={color}
            opacity={0.9}
          />
        </Svg>
      );

    case 'map-pin':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2.5C8.41 2.5 5.5 5.41 5.5 9c0 4.77 6.5 12.5 6.5 12.5s6.5-7.73 6.5-12.5c0-3.59-2.91-6.5-6.5-6.5z"
            stroke={color}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
          <Circle cx={12} cy={9} r={2} stroke={color} strokeWidth={sw} />
        </Svg>
      );

    case 'plus':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Line x1={12} y1={6} x2={12} y2={18} stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Line x1={6} y1={12} x2={18} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      );

    case 'bookmark':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M6.5 4.25a.75.75 0 01.75-.75h9.5a.75.75 0 01.75.75V20.5l-5.5-3.5-5.5 3.5V4.25z"
            stroke={color}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'user':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={8} r={3.5} stroke={color} strokeWidth={sw} />
          <Path
            d="M5.5 20.5c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
          />
        </Svg>
      );

    default:
      return null;
  }
}
