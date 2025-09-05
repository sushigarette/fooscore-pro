import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useUsers } from '@/hooks/useUsers'
import { useCreateMatch } from '@/hooks/useMatches'
import { useAddTeamMember, useCreateTeam } from '@/hooks/useTeams'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { 
  Users, 
  Target, 
  Settings, 
  Play, 
  ArrowLeft, 
  Plus,
  User
} from 'lucide-react'
import type { GameRules } from '@/lib/supabase'

const NewMatch: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()
  
  // État du wizard
  const [currentStep, setCurrentStep] = useState(1)
  const [mode, setMode] = useState<'1v1' | '2v2'>(
    (searchParams.get('mode') as '1v1' | '2v2') || '2v2'
  )
  const [teamAMembers, setTeamAMembers] = useState<string[]>([])
  const [teamBMembers, setTeamBMembers] = useState<string[]>([])
  const [teamAName, setTeamAName] = useState('')
  const [teamBName, setTeamBName] = useState('')

  // Hooks pour les données
  const { data: users } = useUsers()
  const createMatch = useCreateMatch()
  const createTeam = useCreateTeam()
  const addTeamMember = useAddTeamMember()

  // Validation par étape
  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return mode !== null
      case 2:
        const requiredPlayers = mode === '1v1' ? 1 : 2
        return (
          teamAMembers.length === requiredPlayers &&
          teamBMembers.length === requiredPlayers &&
          teamAName.trim() &&
          teamBName.trim()
        )
      default:
        return false
    }
  }

  const canProceed = () => isStepValid(currentStep)
  const canGoBack = () => currentStep > 1

  const handleNext = () => {
    if (canProceed() && currentStep < 2) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (canGoBack()) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCreateMatch = async () => {
    if (!canProceed() || !user) return

    try {
      // Créer les équipes temporaires
      const teamA = await createTeam.mutateAsync({
        name: teamAName,
        is_permanent: false
      })

      // Ajouter les membres à l'équipe A
      for (const userId of teamAMembers) {
        await addTeamMember.mutateAsync({
          team_id: teamA.id,
          user_id: userId,
          role: 'member'
        })
      }

      const teamB = await createTeam.mutateAsync({
        name: teamBName,
        is_permanent: false
      })

      // Ajouter les membres à l'équipe B
      for (const userId of teamBMembers) {
        await addTeamMember.mutateAsync({
          team_id: teamB.id,
          user_id: userId,
          role: 'member'
        })
      }

      // Créer le match avec des règles par défaut
      const match = await createMatch.mutateAsync({
        mode,
        team_a_id: teamA.id,
        team_b_id: teamB.id,
        rules: {
          final_score: 7,
          sets_enabled: false,
          overtime: false,
          allow_own_goals: true,
          allow_lobs: true,
          handicap_enabled: false
        },
        status: 'pending'
      })

      toast({
        title: "Match créé !",
        description: "Le match a été créé avec succès.",
      })

      // Rediriger vers la page de jeu
      navigate(`/match/play/${match.id}`)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le match.",
        variant: "destructive"
      })
    }
  }

  const addPlayerToTeam = (playerId: string, team: 'A' | 'B') => {
    const requiredPlayers = mode === '1v1' ? 1 : 2
    
    if (team === 'A') {
      if (teamAMembers.length < requiredPlayers && !teamAMembers.includes(playerId)) {
        setTeamAMembers([...teamAMembers, playerId])
      }
    } else {
      if (teamBMembers.length < requiredPlayers && !teamBMembers.includes(playerId)) {
        setTeamBMembers([...teamBMembers, playerId])
      }
    }
  }

  const removePlayerFromTeam = (playerId: string, team: 'A' | 'B') => {
    if (team === 'A') {
      setTeamAMembers(teamAMembers.filter(id => id !== playerId))
    } else {
      setTeamBMembers(teamBMembers.filter(id => id !== playerId))
    }
  }

  const getPlayerName = (playerId: string) => {
    return users?.find(u => u.id === playerId)?.username || 'Joueur inconnu'
  }

  const getRequiredPlayers = () => {
    return mode === '1v1' ? 1 : 2
  }

  // Composant pour l'étape 1 : Sélection du mode
  const Step1ModeSelection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>Choisissez le mode de jeu</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {(['1v1', '2v2'] as const).map((gameMode) => (
            <Button
              key={gameMode}
              variant={mode === gameMode ? 'default' : 'outline'}
              onClick={() => setMode(gameMode)}
              className="h-20 flex-col space-y-2 p-4"
            >
              <div className="flex items-center space-x-2">
                {gameMode === '1v1' ? (
                  <User className="h-6 w-6" />
                ) : (
                  <Users className="h-6 w-6" />
                )}
                <span className="text-base font-semibold">{gameMode}</span>
              </div>
              {gameMode === '2v2' && (
                <Badge variant="secondary" className="text-xs">Populaire</Badge>
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  // Composant pour l'étape 2 : Création des équipes
  const Step2TeamCreation = () => (
    <div className="space-y-6">
      {/* Équipe A */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Équipe A</span>
            <Badge variant="outline">{teamAMembers.length}/{getRequiredPlayers()}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="team-a-name">Nom de l'équipe</Label>
            <Input
              id="team-a-name"
              value={teamAName}
              onChange={(e) => setTeamAName(e.target.value)}
              placeholder="Nom de l'équipe A"
            />
          </div>

          <div>
            <Label>Joueurs</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {users?.map((player) => (
                <Button
                  key={player.id}
                  variant={teamAMembers.includes(player.id) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => addPlayerToTeam(player.id, 'A')}
                  disabled={teamAMembers.includes(player.id) || teamAMembers.length >= getRequiredPlayers()}
                  className="justify-start"
                >
                  <span className="truncate">{player.username}</span>
                </Button>
              ))}
            </div>
          </div>

          {teamAMembers.length > 0 && (
            <div>
              <Label>Équipe A sélectionnée</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {teamAMembers.map((playerId) => (
                  <Badge key={playerId} variant="secondary">
                    {getPlayerName(playerId)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => removePlayerFromTeam(playerId, 'A')}
                    >
                      ×
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Équipe B */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Équipe B</span>
            <Badge variant="outline">{teamBMembers.length}/{getRequiredPlayers()}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="team-b-name">Nom de l'équipe</Label>
            <Input
              id="team-b-name"
              value={teamBName}
              onChange={(e) => setTeamBName(e.target.value)}
              placeholder="Nom de l'équipe B"
            />
          </div>

          <div>
            <Label>Joueurs</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {users?.map((player) => (
                <Button
                  key={player.id}
                  variant={teamBMembers.includes(player.id) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => addPlayerToTeam(player.id, 'B')}
                  disabled={teamBMembers.includes(player.id) || teamBMembers.length >= getRequiredPlayers()}
                  className="justify-start"
                >
                  <span className="truncate">{player.username}</span>
                </Button>
              ))}
            </div>
          </div>

          {teamBMembers.length > 0 && (
            <div>
              <Label>Équipe B sélectionnée</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {teamBMembers.map((playerId) => (
                  <Badge key={playerId} variant="secondary">
                    {getPlayerName(playerId)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => removePlayerFromTeam(playerId, 'B')}
                    >
                      ×
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertDescription>
              Vous devez être connecté pour créer un match.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
              <h1 className="text-3xl font-bold">Nouveau Match</h1>
              <p className="text-muted-foreground">
                Étape {currentStep} sur 2 - {currentStep === 1 ? 'Mode de jeu' : 'Création des équipes'}
              </p>
            </div>
          </div>
        </div>

        {/* Indicateur de progression */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                1
              </div>
              <span className="text-sm font-medium">Mode de jeu</span>
            </div>
            <div className="flex-1 h-0.5 bg-muted">
              <div className={`h-full transition-all duration-300 ${
                currentStep >= 2 ? 'bg-primary' : 'bg-muted'
              }`} style={{ width: currentStep >= 2 ? '100%' : '0%' }} />
            </div>
            <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Équipes</span>
            </div>
          </div>
        </div>

        {/* Contenu de l'étape actuelle */}
        <div className="mb-8">
          {currentStep === 1 && <Step1ModeSelection />}
          {currentStep === 2 && <Step2TeamCreation />}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={!canGoBack()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>

          {currentStep === 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Suivant
              <Plus className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleCreateMatch}
              disabled={!canProceed() || createMatch.isPending}
            >
              {createMatch.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Créer le match
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default NewMatch