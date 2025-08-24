import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useVenues, useTables } from '@/hooks/useVenues'
import { useUsers } from '@/hooks/useUsers'
import { useCreateMatch } from '@/hooks/useMatches'
import { useTeams, useAddTeamMember } from '@/hooks/useTeams'
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
  MapPin,
  Table
} from 'lucide-react'
import type { GameRules } from '@/lib/supabase'

const NewMatch: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()
  
  // État du formulaire
  const [mode, setMode] = useState<'1v1' | '2v2' | '4v4'>(
    (searchParams.get('mode') as '1v1' | '2v2' | '4v4') || '2v2'
  )
  const [selectedVenue, setSelectedVenue] = useState<string>('')
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [teamAMembers, setTeamAMembers] = useState<string[]>([])
  const [teamBMembers, setTeamBMembers] = useState<string[]>([])
  const [teamAName, setTeamAName] = useState('')
  const [teamBName, setTeamBName] = useState('')
  const [rules, setRules] = useState<GameRules>({
    final_score: 7,
    sets_enabled: false,
    golden_goal: false,
    overtime: false,
    allow_own_goals: true,
    allow_lobs: true,
    service_alternate: true,
    handicap_enabled: false
  })

  // Hooks pour les données
  const { data: venues } = useVenues()
  const { data: tables } = useTables(selectedVenue)
  const { data: users } = useUsers()
  const { data: teams } = useTeams(selectedVenue)
  const createMatch = useCreateMatch()
  const createTeam = useCreateTeam()
  const addTeamMember = useAddTeamMember()

  // Validation
  const isValid = () => {
    const requiredPlayers = mode === '1v1' ? 1 : mode === '2v2' ? 2 : 4
    return (
      selectedVenue &&
      selectedTable &&
      teamAMembers.length === requiredPlayers &&
      teamBMembers.length === requiredPlayers &&
      teamAName.trim() &&
      teamBName.trim()
    )
  }

  const handleCreateMatch = async () => {
    if (!isValid() || !user) return

    try {
      // Créer les équipes temporaires
      const teamA = await createTeam.mutateAsync({
        name: teamAName,
        venue_id: selectedVenue,
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
        venue_id: selectedVenue,
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

      // Créer le match
      const match = await createMatch.mutateAsync({
        table_id: selectedTable,
        venue_id: selectedVenue,
        mode,
        team_a_id: teamA.id,
        team_b_id: teamB.id,
        rules,
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
    const requiredPlayers = mode === '1v1' ? 1 : mode === '2v2' ? 2 : 4
    
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
    return mode === '1v1' ? 1 : mode === '2v2' ? 2 : 4
  }

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
              <h1 className="text-3xl font-bold">Nouveau Match</h1>
              <p className="text-muted-foreground">Créez un nouveau match de baby-foot</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration du match */}
          <div className="space-y-6">
            {/* Mode de jeu */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Mode de jeu</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {(['1v1', '2v2', '4v4'] as const).map((gameMode) => (
                    <Button
                      key={gameMode}
                      variant={mode === gameMode ? 'default' : 'outline'}
                      onClick={() => setMode(gameMode)}
                      className="h-16 flex-col"
                    >
                      <Users className="h-5 w-5 mb-1" />
                      <span className="text-sm font-medium">{gameMode}</span>
                      {gameMode === '2v2' && (
                        <Badge variant="secondary" className="mt-1">Populaire</Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Lieu et table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Lieu et table</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="venue">Lieu</Label>
                  <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un lieu" />
                    </SelectTrigger>
                    <SelectContent>
                      {venues?.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedVenue && (
                  <div>
                    <Label htmlFor="table">Table</Label>
                    <Select value={selectedTable} onValueChange={setSelectedTable}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une table" />
                      </SelectTrigger>
                      <SelectContent>
                        {tables?.map((table) => (
                          <SelectItem key={table.id} value={table.id}>
                            <div className="flex items-center space-x-2">
                              <Table className="h-4 w-4" />
                              <span>{table.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Règles du jeu */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Règles du jeu</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="final-score">Score final</Label>
                  <Select 
                    value={rules.final_score.toString()} 
                    onValueChange={(value) => setRules({...rules, final_score: parseInt(value) as 5 | 7 | 10})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 buts</SelectItem>
                      <SelectItem value="7">7 buts</SelectItem>
                      <SelectItem value="10">10 buts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="golden-goal"
                      checked={rules.golden_goal}
                      onCheckedChange={(checked) => setRules({...rules, golden_goal: checked as boolean})}
                    />
                    <Label htmlFor="golden-goal">But d'or</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="allow-own-goals"
                      checked={rules.allow_own_goals}
                      onCheckedChange={(checked) => setRules({...rules, allow_own_goals: checked as boolean})}
                    />
                    <Label htmlFor="allow-own-goals">Autoriser les gamelles</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="service-alternate"
                      checked={rules.service_alternate}
                      onCheckedChange={(checked) => setRules({...rules, service_alternate: checked as boolean})}
                    />
                    <Label htmlFor="service-alternate">Service alterné</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Composition des équipes */}
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

            {/* Bouton de création */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleCreateMatch}
              disabled={!isValid() || createMatch.isPending}
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewMatch