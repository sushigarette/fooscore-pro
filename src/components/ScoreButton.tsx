import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScoreButtonProps {
  teamName: string;
  score: number;
  color: "primary" | "accent";
  onClick: () => void;
  disabled?: boolean;
}

export function ScoreButton({ teamName, score, color, onClick, disabled }: ScoreButtonProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-lg font-semibold text-foreground">{teamName}</div>
      
      <Button
        variant="score"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "transition-all duration-200",
          color === "accent" && "bg-gradient-accent shadow-accent hover:bg-accent-glow"
        )}
      >
        {score}
      </Button>
      
      <div className="text-sm text-muted-foreground">Tap to score</div>
    </div>
  );
}