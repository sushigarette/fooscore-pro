import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreButton } from "@/components/ScoreButton";
import { ArrowLeft, Pause, RotateCcw, Flag, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface MatchData {
  mode: string;
  teamA: { name: string; player1: string; player2?: string };
  teamB: { name: string; player1: string; player2?: string };
  scoreLimit: number;
  startTime: string;
}

export default function MatchPlay() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [gameHistory, setGameHistory] = useState<Array<{team: 'A' | 'B', time: string}>>([]);
  const [gameTime, setGameTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [winner, setWinner] = useState<'A' | 'B' | null>(null);

  useEffect(() => {
    const savedMatch = localStorage.getItem('currentMatch');
    if (savedMatch) {
      setMatchData(JSON.parse(savedMatch));
    } else {
      navigate('/');
    }
  }, [navigate]);

  // Game timer
  useEffect(() => {
    if (!isPaused && !winner) {
      const interval = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPaused, winner]);

  // Check for winner
  useEffect(() => {
    if (matchData && (scoreA >= matchData.scoreLimit || scoreB >= matchData.scoreLimit)) {
      const winningTeam = scoreA >= matchData.scoreLimit ? 'A' : 'B';
      setWinner(winningTeam);
      setIsPaused(true);
      
      toast({
        title: "🏆 Match Finished!",
        description: `${winningTeam === 'A' ? matchData.teamA.name : matchData.teamB.name} wins ${scoreA}-${scoreB}!`,
      });
    }
  }, [scoreA, scoreB, matchData, toast]);

  const addScore = (team: 'A' | 'B') => {
    if (winner) return;
    
    const now = new Date().toLocaleTimeString();
    setGameHistory(prev => [...prev, { team, time: now }]);
    
    if (team === 'A') {
      setScoreA(prev => prev + 1);
    } else {
      setScoreB(prev => prev + 1);
    }
  };

  const undoLastScore = () => {
    if (gameHistory.length === 0 || winner) return;
    
    const lastGoal = gameHistory[gameHistory.length - 1];
    setGameHistory(prev => prev.slice(0, -1));
    
    if (lastGoal.team === 'A') {
      setScoreA(prev => Math.max(0, prev - 1));
    } else {
      setScoreB(prev => Math.max(0, prev - 1));
    }
    
    if (winner) {
      setWinner(null);
      setIsPaused(false);
    }
  };

  const endMatch = () => {
    if (!matchData) return;
    
    const finalMatch = {
      id: Date.now().toString(),
      date: matchData.startTime,
      teamA: matchData.teamA.name,
      teamB: matchData.teamB.name,
      scoreA,
      scoreB,
      duration: formatTime(gameTime),
      winner: scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : undefined,
      mode: matchData.mode,
      players: {
        teamA: [matchData.teamA.player1, matchData.teamA.player2].filter(Boolean),
        teamB: [matchData.teamB.player1, matchData.teamB.player2].filter(Boolean)
      }
    };

    // Save to match history
    const existingHistory = JSON.parse(localStorage.getItem('matchHistory') || '[]');
    localStorage.setItem('matchHistory', JSON.stringify([finalMatch, ...existingHistory]));
    
    // Clear current match
    localStorage.removeItem('currentMatch');
    
    navigate('/history');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!matchData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatTime(gameTime)}</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            disabled={winner !== null}
          >
            <Pause className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Match Info */}
      <Card className="shadow-card mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{matchData.mode.toUpperCase()}</Badge>
            <div className="text-sm text-muted-foreground">
              First to {matchData.scoreLimit} points
            </div>
            {winner && (
              <Badge className="bg-success text-success-foreground">
                <Flag className="h-3 w-3 mr-1" />
                Match Finished
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Score Display */}
      <div className="flex items-center justify-center space-x-8 mb-8">
        <ScoreButton
          teamName={matchData.teamA.name}
          score={scoreA}
          color="primary"
          onClick={() => addScore('A')}
          disabled={winner !== null}
        />
        
        <div className="text-4xl font-bold text-muted-foreground">-</div>
        
        <ScoreButton
          teamName={matchData.teamB.name}
          score={scoreB}
          color="accent"
          onClick={() => addScore('B')}
          disabled={winner !== null}
        />
      </div>

      {/* Players Display */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="shadow-card border-l-4 border-l-primary">
          <CardContent className="p-4 text-center">
            <div className="font-medium mb-2">{matchData.teamA.player1}</div>
            {matchData.teamA.player2 && (
              <div className="font-medium text-muted-foreground">{matchData.teamA.player2}</div>
            )}
          </CardContent>
        </Card>
        
        <Card className="shadow-card border-l-4 border-l-accent">
          <CardContent className="p-4 text-center">
            <div className="font-medium mb-2">{matchData.teamB.player1}</div>
            {matchData.teamB.player2 && (
              <div className="font-medium text-muted-foreground">{matchData.teamB.player2}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={undoLastScore}
            disabled={gameHistory.length === 0}
            className="flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Undo Last Goal
          </Button>
          
          {winner && (
            <Button variant="success" onClick={endMatch} className="flex-1">
              <Flag className="h-4 w-4 mr-2" />
              Save Match
            </Button>
          )}
        </div>

        {!winner && (
          <Button variant="destructive" onClick={endMatch} className="w-full">
            End Match Early
          </Button>
        )}
      </div>

      {/* Recent Goals */}
      {gameHistory.length > 0 && (
        <Card className="shadow-card mt-6">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Recent Goals</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {gameHistory.slice(-5).reverse().map((goal, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className={`font-medium ${goal.team === 'A' ? 'text-primary' : 'text-accent'}`}>
                    {goal.team === 'A' ? matchData.teamA.name : matchData.teamB.name} scores!
                  </span>
                  <span className="text-muted-foreground">{goal.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}