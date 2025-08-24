import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Minus, 
  RotateCcw, 
  Trophy, 
  Users, 
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useScoreGoal, useUndoLastGoal, useUpdateMatch } from '@/hooks/useMatches'
import type { Match, GameRules } from '@/lib/supabase'

interface ScoreBoardProps {
  match: Match & {
    team_a: any
    team_b: any
    table: any
    venue: any
  }
  onScoreUpdate?: (newScore: { score_a: number; score_b: number }) => void
  isReadOnly?: boolean
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ 
  match, 
  onScoreUpdate, 
  isReadOnly = false 
}) => {
  const [isScoring, setIsScoring] = useState(false)
  const [lastAction, setLastAction] = useState<{
    team: 'a' | 'b'
    action: 'goal' | 'undo'
    timestamp: Date
  } | null>(null)
  
  const { toast } = useToast()
  const scoreGoal = useScoreGoal()
  const undoLastGoal = useUndoLastGoal()
  const updateMatch = useUpdateMatch()

  const rules: GameRules = match.rules as GameRules
  const isGameOver = match.score_a >= rules.final_score || match.score_b >= rules.final_score
  const winner = isGameOver 
    ? (match.score_a > match.score_b ? 'A' : 'B')
    : null

  const handleScore = async (team: 'a' | 'b') => {
    if (isReadOnly || isGameOver || isScoring) return

    setIsScoring(true)
    try {
      await scoreGoal.mutateAsync({
        matchId: match.id,
        team,
        playerId: undefined // TODO: Add player selection
      })

      setLastAction({
        team,
        action: 'goal',
        timestamp: new Date()
      })

      toast({
        title: "But marqué !",
        description: `Équipe ${team.toUpperCase()} a marqué !`,
      })

      // Auto-update match status if game is over
      if (
        (team === 'a' && match.score_a + 1 >= rules.final_score) ||
        (team === 'b' && match.score_b + 1 >= rules.final_score)
      ) {
        await updateMatch.mutateAsync({
          id: match.id,
          status: 'completed',
          ended_at: new Date().toISOString()
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de marquer le but",
        variant: "destructive"
      })
    } finally {
      setIsScoring(false)
    }
  }

  const handleUndo = async () => {
    if (isReadOnly || isScoring) return

    setIsScoring(true)
    try {
      await undoLastGoal.mutateAsync(match.id)
      
      setLastAction({
        team: lastAction?.team || 'a',
        action: 'undo',
        timestamp: new Date()
      })

      toast({
        title: "But annulé",
        description: "Le dernier but a été annulé",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'annuler le but",
        variant: "destructive"
      })
    } finally {
      setIsScoring(false)
    }
  }

  const getTeamColor = (team: 'a' | 'b') => {
    return team === 'a' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'
  }

  const getTeamName = (team: 'a' | 'b') => {
    const teamData = team === 'a' ? match.team_a : match.team_b
    return teamData?.name || `Équipe ${team.toUpperCase()}`
  }

  return (
    <div className="space-y-6">
      {/* Match Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Match en cours</span>
            </div>
            <Badge variant={match.status === 'completed' ? 'default' : 'secondary'}>
              {match.status === 'completed' ? 'Terminé' : 'En cours'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Mode</p>
              <p className="font-semibold">{match.mode}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Score final</p>
              <p className="font-semibold">{rules.final_score}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Display */}
      <div className="grid grid-cols-2 gap-4">
        {/* Team A */}
        <Card className={`${winner === 'A' ? 'ring-2 ring-yellow-400' : ''}`}>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg">{getTeamName('a')}</CardTitle>
            {winner === 'A' && (
              <div className="flex items-center justify-center space-x-1">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-600">Vainqueur !</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-6xl font-bold text-blue-600 mb-4">
              {match.score_a}
            </div>
            <Button
              size="lg"
              className={`w-full h-16 text-xl font-bold ${getTeamColor('a')}`}
              onClick={() => handleScore('a')}
              disabled={isReadOnly || isGameOver || isScoring}
            >
              <Plus className="h-6 w-6 mr-2" />
              MARQUER
            </Button>
          </CardContent>
        </Card>

        {/* Team B */}
        <Card className={`${winner === 'B' ? 'ring-2 ring-yellow-400' : ''}`}>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg">{getTeamName('b')}</CardTitle>
            {winner === 'B' && (
              <div className="flex items-center justify-center space-x-1">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-600">Vainqueur !</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-6xl font-bold text-red-600 mb-4">
              {match.score_b}
            </div>
            <Button
              size="lg"
              className={`w-full h-16 text-xl font-bold ${getTeamColor('b')}`}
              onClick={() => handleScore('b')}
              disabled={isReadOnly || isGameOver || isScoring}
            >
              <Plus className="h-6 w-6 mr-2" />
              MARQUER
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Game Status */}
      {isGameOver && (
        <Alert>
          <Trophy className="h-4 w-4" />
          <AlertDescription>
            <strong>Match terminé !</strong> {getTeamName(winner === 'A' ? 'a' : 'b')} remporte la victoire !
          </AlertDescription>
        </Alert>
      )}

      {/* Last Action */}
      {lastAction && (
        <Alert>
          {lastAction.action === 'goal' ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <RotateCcw className="h-4 w-4 text-orange-500" />
          )}
          <AlertDescription>
            {lastAction.action === 'goal' 
              ? `But marqué par l'équipe ${lastAction.team.toUpperCase()}`
              : `Dernier but annulé`
            }
            <span className="text-xs text-muted-foreground ml-2">
              {lastAction.timestamp.toLocaleTimeString()}
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      {!isReadOnly && (
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleUndo}
            disabled={isScoring}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Annuler dernier but</span>
          </Button>
        </div>
      )}

      {/* Match Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Détails du match</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Lieu</p>
              <p className="font-medium">{match.venue?.name || 'Non spécifié'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Table</p>
              <p className="font-medium">{match.table?.name || 'Non spécifiée'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Démarré le</p>
              <p className="font-medium">
                {match.started_at 
                  ? new Date(match.started_at).toLocaleString('fr-FR')
                  : 'Non démarré'
                }
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Durée</p>
              <p className="font-medium">
                {match.started_at 
                  ? `${Math.floor((Date.now() - new Date(match.started_at).getTime()) / 60000)} min`
                  : '-'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ScoreBoard 