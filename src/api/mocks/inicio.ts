import type { InicioData } from "@/types/inicio";

// Mock tipado que espelha as props da tela Início.
// Mantém vocabulário de produto ("caverna") nos textos visíveis.
export const inicioMock: InicioData = {
  userName: "Gabriel",
  belt: {
    name: "Faixa Azul",
    color: "#2E7CF6",
    completedCheckpoints: 3,
    totalCheckpoints: 10,
  },
  nextClass: {
    weekday: "Qua",
    time: "19:00",
    tag: "Trilha Azul",
    teacherName: "Rafael Souza",
  },
  nearby: {
    count: 5,
    radiusKm: 5,
    avatars: [
      { id: "avatar-1", color: "#2E7CF6" },
      { id: "avatar-2", color: "#8A4DFF" },
      { id: "avatar-3", color: "#00E5C9" },
    ],
    extraCount: 2,
    closest: {
      name: "Caverna BJJ - Matriz",
      neighborhood: "Vila Mariana",
      distanceKm: 1.2,
      isOpen: true,
    },
  },
};
