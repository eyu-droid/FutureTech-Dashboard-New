import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog.tsx"
  import { Button } from "@/components/ui/button"
import { useState } from "react";

  type DeleteConfirmationDialogProps = {
    onDelete: () => void;
  }

  export function DeleteConfirmationDialog({ onDelete }: DeleteConfirmationDialogProps) {
    const [open, setOpen] = useState(false);

    const handleContinue = () => {
        onDelete();
        setOpen(false);
    }

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="text-red-500">Delete</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              submission and remove the data from the database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={handleContinue}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
