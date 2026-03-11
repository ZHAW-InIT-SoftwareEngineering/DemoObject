import { Button } from "@/components/ui";

type AnimationHudProps = {
  label: string;
  onClose?: () => void;
};

export function AnimationHud({ label, onClose }: AnimationHudProps) {
  return (
    <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-center justify-between gap-3 sm:inset-x-6 sm:top-6">
      <div className="pointer-events-auto rounded-md border border-white/15 bg-black/45 px-3 py-2 text-xs text-gray-100 backdrop-blur-sm sm:text-sm">
        {label}
      </div>
      {onClose && (
        <Button
          type="button"
          variant="outline"
          className="pointer-events-auto border-white/20 bg-black/35 text-white hover:bg-black/55"
          onClick={onClose}
        >
          Zurück
        </Button>
      )}
    </div>
  );
}
