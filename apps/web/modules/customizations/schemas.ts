import { z } from "zod";

export const widgetSettingsSchema = z.object({
  greetMessage: z
    .string()
    .min(2, "Greeting message must be at least 2 characters long"),
  defaultSuggestions: z.object({
    suggestion1: z.string().optional(),
    suggestion2: z.string().optional(),
    suggestion3: z.string().optional(),
  }),
  vapiSettings: z.object({
    assistantId: z.string().optional(),
    phoneNumber: z.string().optional(),
  }),
});
