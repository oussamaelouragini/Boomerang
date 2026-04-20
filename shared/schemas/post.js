import { z } from "zod";
import { CATEGORIES, POST_TYPES, CONTACT_PREFERENCES } from "../constants/categories.js";
import { BUILDINGS } from "../constants/locations.js";

export const postSchema = z.object({
  type: z.enum(POST_TYPES),
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  category: z.enum(CATEGORIES),
  location: z.object({
    building: z.enum(BUILDINGS),
    area: z.string().min(1, "Area is required"),
  }),
  dateLostFound: z.string().or(z.date()),
  contactPreference: z.enum(CONTACT_PREFERENCES),
});
