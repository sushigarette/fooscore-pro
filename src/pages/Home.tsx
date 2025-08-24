import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Users, Trophy, History, Target, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import heroFoosball from "@/assets/hero-foosball.jpg";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats] = useState({
    totalMatches: 42,
    todayMatches: 3,
    activePlayers: 12,
    topPlayer: "Alex M."
  });

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      {/* Hero Section */}
      <div 
        className="relative h-80 bg-cover bg-center bg-gradient-hero"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${heroFoosball})` }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Baby-foot Championship
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-md">
            Challenge your friends, track your progress, and become the ultimate champion!
          </p>
          
          {user ? (
            <Button 
              variant="hero" 
              size="xl"
              onClick={() => navigate('/match/new')}
              className="animate-pulse"
            >
              <Play className="mr-2 h-5 w-5" />
              Commencer un Match
            </Button>
          ) : (
            <Button 
              variant="hero" 
              size="xl"
              onClick={() => navigate('/auth')}
              className="animate-pulse"
            >
              <Play className="mr-2 h-5 w-5" />
              Se Connecter pour Jouer
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6 -mt-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-primary">{stats.totalMatches}</div>
              <div className="text-sm text-muted-foreground">Total Matches</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <Play className="h-8 w-8 mx-auto mb-2 text-accent" />
              <div className="text-2xl font-bold text-accent">{stats.todayMatches}</div>
              <div className="text-sm text-muted-foreground">Today</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-success" />
              <div className="text-2xl font-bold text-success">{stats.activePlayers}</div>
              <div className="text-sm text-muted-foreground">Active Players</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-lg font-bold text-primary">{stats.topPlayer}</div>
              <div className="text-sm text-muted-foreground">Top Player</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="mr-2 h-5 w-5 text-primary" />
                Quick Match
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button 
                  variant="sport" 
                  size="lg" 
                  onClick={() => navigate('/match/new?mode=2v2')}
                  disabled={!user}
                >
                  <Users className="mr-2 h-4 w-4" />
                  2 vs 2 Match
                  <Badge className="ml-2 bg-accent text-accent-foreground">Populaire</Badge>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => navigate('/match/new?mode=1v1')}
                  disabled={!user}
                >
                  <Target className="mr-2 h-4 w-4" />
                  1 vs 1 Duel
                </Button>
              </div>
              
              {!user && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Connectez-vous pour créer des matchs
                  </p>
                  <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                    Se connecter
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Match History</h3>
                  <History className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  View all your matches and track your progress
                </p>
                <Button variant="outline" className="w-full" onClick={() => navigate('/history')}>
                  View History
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Rankings</h3>
                  <Trophy className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Check the leaderboard and your ranking
                </p>
                <Button variant="outline" className="w-full" onClick={() => navigate('/rankings')}>
                  View Rankings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}