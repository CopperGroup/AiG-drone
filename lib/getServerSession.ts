import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

export const getSession = async (): Promise<string> => {
    const session = await getServerSession(options)
    //@ts-ignore
    return session?.user?.email
};
