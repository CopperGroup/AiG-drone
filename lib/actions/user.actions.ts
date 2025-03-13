"use server";

import User from "../models/user.model"
import { connectToDB } from "@/lib/mongoose"
import clearCache from "./cache";
import { UserType } from "../types/types";
import { generateLongPassword } from "../utils";
import { redirect } from "next/navigation";
import { hasPermission } from "../roles";
import { getSession } from "../getServerSession";
import mongoose from "mongoose";

type CreateUserParams = {
    username: string, 
    email: string,
    password: string
}

export async function createUser({ username, email, password }: CreateUserParams) {
    try {
        const users = await User.find();

        const newUser = await User.create({
            username,
            email,
            password,
            selfCreated: false,
            role: users.length === 0 ? "Owner" : "User"
        })

        clearCache("createUser")

        return newUser
    } catch (error: any) {
        throw new Error(`Error creating new user: ${error.message}`)
    }
}

export async function createuserByMyself(params: { name: string, email: string, surname?: string, phoneNumber?: string, role: "Admin" | "User", currentUserEmail: string | null }): Promise<UserType>;
export async function createuserByMyself(params: { name: string, email: string, surname?: string, phoneNumber?: string, role: "Admin" | "User", currentUserEmail: string | null }, type: 'json'): Promise<string>;

export async function createuserByMyself(params: { name: string, email: string, surname?: string, phoneNumber?: string, role: "Admin" | "User", currentUserEmail: string | null }, type?: 'json') {

    if(!params.currentUserEmail) {
        redirect('/login')
    }

    const currentUser = await User.findOne({ email: params.currentUserEmail });
    
    const permission = hasPermission("/clients", "create", params.role.toLowerCase() as "admin" | 'user', currentUser.role); 

    if(!permission) {
        return
    }

    try {
        const newUser = await User.create({
            name: params.name,
            email: params.email,
            password: generateLongPassword(),
            surname: params.surname || "",
            phoneNumber: params.phoneNumber || "",
            selfCreated: true,
            role: params.role
        })

        clearCache("createUser")

        if(type === 'json'){
            return JSON.stringify(newUser)
        } else {
            return newUser
        }

    } catch (error: any) {
        throw new Error(`Error adding new user from admin ${error.message}`)
    }
}

export async function editUser(params: { userId: string, name: string, email: string, surname?: string, phoneNumber?: string, role: "Admin" | "User", currentUserEmail: string | null }): Promise<UserType>;
export async function editUser(params: { userId: string, name: string, email: string, surname?: string, phoneNumber?: string, role: "Admin" | "User", currentUserEmail: string | null }, type: 'json'): Promise<string>;

export async function editUser(params: { userId: string, name: string, email: string, surname?: string, phoneNumber?: string, role: "Admin" | "User", currentUserEmail: string | null }, type?: 'json') {

    if(!params.currentUserEmail) {
        redirect('/login')
    }

    const currentUser = await User.findOne({ email: params.currentUserEmail });
    
    const permission = hasPermission("/clients", "create", params.role.toLowerCase() as "admin" | 'user', currentUser.role); 

    if(!permission) {
        return
    }

    try {
        const editedUser = await User.findOneAndUpdate(      
            { _id: params.userId },
            {
              name: params.name,
              email: params.email,
              surname: params.surname || "",
              phoneNumber: params.phoneNumber || "",
              role: params.role,
            },
            { new: true, runValidators: true }
        )

        clearCache("createUser")

        if(type === 'json'){
            return JSON.stringify(editedUser)
        } else {
            return editedUser
        }

    } catch (error: any) {
        throw new Error(`Error adding new user from admin ${error.message}`)
    }
}

export async function populateSelfCreatedUser(params: CreateUserParams): Promise<UserType>;
export async function populateSelfCreatedUser(params: CreateUserParams, type: 'json'): Promise<string>;

export async function populateSelfCreatedUser(params: CreateUserParams, type?: 'json') {
   try {

    const existingUser = await User.findOneAndUpdate(
        { email: params.email },
        { $set: { username: params.username, password: params.password, selfCreated: false } },
        { new: true, runValidators: true }
    ).select("-password");

    clearCache("createUser")
    if(type === 'json'){
      return JSON.stringify(existingUser)
    } else {
      return existingUser
    }
   } catch (error: any) {
     throw new Error(`${error.message}`)
   }
}
type FetchUserByEmailparams = {
   email: string
}

export async function fetchUserByEmail(params: FetchUserByEmailparams): Promise<UserType>;
export async function fetchUserByEmail(params: FetchUserByEmailparams, type: 'json'): Promise<string>;

export async function fetchUserByEmail(params: FetchUserByEmailparams, type?: 'json') {
   try {
        connectToDB()
        const currentUser = await User.findOne({ email: params.email}).select("-password")

    if(type === 'json'){
      return JSON.stringify(currentUser)
    } else {
      return currentUser
    }
   } catch (error: any) {
     throw new Error(`${error.message}`)
   }
}

export async function checkForAdmin(email: string){
    try {
        connectToDB();

        const currentUser = await User.findOne({ email: email });

        if(currentUser.isAdmin){
            return true
        } else return false
    } catch (error: any) {
        throw new Error(`Error determining, whether the user is admin ${error.message}`)
    }
}

export async function fetchUserById(userId: string) {
    try {
        connectToDB()

        const currentUser = User.findById(userId);

        return currentUser;
    } catch (error: any) {
        throw new Error(`Error fetching user by id, ${error.message}`)
    }
}

export async function fetchUsers(type?: "json") {
    try {
        connectToDB();

        const users = await User.find().select("-password");

        const fetchedUsers = [];

        for(const user of users) {
            if(user.role !== 'Owner') {
                fetchedUsers.push({ _id: user._id, email: user.email, name: user.name, username: user.username, orders: user.orders.length, role: user.role})
            }
        }
        
        return fetchedUsers;
    } catch (error: any) {
        throw new Error(`Error fetching users: ${error.message}`)
    }
}

export async function fetchUserRole({ email }: { email: string }) {
  try {
    connectToDB();

    const user = await User.findOne({ email });

    if(!user) {
        return
    }

    return user.role
  } catch (error: any) {
    throw new Error(`${error.message}`)
  }
}

export async function checkIsGitHubConnected(): Promise<{ connectedGit: boolean, connectedVercel: boolean }>{
    try {
        connectToDB();

        const email = await getSession()
        if (!email) throw new Error("No session found.");

        const user =  await User.findOne({ email });

        if(!user) {
            throw new Error("User not found")
        }

        return { connectedGit: user.githubAccessToken ? true : false, connectedVercel: user.vercelAccessToken ? true : false }
    } catch (error: any) {
        throw new Error(`Error fetching user GitHub details: ${error.message}`)
    }
}


export async function getOwnerUser(): Promise<UserType>;
export async function getOwnerUser(type: 'json'): Promise<string>;

export async function getOwnerUser(type?: 'json') {
   try {
    connectToDB();

    const email = await getSession();

    const user = await User.findOne({ email });

    await mongoose.disconnect()
    if(type === 'json'){
      return JSON.stringify(user)
    } else {
      return user
    }
   } catch (error: any) {
     throw new Error(`Erorr geting owner user: ${error.message}`)
   }
}

export async function transferOwnerUser({ user }: { user: UserType}): Promise<void> {
  try {
    await connectToDB();

    await User.create(user)
  } catch (error: any) {
    throw new Error(`Error transfering owner user: ${error.message}`)
  }
}