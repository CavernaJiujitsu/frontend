import { z } from "zod";

import { beltMocks } from "@/api/mocks/belts";

export const beltInfoSchema = z.object({
  belt: z
    .string()
    .min(1, "Selecione uma faixa para continuar.")
    .refine((value) => beltMocks.some((belt) => belt.id === value), {
      message: "Selecione uma faixa válida para continuar.",
    }),
});
