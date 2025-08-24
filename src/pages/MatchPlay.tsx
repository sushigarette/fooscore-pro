import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useMatch, useUpdateMatch } from '@/hooks/useMatches'
import Navigation from '@/components/Navigation'
import ScoreBoard from '@/components/ScoreBoard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  Trophy,
  Users,
  Clock,
  MapPin,
  Settings
} from 'lucide-react'

const MatchPlay: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const { data: match, isLoading, error } = useMatch(matchId || '')
  const updateMatch = useUpdateMatch()

  // Démarrer le match
  const handleStartMatch = async () => {
    if (!match) return

    try {
      await updateMatch.mutateAsync({
        id: match.id,
        status: 'in_progress',
        started_at: new Date().toISOString()
      })

      toast({
        title: "Match démarré !",
        description: "Le match est maintenant en cours.",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de démarrer le match.",
        variant: "destructive"
      })
    }
  }

  // Pause/Reprendre le match
  const handlePauseMatch = async () => {
    if (!match) return

    try {
      const newStatus = match.status === 'in_progress' ? 'pending' : 'in_progress'
      await updateMatch.mutateAsync({
        id: match.id,
        status: newStatus
      })

      toast({
        title: newStatus === 'in_progress' ? "Match repris !" : "Match en pause",
        description: newStatus === 'in_progress' 
          ? "Le match est maintenant en cours."
          : "Le match est en pause."
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du match.",
        variant: "destructive"
      })
    }
  }

  // Terminer le match
  const handleEndMatch = async () => {
    if (!match) return

    try {
      await updateMatch.mutateAsync({
        id: match.id,
        status: 'completed',
        ended_at: new Date().toISOString()
      })

      toast({
        title: "Match terminé !",
        description: "Le match a été marqué comme terminé.",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de terminer le match.",
        variant: "destructive"
      })
    }
  }

  // Annuler le match
  const handleCancelMatch = async () => {
    if (!match) return

    try {
      await updateMatch.mutateAsync({
        id: match.id,
        status: 'cancelled'
      })

      toast({
        title: "Match annulé",
        description: "Le match a été annulé.",
      })

      navigate('/')
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'annuler le match.",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertDescription>
              Match introuvable ou erreur de chargement.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const isMatchStarted = match.status === 'in_progress'
  const isMatchCompleted = match.status === 'completed'
  const isMatchCancelled = match.status === 'cancelled'
  const canControlMatch = user && (match.team_a?.members?.some((m: any) => m.user_id === user.id) || 
                                  match.team_b?.members?.some((m: any) => m.user_id === user.id))

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Match en cours</h1>
              <p className="text-muted-foreground">
                {match.team_a?.name} vs {match.team_b?.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={
              match.status === 'completed' ? 'default' :
              match.status === 'in_progress' ? 'secondary' :
              match.status === 'cancelled' ? 'destructive' : 'outline'
            }>
              {match.status === 'completed' ? 'Terminé' :
               match.status === 'in_progress' ? 'En cours' :
               match.status === 'cancelled' ? 'Annulé' : 'En attente'}
            </Badge>
          </div>
        </div>

        {/* Informations du match */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Mode</span>
              </div>
              <p className="text-lg font-bold mt-1">{match.mode}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Lieu</span>
              </div>
              <p className="text-lg font-bold mt-1">{match.venue?.name || 'Non spécifié'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Durée</span>
              </div>
              <p className="text-lg font-bold mt-1">
                {match.started_at 
                  ? `${Math.floor((Date.now() - new Date(match.started_at).getTime()) / 60000)} min`
                  : 'Non démarré'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tableau de score */}
        <div className="mb-8">
          <ScoreBoard 
            match={match} 
            isReadOnly={!canControlMatch || isMatchCompleted || isMatchCancelled}
          />
        </div>

        {/* Actions du match */}
        {canControlMatch && !isMatchCancelled && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Actions du match</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {match.status === 'pending' && (
                  <Button onClick={handleStartMatch} className="flex items-center space-x-2">
                    <Play className="h-4 w-4" />
                    <span>Démarrer le match</span>
                  </Button>
                )}

                {match.status === 'in_progress' && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={handlePauseMatch}
                      className="flex items-center space-x-2"
                    >
                      <Pause className="h-4 w-4" />
                      <span>Mettre en pause</span>
                    </Button>

                    <Button 
                      onClick={handleEndMatch}
                      className="flex items-center space-x-2"
                    >
                      <Trophy className="h-4 w-4" />
                      <span>Terminer le match</span>
                    </Button>
                  </>
                )}

                {match.status === 'pending' && (
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelMatch}
                    className="flex items-center space-x-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Annuler le match</span>
                  </Button>
                )}

                {isMatchCompleted && (
                  <Button 
                    onClick={() => navigate('/history')}
                    className="flex items-center space-x-2"
                  >
                    <Trophy className="h-4 w-4" />
                    <span>Voir l'historique</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Message pour les spectateurs */}
        {!canControlMatch && !isMatchCompleted && !isMatchCancelled && (
          <Alert>
            <AlertDescription>
              Vous êtes en mode spectateur. Seuls les joueurs du match peuvent contrôler le score.
            </AlertDescription>
          </Alert>
        )}

        {/* Résultat final */}
        {isMatchCompleted && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>Résultat final</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold mb-4">
                  {match.score_a > match.score_b ? match.team_a?.name : match.team_b?.name} remporte la victoire !
                </div>
                <div className="text-lg text-muted-foreground">
                  Score final : {match.score_a} - {match.score_b}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default MatchPlay