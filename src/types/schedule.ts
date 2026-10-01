export type ClassTagVariant = "default" | "highlight";

export type ClassTag = {
  label: string;
  variant?: ClassTagVariant;
};

export type ClassItem = {
  id: string;
  /** ISO yyyy-mm-dd do dia da aula. */
  dateId: string;
  startTime: string;
  endTime: string;
  professor: string;
  enrolled: number;
  capacity: number;
  tags: ClassTag[];
  /** Aluno já inscrito nesta aula. */
  isEnrolled?: boolean;
};

export type ScheduleDay = {
  /** ISO yyyy-mm-dd. */
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
