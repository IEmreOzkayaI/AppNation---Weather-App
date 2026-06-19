import React from "react";
import Svg, {
  Circle,
  Ellipse,
  G,
  Line,
  Path,
  Rect,
} from "react-native-svg";

interface LokalMascotProps {
  size?: number;
}

const LokalMascot: React.FC<LokalMascotProps> = ({ size = 80 }) => {
  // All coordinates are designed on a 100x140 viewBox.
  // The candy head is centered at (50, 45) with radius 38.
  // The stick runs from y=83 down to y=135.

  return (
    <Svg width={size} height={size * 1.4} viewBox="0 0 100 140">
      {/* ===== Stick ===== */}
      <Rect
        x={46}
        y={80}
        width={8}
        height={55}
        rx={4}
        ry={4}
        fill="#C4956A"
      />
      {/* Stick shadow / darker edge */}
      <Rect
        x={50}
        y={80}
        width={4}
        height={55}
        rx={2}
        ry={2}
        fill="#B07D52"
        opacity={0.45}
      />

      {/* ===== Candy head shadow (offset behind) ===== */}
      <Circle cx={51} cy={46} r={38} fill="#3A7BC8" />

      {/* ===== Candy head main ===== */}
      <Circle cx={50} cy={44} r={38} fill="#4A90D9" />

      {/* ===== Candy swirl / highlight arc ===== */}
      {/* A subtle lighter arc across the upper candy to give depth */}
      <Path
        d="M 25 30 Q 35 15, 55 18 Q 75 21, 78 38"
        stroke="#6BB0F0"
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
        opacity={0.5}
      />
      <Path
        d="M 22 42 Q 28 28, 45 24"
        stroke="#6BB0F0"
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
        opacity={0.35}
      />

      {/* ===== Sparkle / shine on candy ===== */}
      {/* Main shine dot */}
      <Circle cx={33} cy={28} r={4} fill="#FFFFFF" opacity={0.75} />
      {/* Secondary smaller shine */}
      <Circle cx={27} cy={35} r={2} fill="#FFFFFF" opacity={0.55} />

      {/* ===== Face group ===== */}
      <G>
        {/* Left eye */}
        <Circle cx={39} cy={42} r={3.5} fill="#2C3E50" />
        {/* Left eye shine */}
        <Circle cx={37.5} cy={40.5} r={1.2} fill="#FFFFFF" />

        {/* Right eye */}
        <Circle cx={61} cy={42} r={3.5} fill="#2C3E50" />
        {/* Right eye shine */}
        <Circle cx={59.5} cy={40.5} r={1.2} fill="#FFFFFF" />

        {/* Smile */}
        <Path
          d="M 42 54 Q 50 62, 58 54"
          stroke="#2C3E50"
          strokeWidth={2.5}
          strokeLinecap="round"
          fill="none"
        />

        {/* Rosy left cheek */}
        <Ellipse
          cx={30}
          cy={52}
          rx={5.5}
          ry={3.5}
          fill="#FF8FAB"
          opacity={0.5}
        />

        {/* Rosy right cheek */}
        <Ellipse
          cx={70}
          cy={52}
          rx={5.5}
          ry={3.5}
          fill="#FF8FAB"
          opacity={0.5}
        />
      </G>

      {/* ===== Extra sparkle stars ===== */}
      {/* Small four-point star top-right */}
      <G opacity={0.6}>
        <Line
          x1={76}
          y1={14}
          x2={76}
          y2={22}
          stroke="#FFFFFF"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Line
          x1={72}
          y1={18}
          x2={80}
          y2={18}
          stroke="#FFFFFF"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </G>
      {/* Tiny star top-left */}
      <G opacity={0.4}>
        <Line
          x1={18}
          y1={16}
          x2={18}
          y2={21}
          stroke="#FFFFFF"
          strokeWidth={1}
          strokeLinecap="round"
        />
        <Line
          x1={15.5}
          y1={18.5}
          x2={20.5}
          y2={18.5}
          stroke="#FFFFFF"
          strokeWidth={1}
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
};

export default LokalMascot;
