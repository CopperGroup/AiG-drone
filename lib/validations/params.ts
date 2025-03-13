import * as z from "zod";

export const ParamsValidation = z.object({
    Model: z.string().min(1, { message: "Model requires a name." }),
    Width: z.string().min(1, { message: "Width is required." }),
    Height: z.string().min(1, { message: "Height is required." }),
    Depth: z.string().min(1, { message: "Depth is required." }),
    Type: z.string().min(1, { message: "Type is required." }),
    Color: z.string().min(1, { message: "Color is required." }),
    customParams: z.array(z.object({
        name: z.string().min(1, { message: "Custom parameter name is required." }),
        value: z.string().min(1, { message: "Custom parameter value is required." })
    }))
})