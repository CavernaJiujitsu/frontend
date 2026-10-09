import Svg, { Path } from "react-native-svg";

import { BrandColors } from "@/constants/theme";

export function PinIcon({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path
        d="M50 12 C33 12 20 26 20 43 C20 66 50 92 50 92 C50 92 80 66 80 43 C80 26 67 12 50 12 Z"
        fill="none"
        stroke={BrandColors.secondary}
        strokeWidth={7}
        strokeLinejoin="round"
      />
      <Path
        d="M38 46 C38 36 43 31 50 31 C57 31 62 36 62 46 L62 51 L38 51 Z"
        fill={BrandColors.secondary}
      />
    </Svg>
  );
}
