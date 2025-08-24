import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Trophy, Users } from "lucide-react";

interface MatchCardProps {
  match: {
    id: string;
    date: string;
    teamA: string;
    teamB: string;
    scoreA: number;
    scoreB: number;
    duration?: string;
    winner?: "A" | "B";
  };
  onClick?: () => void;
}

export function MatchCard({ match, onClick }: MatchCardProps) {
  const isWinnerA = match.winner === "A";
  const isWinnerB = match.winner === "B";

  return (
    <Card 
      className="shadow-card hover:shadow-sport cursor-pointer transition-all duration-300 hover:scale-[1.02]"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{new Date(match.date).toLocaleDateString()}</span>
          </div>
          
          {match.duration && (
            <Badge variant="secondary" className="text-xs">
              {match.duration}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-center space-x-6">
          <div className={`text-center ${isWinnerA ? 'text-success font-bold' : ''}`}>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="font-medium">{match.teamA}</span>
            </div>
            <div className="text-2xl font-bold mt-1">{match.scoreA}</div>
          </div>

          <div className="text-muted-foreground font-bold text-xl">-</div>

          <div className={`text-center ${isWinnerB ? 'text-success font-bold' : ''}`}>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="font-medium">{match.teamB}</span>
            </div>
            <div className="text-2xl font-bold mt-1">{match.scoreB}</div>
          </div>
        </div>

        {(isWinnerA || isWinnerB) && (
          <div className="flex justify-center mt-3">
            <Badge className="bg-success text-success-foreground">
              <Trophy className="h-3 w-3 mr-1" />
              Victory {isWinnerA ? match.teamA : match.teamB}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}