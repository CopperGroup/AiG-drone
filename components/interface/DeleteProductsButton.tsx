'use client';

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { deleteManyProducts } from "@/lib/actions/product.actions";
import { useSession } from "next-auth/react";
import { Trash2, Loader2 } from 'lucide-react';
import { Label } from "../ui/label";

interface DeleteProductsButtonProps {
  selectedIds: string[];
  onDeleteComplete?: () => void;
}

const DeleteProductsButton = ({ selectedIds, onDeleteComplete }: DeleteProductsButtonProps) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const session = useSession();
  const router = useRouter();

  // @ts-ignore
  let currentUserName = session.data?.user.name;

  const handleDelete = async (name: string) => {
    if(currentUserName) {
      if (name === currentUserName) {
        setIsLoading(true);
        try {
          await deleteManyProducts(selectedIds);
          if (onDeleteComplete) onDeleteComplete();
        } catch (error) {
            setError("Помилка при видаленні товарів");
        } finally {
          setIsOpen(false);
          setIsLoading(false);
        }
      } else {
        setError("Неправильне ім'я");
      }
    } else {
      setError("Користувач не знайдений");
    }
  };

  useEffect(() => {
    setError("");
  }, [name]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-fit" variant="outline" onClick={() => setIsOpen(true)} disabled={selectedIds.length === 0}>
          <Trash2 className="h-4 w-4 text-red-500"/>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-black z-[110]">
        <DialogHeader>
          <DialogTitle>Видалити товар</DialogTitle>
          <DialogDescription>
            <Label htmlFor="name" className="mt-2"><span className="font-bold">{currentUserName ?? ""}</span> введіть ваше ім&apos;я, щоб підтвердити видалення {selectedIds.length} {selectedIds.length === 1 ? "товару": "товарів"}.</Label>
          </DialogDescription>
        </DialogHeader>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading}/>
        <p className="text-red-500 text-small-regular">{error}</p>
        <DialogFooter>
          <Button onClick={() => handleDelete(name)} variant="outline" disabled={isLoading}>
            {isLoading ? (
              <>
                Видалення
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                Видалити
                <Image
                  src="/assets/delete.svg"
                  width={24}
                  height={24}
                  alt="Delete order"
                  className="ml-2"
                />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProductsButton;

