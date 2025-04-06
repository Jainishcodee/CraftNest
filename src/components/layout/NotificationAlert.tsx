
import React, { useState } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const NotificationAlert = () => {
  const { notifications, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<number | null>(
    null
  );

  // Auto-open when there are new notifications
  React.useEffect(() => {
    const unreadNotifications = notifications.filter((n) => !n.read);
    if (unreadNotifications.length > 0 && !isOpen) {
      setCurrentNotification(0);
      setIsOpen(true);
    }
  }, [notifications, isOpen]);

  const handleClose = () => {
    if (currentNotification !== null && notifications[currentNotification]) {
      markAsRead(notifications[currentNotification].id);
    }
    setIsOpen(false);
    setCurrentNotification(null);
  };

  const handleNext = () => {
    if (
      currentNotification !== null &&
      currentNotification < notifications.length - 1
    ) {
      markAsRead(notifications[currentNotification].id);
      setCurrentNotification(currentNotification + 1);
    } else {
      handleClose();
    }
  };

  // If there's no notification to display, return null
  if (currentNotification === null || !notifications[currentNotification]) {
    return null;
  }

  const notification = notifications[currentNotification];

  // Icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return (
          <CheckCircle className="h-6 w-6 text-craft-sage" aria-hidden="true" />
        );
      case "error":
        return (
          <AlertCircle
            className="h-6 w-6 text-destructive"
            aria-hidden="true"
          />
        );
      case "warning":
        return (
          <AlertTriangle
            className="h-6 w-6 text-amber-500"
            aria-hidden="true"
          />
        );
      default:
        return <Info className="h-6 w-6 text-craft-teal" aria-hidden="true" />;
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader className="flex flex-row items-center gap-3">
          {getIcon()}
          <AlertDialogTitle>{notification.title}</AlertDialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </AlertDialogHeader>
        <ScrollArea className="max-h-[200px]">
          <AlertDialogDescription className="py-2">
            {notification.message}
          </AlertDialogDescription>
        </ScrollArea>
        <AlertDialogFooter>
          <Button onClick={handleNext} className="craft-btn-primary">
            {currentNotification < notifications.length - 1 ? "Next" : "Done"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NotificationAlert;
