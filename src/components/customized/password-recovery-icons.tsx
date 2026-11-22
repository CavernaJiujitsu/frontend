import Svg, { Circle, Path, Rect } from "react-native-svg";

import { BrandColors } from "@/constants/theme";

export function RecoveryLockIcon() {
  return (
    <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
      <Circle cx={32} cy={32} r={29} stroke={BrandColors.secondary} strokeWidth={2} />
      <Path
        d="M25 28v-5a7 7 0 0 1 14 0v5"
        stroke={BrandColors.secondary}
        strokeWidth={2.3}
        strokeLinecap="round"
      />
      <Rect x={20} y={28} width={24} height={24} rx={5} stroke={BrandColors.secondary} strokeWidth={2.3} />
      <Circle cx={32} cy={39} r={1.7} fill={BrandColors.secondary} />
      <Path d="M32 40v4" stroke={BrandColors.secondary} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function RecoveryCheckIcon() {
  return (
    <Svg width={112} height={112} viewBox="0 0 112 112" fill="none">
      <Circle cx={56} cy={56} r={48} fill={BrandColors.success} opacity={0.16} />
      <Circle cx={56} cy={56} r={32} fill={BrandColors.success} />
      <Path
        d="m42 56 10 10 20-22"
        stroke={BrandColors.background}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
