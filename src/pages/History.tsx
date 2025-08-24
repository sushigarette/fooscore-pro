import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MatchCard } from "@/components/MatchCard";
import { ArrowLeft, History as HistoryIcon, Filter, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

interface Match {
  id: string;
  date: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  duration?: string;
  winner?: "A" | "B";
  mode?: string;
  players?: {
    teamA: string[];
    teamB: string[];
  };
}

export default function History() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<string>("all");

  useEffect(() => {
    const savedHistory = localStorage.getItem('matchHistory');
    if (savedHistory) {
      setMatches(JSON.parse(savedHistory));
    }
  }, []);

  const filteredMatches = matches.filter(match => {
    const matchesSearch = searchTerm === "" || 
      match.teamA.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.teamB.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (match.players?.teamA.join(' ').toLowerCase().includes(searchTerm.toLowerCase())) ||
      (match.players?.teamB.join(' ').toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterMode === "all" || match.mode === filterMode;
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalMatches: matches.length,
    totalGoals: matches.reduce((sum, match) => sum + match.scoreA + match.scoreB, 0),
    averageScore: matches.length > 0 ? 
      (matches.reduce((sum, match) => sum + Math.max(match.scoreA, match.scoreB), 0) / matches.length).toFixed(1) : 0
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
          <HistoryIcon className="mr-2 h-6 w-6" />
          Match History
        </h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalMatches}</div>
            <div className="text-sm text-muted-foreground">Total Matches</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">{stats.totalGoals}</div>
            <div className="text-sm text-muted-foreground">Total Goals</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{stats.averageScore}</div>
            <div className="text-sm text-muted-foreground">Avg Winner Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="shadow-card mb-6">
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams or players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              {["all", "1v1", "2v2", "4v4"].map((mode) => (
                <Button
                  key={mode}
                  variant={filterMode === mode ? "sport" : "outline"}
                  size="sm"
                  onClick={() => setFilterMode(mode)}
                >
                  {mode === "all" ? "All Modes" : mode.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matches List */}
      {filteredMatches.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <HistoryIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {matches.length === 0 ? "No matches yet" : "No matches found"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {matches.length === 0 
                ? "Start your first match to see it here!"
                : "Try adjusting your search or filter criteria"
              }
            </p>
            {matches.length === 0 && (
              <Button variant="sport" onClick={() => navigate('/match/new')}>
                Start First Match
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map((match) => (
            <div key={match.id} className="relative">
              <MatchCard match={match} />
              {match.mode && (
                <Badge 
                  variant="secondary" 
                  className="absolute top-2 right-2 text-xs"
                >
                  {match.mode.toUpperCase()}
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}