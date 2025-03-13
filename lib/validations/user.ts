import * as z from "zod";

export const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    surname: z.string().optional(),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().optional(),
})