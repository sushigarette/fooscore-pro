import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlayerStats {
  name: string;
  matches: number;
  wins: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  winRate: number;
  elo: number;
}

export default function Rankings() {
  const navigate = useNavigate();
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [sortBy, setSortBy] = useState<'elo' | 'winRate' | 'matches'>('elo');

  useEffect(() => {
    const savedHistory = localStorage.getItem('matchHistory');
    if (savedHistory) {
      const matches = JSON.parse(savedHistory);
      calculatePlayerStats(matches);
    }
  }, []);

  const calculatePlayerStats = (matches: any[]) => {
    const stats: { [key: string]: PlayerStats } = {};

    matches.forEach(match => {
      const teamAPlayers = match.players?.teamA || [match.teamA];
      const teamBPlayers = match.players?.teamB || [match.teamB];
      
      [...teamAPlayers, ...teamBPlayers].forEach(playerName => {
        if (!stats[playerName]) {
          stats[playerName] = {
            name: playerName,
            matches: 0,
            wins: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            winRate: 0,
            elo: 1200 // Starting ELO
          };
        }
      });

      // Update stats for team A players
      teamAPlayers.forEach(player => {
        const stat = stats[player];
        stat.matches += 1;
        stat.goalsFor += match.scoreA;
        stat.goalsAgainst += match.scoreB;
        
        if (match.winner === 'A') {
          stat.wins += 1;
        } else if (match.winner === 'B') {
          stat.losses += 1;
        }
      });

      // Update stats for team B players
      teamBPlayers.forEach(player => {
        const stat = stats[player];
        stat.matches += 1;
        stat.goalsFor += match.scoreB;
        stat.goalsAgainst += match.scoreA;
        
        if (match.winner === 'B') {
          stat.wins += 1;
        } else if (match.winner === 'A') {
          stat.losses += 1;
        }
      });
    });

    // Calculate win rates and ELO adjustments
    Object.values(stats).forEach(stat => {
      stat.winRate = stat.matches > 0 ? (stat.wins / stat.matches) * 100 : 0;
      // Simple ELO calculation: base + wins*30 - losses*20
      stat.elo = 1200 + (stat.wins * 30) - (stat.losses * 20) + (stat.winRate > 60 ? 100 : 0);
    });

    const sortedStats = Object.values(stats).sort((a, b) => {
      switch (sortBy) {
        case 'winRate':
          return b.winRate - a.winRate;
        case 'matches':
          return b.matches - a.matches;
        default:
          return b.elo - a.elo;
      }
    });

    setPlayerStats(sortedStats);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>;
    }
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return "Champion";
    if (index < 3) return "Podium";
    if (index < 10) return "Top 10";
    return undefined;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold ml-4 flex items-center">
          <Trophy className="mr-2 h-6 w-6" />
          Rankings
        </h1>
      </div>

      {/* Sort Options */}
      <Card className="shadow-card mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium mr-4">Sort by:</span>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={sortBy === 'elo' ? 'sport' : 'outline'}
                size="sm"
                onClick={() => setSortBy('elo')}
              >
                ELO Rating
              </Button>
              <Button
                variant={sortBy === 'winRate' ? 'sport' : 'outline'}
                size="sm"
                onClick={() => setSortBy('winRate')}
              >
                Win Rate
              </Button>
              <Button
                variant={sortBy === 'matches' ? 'sport' : 'outline'}
                size="sm"
                onClick={() => setSortBy('matches')}
              >
                Most Active
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rankings List */}
      {playerStats.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No rankings yet</h3>
            <p className="text-muted-foreground mb-4">
              Play some matches to see player rankings here!
            </p>
            <Button variant="sport" onClick={() => navigate('/match/new')}>
              Start First Match
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {playerStats.map((player, index) => (
            <Card key={player.name} className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-primary text-primary-foreground">
                      {getRankIcon(index)}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-lg">{player.name}</h3>
                        {getRankBadge(index) && (
                          <Badge 
                            className={`text-xs ${
                              index === 0 ? 'bg-yellow-500 text-yellow-50' :
                              index < 3 ? 'bg-gray-500 text-gray-50' :
                              'bg-primary text-primary-foreground'
                            }`}
                          >
                            {getRankBadge(index)}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {player.matches} matches • {player.wins}W-{player.losses}L
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {sortBy === 'elo' ? player.elo :
                       sortBy === 'winRate' ? `${player.winRate.toFixed(1)}%` :
                       player.matches}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {sortBy === 'elo' ? 'ELO Rating' :
                       sortBy === 'winRate' ? 'Win Rate' :
                       'Matches Played'}
                    </div>
                  </div>
                </div>

                {/* Additional stats */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-success">{player.elo}</div>
                    <div className="text-xs text-muted-foreground">ELO</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-accent">{player.winRate.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Win Rate</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-primary">
                      {player.goalsFor > 0 ? (player.goalsFor / player.goalsAgainst).toFixed(2) : '0.00'}
                    </div>
                    <div className="text-xs text-muted-foreground">Goal Ratio</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}