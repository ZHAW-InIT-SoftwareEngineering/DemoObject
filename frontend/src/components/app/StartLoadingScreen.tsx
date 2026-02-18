import { Loader2Icon } from "lucide-react";

export function StartLoadingScreen() {
  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center">
      <Loader2Icon className="h-10 w-10 animate-spin text-black" />
    </div>
  );
}
