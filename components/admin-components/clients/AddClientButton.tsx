"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createuserByMyself, fetchUserByEmail } from "@/lib/actions/user.actions";
import { useEffect, useState } from "react";
import OwnerContent from "../OwnerContent";
import { userSchema } from "@/lib/validations/user";

type FormData = z.infer<typeof userSchema>;

export function AddClientButton({ stringifiedUser }: { stringifiedUser: string }) {
  const user = JSON.parse(stringifiedUser);

  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminConfirmation, setAdminConfirmation] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      phoneNumber: "",
    },
  });

  const handleSubmit = async (values: FormData) => {
    if (isAdmin && adminConfirmation !== 'Yes') {
      return;
    }

    try {
      const result = await fetchUserByEmail({ email: values.email }, "json");
      const existingUser = JSON.parse(result);

      if (existingUser) {
        form.setError("email", { message: "Email already in use" });
        return;
      }

      await createuserByMyself(
        {
          name: values.name,
          email: values.email,
          surname: values.surname,
          phoneNumber: values.phoneNumber,
          role: adminConfirmation === 'Yes' ? isAdmin ? 'Admin' : 'User' : 'User',
          currentUserEmail: user.email
        },
        "json"
      );

      form.reset();
      setIsAdmin(false);
      setAdminConfirmation("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error adding client:", error);
      form.setError("email", { message: "Something went wrong. Please try again." });
    }
  };

  return (
    <div className="w-full flex justify-end">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="default" className="text-base-semibold text-white">
            <Plus className="size-5 mr-1" />
            Add Client
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-heading3-bold">Add New Client</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter client name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="surname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surname</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter client surname (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter client email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Enter client phone number (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center space-x-2">
                <OwnerContent role={user.role}>
                  <Checkbox id="admin" checked={isAdmin} onCheckedChange={(checked) => setIsAdmin(checked === true)} />
                  <Label htmlFor="admin" className="text-base-semibold">
                    Admin
                  </Label>
                </OwnerContent>
              </div>
              {isAdmin && (
                <div className="space-y-2">
                  <Label htmlFor="admin-confirmation" className="text-base-medium">
                    Type <span className="text-red-500">Yes</span> to confirm *
                  </Label>
                  <Input
                    id="admin-confirmation"
                    value={adminConfirmation}
                    onChange={(e) => setAdminConfirmation(e.target.value)}
                    placeholder="Type your name exactly"
                    className="text-base-regular placeholder:text-subtle-medium"
                    required
                  />
                </div>
              )}
              <Button type="submit" className="w-full text-base-semibold text-white">
                Add Client
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
