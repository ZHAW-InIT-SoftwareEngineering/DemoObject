import { Button } from "@/components/ui";
import zhawLogo from "@/assets/zhaw_rgb_logo_zhaw_blau.png";

type StartScreenProps = {
  loading: boolean;
  onStart: () => void;
};

export function StartScreen({ loading, onStart }: StartScreenProps) {
  return (
    <div className="w-full max-w-[520px] flex flex-col items-stretch gap-8">
      <img
        src={zhawLogo}
        alt="Logo der ZHAW"
        className="h-40 w-auto self-center"
      />
      <Button onClick={onStart} disabled={loading}>
        {loading ? "Wird gestartet..." : "Abenteuer starten"}
      </Button>
    </div>
  );
}
