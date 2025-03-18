import * as z from "zod";

export const OrderValidation = z.object({
    name: z.string().min(1, { message: "Name is required." }),
    surname: z.string().min(1, { message: "Surname is required." }),
    phoneNumber: z.string().min(1, { message: "Phone number is required." }),
    email: z.string().min(1, { message: "Email is required." }),
    paymentType: z.string().min(1, { message: "Payment type is required." }),
    deliveryMethod: z.string().min(1, { message: "Delivery method is required." }),
    city: z.string().min(1, { message: "City is required." }),
    adress: z.string().min(1, { message: "Adress is required." }),
    postalCode: z.string().min(1, { message: "Postal code is required." }),
    comment: z.string().optional(),
})