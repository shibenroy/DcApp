import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  location: string;
  category: string;
  max_registrations: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  created_by: string;
  created_at: string;
  updated_at: string;
  registrations?: number;
  is_registered?: boolean;
  registered_at?: string;
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Get events with registration count
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          event_registrations!inner(count)
        `)
        .order('date', { ascending: true });

      if (eventsError) throw eventsError;

      // Get user's registrations if logged in
      let userRegistrations: string[] = [];
      if (user) {
        const { data: registrationsData, error: registrationsError } = await supabase
          .from('event_registrations')
          .select('event_id')
          .eq('user_id', user.id);

        if (registrationsError) throw registrationsError;
        userRegistrations = registrationsData?.map(r => r.event_id) || [];
      }

      // Process events data
      const processedEvents = await Promise.all(
        eventsData?.map(async (event) => {
          // Get registration count for this event
          const { count } = await supabase
            .from('event_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id);

          return {
            id: event.id,
            title: event.title,
            description: event.description,
            date: event.date,
            time: event.time,
            location: event.location,
            category: event.category,
            max_registrations: event.max_registrations,
            status: event.status as 'upcoming' | 'ongoing' | 'completed',
            created_by: event.created_by,
            created_at: event.created_at,
            updated_at: event.updated_at,
            registrations: count || 0,
            is_registered: userRegistrations.includes(event.id)
          };
        }) || []
      );

      setEvents(processedEvents);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive"
      });
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Omit<Event, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'registrations' | 'is_registered'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('events')
        .insert([{
          ...eventData,
          created_by: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event created successfully!"
      });

      await fetchEvents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const registerForEvent = async (eventId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert([{
          event_id: eventId,
          user_id: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully registered for event!"
      });

      await fetchEvents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message === 'duplicate key value violates unique constraint "event_registrations_event_id_user_id_key"' 
          ? "You are already registered for this event"
          : error.message,
        variant: "destructive"
      });
    }
  };

  const unregisterFromEvent = async (eventId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully unregistered from event"
      });

      await fetchEvents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  return {
    events,
    loading,
    createEvent,
    registerForEvent,
    unregisterFromEvent,
    refetch: fetchEvents
  };
}