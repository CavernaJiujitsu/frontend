import { useLocalSearchParams } from "expo-router";

import { ScheduleScreen } from "@/components/schedule/schedule-screen";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function PrivateCaveScheduleRoute() {
  const params = useLocalSearchParams<{ cavernaId?: string | string[]; cavernaTitle?: string | string[] }>();
  return <ScheduleScreen mode="private" cavernaId={firstParam(params.cavernaId)} cavernaTitle={firstParam(params.cavernaTitle)} />;
}
