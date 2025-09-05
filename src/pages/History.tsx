import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useMatches } from '@/hooks/useMatches'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Trophy, 
  Clock,
  Eye
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const History: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // Filtres
  const [selectedMode, setSelectedMode] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Hooks pour les données
  const { data: matches, isLoading, error } = useMatches()


  // Filtrer les matchs
  const filteredMatches = matches?.filter(match => {
    const matchesMode = selectedMode === 'all' || match.mode === selectedMode
    const matchesStatus = selectedStatus === 'all' || match.status === selectedStatus
    const matchesSearch = !searchTerm || 
      match.team_a?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.team_b?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesMode && matchesStatus && matchesSearch
  }) || []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Terminé</Badge>
      case 'in_progress':
        return <Badge variant="secondary">En cours</Badge>
      case 'pending':
        return <Badge variant="outline">En attente</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Annulé</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case '1v1':
        return <Users className="h-4 w-4" />
      case '2v2':
        return <Users className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const formatDuration = (startedAt: string, endedAt?: string) => {
    if (!startedAt) return 'Non démarré'
    
    const start = new Date(startedAt)
    const end = endedAt ? new Date(endedAt) : new Date()
    const duration = Math.floor((end.getTime() - start.getTime()) / 60000)
    
    if (duration < 60) return `${duration} min`
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`
  }

  const getWinner = (match: any) => {
    if (match.status !== 'completed') return null
    return match.score_a > match.score_b ? 'A' : match.score_b > match.score_a ? 'B' : null
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertDescription>
              Vous devez être connecté pour voir l'historique.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>
              Erreur lors du chargement des matchs: {error.message}
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
          <div>
            <h1 className="text-3xl font-bold">Historique des matchs</h1>
            <p className="text-muted-foreground">
              Consultez tous vos matchs et statistiques
            </p>
          </div>
        </div>


        {/* Filtres */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtres</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Recherche */}
              <div>
                <Label htmlFor="search">Recherche</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Rechercher par équipe..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Mode */}
              <div>
                <Label htmlFor="mode">Mode</Label>
                <Select value={selectedMode} onValueChange={setSelectedMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les modes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les modes</SelectItem>
                    <SelectItem value="1v1">1v1</SelectItem>
                    <SelectItem value="2v2">2v2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Statut */}
              <div>
                <Label htmlFor="status">Statut</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {filteredMatches.length}
              </div>
              <div className="text-sm text-muted-foreground">Total matchs</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredMatches.filter(m => m.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Matchs terminés</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredMatches.filter(m => m.status === 'in_progress').length}
              </div>
              <div className="text-sm text-muted-foreground">En cours</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {filteredMatches.filter(m => m.status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">En attente</div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des matchs */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredMatches.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <HistoryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun match trouvé</h3>
              <p className="text-muted-foreground mb-4">
                Aucun match ne correspond à vos critères de recherche.
              </p>
              <Button onClick={() => navigate('/match/new')}>
                Créer un nouveau match
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((match) => {
              const winner = getWinner(match)
              const isUserInMatch = match.team_a?.members?.some((m: any) => m.user_id === user.id) ||
                                   match.team_b?.members?.some((m: any) => m.user_id === user.id)

              return (
                <Card key={match.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getModeIcon(match.mode)}
                          <span className="font-medium">{match.mode}</span>
                        </div>
                        {getStatusBadge(match.status)}
                        {isUserInMatch && (
                          <Badge variant="outline">Votre match</Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/match/play/${match.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* Équipes */}
                      <div className="text-center">
                        <div className="text-lg font-semibold mb-1">
                          {match.team_a?.name || 'Équipe A'}
                        </div>
                        <div className="text-3xl font-bold text-blue-600">
                          {match.score_a}
                        </div>
                        {winner === 'A' && (
                          <Trophy className="h-5 w-5 text-yellow-500 mx-auto mt-1" />
                        )}
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="text-2xl font-bold text-muted-foreground">VS</div>
                      </div>

                      <div className="text-center">
                        <div className="text-lg font-semibold mb-1">
                          {match.team_b?.name || 'Équipe B'}
                        </div>
                        <div className="text-3xl font-bold text-red-600">
                          {match.score_b}
                        </div>
                        {winner === 'B' && (
                          <Trophy className="h-5 w-5 text-yellow-500 mx-auto mt-1" />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {match.created_at 
                            ? format(new Date(match.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })
                            : 'Date inconnue'
                          }
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {formatDuration(match.started_at, match.ended_at)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default History