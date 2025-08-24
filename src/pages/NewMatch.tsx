import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Target, ArrowLeft, Play } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function NewMatch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') || '2v2';
  
  const [mode, setMode] = useState<'1v1' | '2v2' | '4v4'>(initialMode as any);
  const [teamA, setTeamA] = useState({
    name: "Team Blue",
    player1: "",
    player2: mode !== '1v1' ? "" : undefined
  });
  const [teamB, setTeamB] = useState({
    name: "Team Red", 
    player1: "",
    player2: mode !== '1v1' ? "" : undefined
  });
  const [scoreLimit, setScoreLimit] = useState(10);

  const handleStartMatch = () => {
    // Create match object and navigate to match page
    const matchData = {
      mode,
      teamA,
      teamB,
      scoreLimit,
      startTime: new Date().toISOString()
    };
    
    // Store match data and navigate
    localStorage.setItem('currentMatch', JSON.stringify(matchData));
    navigate('/match/play');
  };

  const isFormValid = () => {
    if (mode === '1v1') {
      return teamA.player1 && teamB.player1;
    }
    return teamA.player1 && teamA.player2 && teamB.player1 && teamB.player2;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold ml-4">New Match Setup</h1>
      </div>

      {/* Game Mode Selection */}
      <Card className="shadow-card mb-6">
        <CardHeader>
          <CardTitle>Game Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={mode === '1v1' ? 'sport' : 'outline'}
              onClick={() => setMode('1v1')}
              className="flex flex-col h-16"
            >
              <Target className="h-5 w-5 mb-1" />
              <span>1 vs 1</span>
            </Button>
            
            <Button
              variant={mode === '2v2' ? 'sport' : 'outline'}
              onClick={() => setMode('2v2')}
              className="flex flex-col h-16 relative"
            >
              <Users className="h-5 w-5 mb-1" />
              <span>2 vs 2</span>
              <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs">
                Popular
              </Badge>
            </Button>
            
            <Button
              variant={mode === '4v4' ? 'sport' : 'outline'}
              onClick={() => setMode('4v4')}
              className="flex flex-col h-16"
            >
              <Users className="h-5 w-5 mb-1" />
              <span>4 vs 4</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Teams Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Team A */}
        <Card className="shadow-card border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="text-primary">
              <Input
                value={teamA.name}
                onChange={(e) => setTeamA({...teamA, name: e.target.value})}
                className="font-bold text-lg border-none p-0 h-auto bg-transparent"
                placeholder="Team Name"
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="teamA-player1">Player 1</Label>
              <Input
                id="teamA-player1"
                value={teamA.player1}
                onChange={(e) => setTeamA({...teamA, player1: e.target.value})}
                placeholder="Enter player name"
                className="mt-1"
              />
            </div>
            
            {mode !== '1v1' && (
              <div>
                <Label htmlFor="teamA-player2">Player 2</Label>
                <Input
                  id="teamA-player2"
                  value={teamA.player2 || ''}
                  onChange={(e) => setTeamA({...teamA, player2: e.target.value})}
                  placeholder="Enter player name"
                  className="mt-1"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team B */}
        <Card className="shadow-card border-l-4 border-l-accent">
          <CardHeader>
            <CardTitle className="text-accent">
              <Input
                value={teamB.name}
                onChange={(e) => setTeamB({...teamB, name: e.target.value})}
                className="font-bold text-lg border-none p-0 h-auto bg-transparent"
                placeholder="Team Name"
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="teamB-player1">Player 1</Label>
              <Input
                id="teamB-player1"
                value={teamB.player1}
                onChange={(e) => setTeamB({...teamB, player1: e.target.value})}
                placeholder="Enter player name"
                className="mt-1"
              />
            </div>
            
            {mode !== '1v1' && (
              <div>
                <Label htmlFor="teamB-player2">Player 2</Label>
                <Input
                  id="teamB-player2"
                  value={teamB.player2 || ''}
                  onChange={(e) => setTeamB({...teamB, player2: e.target.value})}
                  placeholder="Enter player name" 
                  className="mt-1"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Match Settings */}
      <Card className="shadow-card mb-6">
        <CardHeader>
          <CardTitle>Match Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="scoreLimit">Score Limit</Label>
            <div className="flex space-x-2 mt-2">
              {[5, 7, 10].map((limit) => (
                <Button
                  key={limit}
                  variant={scoreLimit === limit ? 'sport' : 'outline'}
                  onClick={() => setScoreLimit(limit)}
                  className="flex-1"
                >
                  {limit} points
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Match Button */}
      <div className="sticky bottom-4">
        <Button
          variant="hero"
          size="xl"
          onClick={handleStartMatch}
          disabled={!isFormValid()}
          className="w-full"
        >
          <Play className="mr-2 h-5 w-5" />
          Start Match
        </Button>
      </div>
    </div>
  );
}