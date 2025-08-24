import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Match, MatchEvent, MatchSet } from '@/lib/supabase'

// Récupérer tous les matchs
export const useMatches = (venueId?: string) => {
  return useQuery({
    queryKey: ['matches', venueId],
    queryFn: async () => {
      let query = supabase
        .from('matches')
        .select(`
          *,
          team_a:teams!team_a_id(*),
          team_b:teams!team_b_id(*),
          table:tables(*),
          venue:venues(*)
        `)
        .order('created_at', { ascending: false })

      if (venueId) {
        query = query.eq('venue_id', venueId)
      }

      const { data, error } = await query
      if (error) throw error
      return data as (Match & {
        team_a: any
        team_b: any
        table: any
        venue: any
      })[]
    }
  })
}

// Récupérer un match spécifique
export const useMatch = (matchId: string) => {
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          team_a:teams!team_a_id(*),
          team_b:teams!team_b_id(*),
          table:tables(*),
          venue:venues(*),
          sets:match_sets(*),
          events:match_events(*)
        `)
        .eq('id', matchId)
        .single()

      if (error) throw error
      return data as Match & {
        team_a: any
        team_b: any
        table: any
        venue: any
        sets: MatchSet[]
        events: MatchEvent[]
      }
    },
    enabled: !!matchId
  })
}

// Créer un nouveau match
export const useCreateMatch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (matchData: Partial<Match>) => {
      const { data, error } = await supabase
        .from('matches')
        .insert(matchData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] })
    }
  })
}

// Mettre à jour un match
export const useUpdateMatch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Partial<Match>) => {
      const { data, error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      queryClient.invalidateQueries({ queryKey: ['match', data.id] })
    }
  })
}

// Ajouter un événement de match (but, annulation, etc.)
export const useAddMatchEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventData: Partial<MatchEvent>) => {
      const { data, error } = await supabase
        .from('match_events')
        .insert(eventData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['match', data.match_id] })
    }
  })
}

// Marquer un but
export const useScoreGoal = () => {
  const addEvent = useAddMatchEvent()
  const updateMatch = useUpdateMatch()

  return useMutation({
    mutationFn: async ({ 
      matchId, 
      team, 
      playerId, 
      setNumber 
    }: { 
      matchId: string
      team: 'a' | 'b'
      playerId?: string
      setNumber?: number
    }) => {
      // Ajouter l'événement de but
      await addEvent.mutateAsync({
        match_id: matchId,
        event_type: 'goal',
        team,
        player_id: playerId,
        set_number: setNumber
      })

      // Mettre à jour le score du match
      const match = await supabase
        .from('matches')
        .select('score_a, score_b, sets_a, sets_b')
        .eq('id', matchId)
        .single()

      if (match.error) throw match.error

      const currentScore = match.data
      const newScore = {
        score_a: team === 'a' ? currentScore.score_a + 1 : currentScore.score_a,
        score_b: team === 'b' ? currentScore.score_b + 1 : currentScore.score_b
      }

      await updateMatch.mutateAsync({
        id: matchId,
        ...newScore
      })

      return newScore
    }
  })
}

// Annuler le dernier but
export const useUndoLastGoal = () => {
  const addEvent = useAddMatchEvent()
  const updateMatch = useUpdateMatch()

  return useMutation({
    mutationFn: async (matchId: string) => {
      // Récupérer le dernier but
      const { data: lastGoal } = await supabase
        .from('match_events')
        .select('*')
        .eq('match_id', matchId)
        .eq('event_type', 'goal')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!lastGoal) throw new Error('Aucun but à annuler')

      // Ajouter l'événement d'annulation
      await addEvent.mutateAsync({
        match_id: matchId,
        event_type: 'undo',
        team: lastGoal.team,
        player_id: lastGoal.player_id,
        set_number: lastGoal.set_number
      })

      // Mettre à jour le score
      const match = await supabase
        .from('matches')
        .select('score_a, score_b')
        .eq('id', matchId)
        .single()

      if (match.error) throw match.error

      const currentScore = match.data
      const newScore = {
        score_a: lastGoal.team === 'a' ? currentScore.score_a - 1 : currentScore.score_a,
        score_b: lastGoal.team === 'b' ? currentScore.score_b - 1 : currentScore.score_b
      }

      await updateMatch.mutateAsync({
        id: matchId,
        ...newScore
      })

      return newScore
    }
  })
} 