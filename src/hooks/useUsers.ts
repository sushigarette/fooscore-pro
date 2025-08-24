import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { User, Rating } from '@/lib/supabase'

// Récupérer tous les utilisateurs
export const useUsers = (venueId?: string) => {
  return useQuery({
    queryKey: ['users', venueId],
    queryFn: async () => {
      let query = supabase
        .from('users')
        .select('*')
        .order('username', { ascending: true })

      if (venueId) {
        // Filtrer par utilisateurs qui ont joué dans ce lieu
        query = query.in('id', 
          supabase
            .from('matches')
            .select('team_a_id, team_b_id')
            .eq('venue_id', venueId)
            .then(result => {
              const teamIds = result.data?.flatMap(match => [match.team_a_id, match.team_b_id]) || []
              return supabase
                .from('team_members')
                .select('user_id')
                .in('team_id', teamIds)
                .then(members => members.data?.map(m => m.user_id) || [])
            })
        )
      }

      const { data, error } = await query
      if (error) throw error
      return data as User[]
    }
  })
}

// Récupérer un utilisateur spécifique
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data as User
    },
    enabled: !!userId
  })
}

// Mettre à jour un utilisateur
export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Partial<User>) => {
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', data.id] })
    }
  })
}

// Récupérer les classements des utilisateurs
export const useUserRankings = (mode: '1v1' | '2v2' | '4v4', venueId?: string) => {
  return useQuery({
    queryKey: ['rankings', 'users', mode, venueId],
    queryFn: async () => {
      let query = supabase
        .from('ratings')
        .select(`
          *,
          user:users(*)
        `)
        .eq('mode', mode)
        .order('elo', { ascending: false })

      if (venueId) {
        query = query.eq('venue_id', venueId)
      }

      const { data, error } = await query
      if (error) throw error
      return data as (Rating & { user: User })[]
    }
  })
}

// Récupérer les statistiques d'un utilisateur
export const useUserStats = (userId: string) => {
  return useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      // Récupérer tous les matchs de l'utilisateur
      const { data: matches, error } = await supabase
        .from('matches')
        .select(`
          *,
          team_a:teams!team_a_id(
            members:team_members(user_id)
          ),
          team_b:teams!team_b_id(
            members:team_members(user_id)
          )
        `)
        .or(`team_a.members.user_id.eq.${userId},team_b.members.user_id.eq.${userId}`)

      if (error) throw error

      // Calculer les statistiques
      const stats = {
        totalMatches: matches?.length || 0,
        wins: 0,
        losses: 0,
        draws: 0,
        goalsScored: 0,
        goalsConceded: 0,
        winRate: 0,
        currentStreak: 0,
        bestStreak: 0
      }

      if (matches) {
        for (const match of matches) {
          const isTeamA = match.team_a.members.some((m: any) => m.user_id === userId)
          const isTeamB = match.team_b.members.some((m: any) => m.user_id === userId)
          
          if (isTeamA) {
            stats.goalsScored += match.score_a
            stats.goalsConceded += match.score_b
            if (match.score_a > match.score_b) stats.wins++
            else if (match.score_a < match.score_b) stats.losses++
            else stats.draws++
          } else if (isTeamB) {
            stats.goalsScored += match.score_b
            stats.goalsConceded += match.score_a
            if (match.score_b > match.score_a) stats.wins++
            else if (match.score_b < match.score_a) stats.losses++
            else stats.draws++
          }
        }

        stats.winRate = stats.totalMatches > 0 ? (stats.wins / stats.totalMatches) * 100 : 0
      }

      return stats
    },
    enabled: !!userId
  })
}

// Rechercher des utilisateurs
export const useSearchUsers = (searchTerm: string) => {
  return useQuery({
    queryKey: ['search-users', searchTerm],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(10)

      if (error) throw error
      return data as User[]
    },
    enabled: searchTerm.length > 2
  })
} 