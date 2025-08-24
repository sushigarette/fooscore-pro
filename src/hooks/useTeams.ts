import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Team, TeamMember } from '@/lib/supabase'

// Récupérer toutes les équipes
export const useTeams = (venueId?: string) => {
  return useQuery({
    queryKey: ['teams', venueId],
    queryFn: async () => {
      let query = supabase
        .from('teams')
        .select(`
          *,
          members:team_members(
            *,
            user:users(*)
          )
        `)
        .order('created_at', { ascending: false })

      if (venueId) {
        query = query.eq('venue_id', venueId)
      }

      const { data, error } = await query
      if (error) throw error
      return data as (Team & {
        members: (TeamMember & { user: any })[]
      })[]
    }
  })
}

// Récupérer une équipe spécifique
export const useTeam = (teamId: string) => {
  return useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          members:team_members(
            *,
            user:users(*)
          )
        `)
        .eq('id', teamId)
        .single()

      if (error) throw error
      return data as Team & {
        members: (TeamMember & { user: any })[]
      }
    },
    enabled: !!teamId
  })
}

// Créer une nouvelle équipe
export const useCreateTeam = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (teamData: Partial<Team>) => {
      const { data, error } = await supabase
        .from('teams')
        .insert(teamData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    }
  })
}

// Mettre à jour une équipe
export const useUpdateTeam = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Partial<Team>) => {
      const { data, error } = await supabase
        .from('teams')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['team', data.id] })
    }
  })
}

// Ajouter un membre à une équipe
export const useAddTeamMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (memberData: Partial<TeamMember>) => {
      const { data, error } = await supabase
        .from('team_members')
        .insert(memberData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['team', data.team_id] })
    }
  })
}

// Supprimer un membre d'une équipe
export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId)

      if (error) throw error
      return { teamId, userId }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['team', data.teamId] })
    }
  })
}

// Créer une équipe temporaire pour un match
export const useCreateTemporaryTeam = () => {
  const createTeam = useCreateTeam()
  const addMember = useAddTeamMember()

  return useMutation({
    mutationFn: async ({ 
      name, 
      venueId, 
      memberIds 
    }: { 
      name: string
      venueId: string
      memberIds: string[]
    }) => {
      // Créer l'équipe temporaire
      const team = await createTeam.mutateAsync({
        name,
        venue_id: venueId,
        is_permanent: false
      })

      // Ajouter les membres
      for (const userId of memberIds) {
        await addMember.mutateAsync({
          team_id: team.id,
          user_id: userId,
          role: 'member'
        })
      }

      return team
    }
  })
} 