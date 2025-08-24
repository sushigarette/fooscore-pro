import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Venue, Table } from '@/lib/supabase'

// Récupérer tous les lieux
export const useVenues = () => {
  return useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select(`
          *,
          tables:tables(*)
        `)
        .order('name', { ascending: true })

      if (error) throw error
      return data as (Venue & { tables: Table[] })[]
    }
  })
}

// Récupérer un lieu spécifique
export const useVenue = (venueId: string) => {
  return useQuery({
    queryKey: ['venue', venueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select(`
          *,
          tables:tables(*)
        `)
        .eq('id', venueId)
        .single()

      if (error) throw error
      return data as Venue & { tables: Table[] }
    },
    enabled: !!venueId
  })
}

// Créer un nouveau lieu
export const useCreateVenue = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (venueData: Partial<Venue>) => {
      const { data, error } = await supabase
        .from('venues')
        .insert(venueData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
    }
  })
}

// Mettre à jour un lieu
export const useUpdateVenue = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Partial<Venue>) => {
      const { data, error } = await supabase
        .from('venues')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
      queryClient.invalidateQueries({ queryKey: ['venue', data.id] })
    }
  })
}

// Récupérer toutes les tables
export const useTables = (venueId?: string) => {
  return useQuery({
    queryKey: ['tables', venueId],
    queryFn: async () => {
      let query = supabase
        .from('tables')
        .select(`
          *,
          venue:venues(*)
        `)
        .order('name', { ascending: true })

      if (venueId) {
        query = query.eq('venue_id', venueId)
      }

      const { data, error } = await query
      if (error) throw error
      return data as (Table & { venue: Venue })[]
    }
  })
}

// Récupérer une table spécifique
export const useTable = (tableId: string) => {
  return useQuery({
    queryKey: ['table', tableId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tables')
        .select(`
          *,
          venue:venues(*)
        `)
        .eq('id', tableId)
        .single()

      if (error) throw error
      return data as Table & { venue: Venue }
    },
    enabled: !!tableId
  })
}

// Créer une nouvelle table
export const useCreateTable = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tableData: Partial<Table>) => {
      const { data, error } = await supabase
        .from('tables')
        .insert(tableData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      queryClient.invalidateQueries({ queryKey: ['venues'] })
      queryClient.invalidateQueries({ queryKey: ['venue', data.venue_id] })
    }
  })
}

// Mettre à jour une table
export const useUpdateTable = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Partial<Table>) => {
      const { data, error } = await supabase
        .from('tables')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      queryClient.invalidateQueries({ queryKey: ['table', data.id] })
      queryClient.invalidateQueries({ queryKey: ['venues'] })
      queryClient.invalidateQueries({ queryKey: ['venue', data.venue_id] })
    }
  })
}

// Rechercher une table par QR code
export const useTableByQRCode = (qrCode: string) => {
  return useQuery({
    queryKey: ['table-qr', qrCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tables')
        .select(`
          *,
          venue:venues(*)
        `)
        .eq('qr_code', qrCode)
        .eq('is_active', true)
        .single()

      if (error) throw error
      return data as Table & { venue: Venue }
    },
    enabled: !!qrCode
  })
} 