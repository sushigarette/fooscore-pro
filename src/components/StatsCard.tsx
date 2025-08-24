import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Trophy, Target, Users, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  progress?: number
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }
  className?: string
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  progress,
  badge,
  className = ''
}) => {
  return (
    <Card className={`${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold">{value}</div>
            {badge && (
              <Badge variant={badge.variant || 'secondary'} className="text-xs">
                {badge.text}
              </Badge>
            )}
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {progress !== undefined && (
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {progress}% d'objectif
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Composants spécialisés pour différents types de statistiques
export const MatchStatsCard: React.FC<{
  totalMatches: number
  wins: number
  losses: number
  draws: number
  winRate: number
}> = ({ totalMatches, wins, losses, draws, winRate }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatsCard
        title="Total Matchs"
        value={totalMatches}
        icon={<Target className="h-4 w-4" />}
      />
      <StatsCard
        title="Victoires"
        value={wins}
        icon={<Trophy className="h-4 w-4 text-yellow-500" />}
        badge={{ text: `${winRate}%`, variant: 'default' }}
      />
      <StatsCard
        title="Défaites"
        value={losses}
        icon={<TrendingDown className="h-4 w-4 text-red-500" />}
      />
      <StatsCard
        title="Nuls"
        value={draws}
        icon={<Minus className="h-4 w-4 text-gray-500" />}
      />
    </div>
  )
}

export const PlayerStatsCard: React.FC<{
  username: string
  elo: number
  gamesPlayed: number
  winRate: number
  currentStreak: number
  bestStreak: number
  goalsScored: number
  goalsConceded: number
}> = ({ 
  username, 
  elo, 
  gamesPlayed, 
  winRate, 
  currentStreak, 
  bestStreak, 
  goalsScored, 
  goalsConceded 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Statistiques de {username}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Elo"
            value={elo}
            subtitle="Classement"
            icon={<Trophy className="h-4 w-4 text-yellow-500" />}
          />
          <StatsCard
            title="Matchs"
            value={gamesPlayed}
            subtitle="Joués"
            icon={<Target className="h-4 w-4" />}
          />
          <StatsCard
            title="Win Rate"
            value={`${winRate}%`}
            subtitle="Taux de victoire"
            progress={winRate}
          />
          <StatsCard
            title="Série"
            value={currentStreak}
            subtitle={`Meilleure: ${bestStreak}`}
            icon={<TrendingUp className="h-4 w-4 text-green-500" />}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <StatsCard
            title="Buts marqués"
            value={goalsScored}
            subtitle="Total"
            icon={<Target className="h-4 w-4 text-green-500" />}
          />
          <StatsCard
            title="Buts encaissés"
            value={goalsConceded}
            subtitle="Total"
            icon={<Target className="h-4 w-4 text-red-500" />}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export const TeamStatsCard: React.FC<{
  teamName: string
  members: string[]
  elo: number
  gamesPlayed: number
  wins: number
  losses: number
  winRate: number
}> = ({ teamName, members, elo, gamesPlayed, wins, losses, winRate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>{teamName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {members.map((member, index) => (
            <Badge key={index} variant="outline">
              {member}
            </Badge>
          ))}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Elo Équipe"
            value={elo}
            subtitle="Classement"
            icon={<Trophy className="h-4 w-4 text-yellow-500" />}
          />
          <StatsCard
            title="Matchs"
            value={gamesPlayed}
            subtitle="Joués"
            icon={<Target className="h-4 w-4" />}
          />
          <StatsCard
            title="Victoires"
            value={wins}
            subtitle={`${winRate}% de win rate`}
            icon={<TrendingUp className="h-4 w-4 text-green-500" />}
          />
          <StatsCard
            title="Défaites"
            value={losses}
            subtitle="Total"
            icon={<TrendingDown className="h-4 w-4 text-red-500" />}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default StatsCard 