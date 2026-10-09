export type InicioBelt = {
  name: string;
  color: string;
  completedCheckpoints: number;
  totalCheckpoints: number;
};

export type InicioNextClass = {
  weekday: string;
  time: string;
  tag: string;
  teacherName: string;
};

export type InicioNearbyAvatar = {
  id: string;
  color?: string;
  imageUrl?: string;
};

export type InicioNearby = {
  count: number;
  radiusKm: number;
  avatars: InicioNearbyAvatar[];
  extraCount: number;
  closest: {
    name: string;
    neighborhood: string;
    distanceKm: number;
    isOpen: boolean;
  };
};

export type InicioData = {
  userName: string;
  belt: InicioBelt;
  nextClass: InicioNextClass | null;
  nearby: InicioNearby | null;
};
