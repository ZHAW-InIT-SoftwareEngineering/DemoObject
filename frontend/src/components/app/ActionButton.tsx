import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

type ActionButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: React.ComponentProps<typeof Button>["variant"];
  type?: React.ComponentProps<"button">["type"];
  fullWidth?: boolean;
  className?: string;
};

export function ActionButton({
  label,
  onClick,
  disabled = false,
  variant = "default",
  type = "button",
  fullWidth = true,
  className,
}: ActionButtonProps) {
  return (
    <Button
      type={type}
      onClick={onClick}
      variant={variant}
      disabled={disabled}
      className={cn(fullWidth && "w-full", className)}
    >
      {label}
    </Button>
  );
}
