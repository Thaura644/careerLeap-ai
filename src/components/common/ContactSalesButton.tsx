
import React from "react";
import { Button } from "@/components/ui/button";
import { BookDemoModal } from "./BookDemoModal";
import { cn } from "@/lib/utils";

interface ContactSalesButtonProps {
  className?: string;
  variant?: "default" | "outline" | "link";
  label?: string;
  showIcon?: boolean;
}

export const ContactSalesButton: React.FC<ContactSalesButtonProps> = ({
  className,
  variant = "default",
  label = "Contact Sales",
  showIcon = true
}) => {
  return (
    <BookDemoModal 
      trigger={
        <Button variant={variant} className={cn(className)}>
          {label}
        </Button>
      }
      variant={variant}
    />
  );
};
