export type ClassTagVariant = "default" | "highlight";

export type ClassTag = {
  label: string;
  variant?: ClassTagVariant;
};

export type ClassItem = {
  id: string;
  dateId: string;
  startTime: string;
  endTime: string;
  professor: string;
  enrolled: number;
  capacity: number;
  tags: ClassTag[];
  isEnrolled?: boolean;
};

export type ScheduleDay = {
  id: string;
  weekday: string;
  day: string;
  monthIndex: number;
  date: Date;
};

export type ScheduleMonth = {
  index: number;
  label: string;
  year: number;
};
