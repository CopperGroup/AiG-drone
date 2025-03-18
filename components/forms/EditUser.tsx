"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { userSchema } from "@/lib/validations/user"
import { Label } from "@/components/ui/label"
import OwnerContent from "../admin-components/OwnerContent"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, X } from "lucide-react"
import { editUser } from "@/lib/actions/user.actions"

type FormData = z.infer<typeof userSchema> & { role: "User" | "Admin" }

export function EditUserForm({
  stringifiedCurrentUser,
  stringifiedUser,
}: { stringifiedCurrentUser: string; stringifiedUser: string }) {
  const user = JSON.parse(stringifiedUser)
  const currentUser = JSON.parse(stringifiedCurrentUser)
  const [isEditing, setIsEditing] = useState(false)
  const [roleChanged, setRoleChanged] = useState(false)
  const [adminConfirmation, setAdminConfirmation] = useState("")

  const form = useForm<FormData>({
    resolver: zodResolver(
      userSchema.extend({
        role: z.enum(["User", "Admin"]),
      }),
    ),
    defaultValues: {
      name: user.name,
      surname: user.surname || "",
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      role: user.role as "User" | "Admin",
    },
  })

  const handleSubmit = async (values: FormData) => {
    if (roleChanged && values.role === "Admin" && adminConfirmation !== "Yes") {
      form.setError("role", { message: 'Please type "Yes" to confirm admin role' })
      return
    }

    // Here you would typically update the user data
    console.log("Updated user data:", values)

    await editUser(
        {
          userId: user._id,
          name: values.name,
          email: values.email,
          surname: values.surname,
          phoneNumber: values.phoneNumber,
          role: values.role,
          currentUserEmail: currentUser.email
        },
        "json"
      );

    setIsEditing(false)
  }

  return (
    <div className="w-full mt-10 bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-heading2-bold text-gray-900">Особиста інформація</h2>
        <Button onClick={() => setIsEditing(!isEditing)} className="text-base-semibold text-white">
          {isEditing ? <><X className="size-5 mr-2"/>Cancel</> :  <><Edit className="size-5 mr-2"/>Edit</>}
        </Button>
      </div>

      {isEditing ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base-semibold text-gray-700">Ім&apos;я</FormLabel>
                  <FormControl>
                    <Input {...field} className="text-body-normal" />
                  </FormControl>
                  <FormMessage className="text-small-regular text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="surname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base-semibold text-gray-700">Прізвище</FormLabel>
                  <FormControl>
                    <Input {...field} className="text-body-normal" />
                  </FormControl>
                  <FormMessage className="text-small-regular text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base-semibold text-gray-700">Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} className="text-body-normal" />
                  </FormControl>
                  <FormMessage className="text-small-regular text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base-semibold text-gray-700">Номер телефону</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} className="text-body-normal" />
                  </FormControl>
                  <FormMessage className="text-small-regular text-red-500" />
                </FormItem>
              )}
            />
            <OwnerContent role={currentUser.role}>
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base-semibold text-gray-700">Role</FormLabel>
                    <Select onValueChange={(value) => {field.onChange(value), setRoleChanged(true)}} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-body-normal">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="User">User</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-small-regular text-red-500" />
                  </FormItem>
                )}
              />
              {roleChanged && form.getValues("role") === "Admin" && (
                <div className="space-y-2 mt-4">
                  <Label htmlFor="admin-confirmation" className="text-base-medium text-gray-700">
                    Type <span className="text-red-500">Yes</span> to confirm
                  </Label>
                  <Input
                    id="admin-confirmation"
                    value={adminConfirmation}
                    onChange={(e) => setAdminConfirmation(e.target.value)}
                    placeholder="Type 'Yes' to confirm"
                    className="text-body-normal"
                  />
                </div>
              )}
            </OwnerContent>
            <Button type="submit" className="w-full text-base-semibold text-white">
              Save
            </Button>
          </form>
        </Form>
      ) : (
        <div className="space-y-4">
          {user.name && (
            <p className="text-body-medium text-gray-800">
              Ім&apos;я: <span className="text-body-semibold">{user.name}</span>
            </p>
          )}
          {user.surname && (
            <p className="text-body-medium text-gray-800">
              Прізвище: <span className="text-body-semibold">{user.surname}</span>
            </p>
          )}
          <p className="text-body-medium text-gray-800">
            Email:{" "}
            <Link
              href={`mailto:${user.email}`}
              className="text-primary-experimental hover:underline text-body-semibold"
            >
              {user.email}
            </Link>
          </p>
          {user.phoneNumber && (
            <p className="text-body-medium text-gray-800">
              Номер телефону:{" "}
              <Link
                href={`tel:${user.phoneNumber}`}
                className="text-primary-experimental hover:underline text-body-semibold"
              >
                {user.phoneNumber}
              </Link>
            </p>
          )}
          <p className="text-body-medium text-gray-800">
            Role:{" "}
            <span className={`text-body-semibold ${user.role === "Admin" ? "text-red-500" : "text-green-500"}`}>
              {user.role}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}

