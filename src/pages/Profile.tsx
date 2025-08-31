import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, Users } from 'lucide-react';
import { Event } from '@/hooks/useEvents';

export default function Profile() {
  const { user } = useAuth();
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Get user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        setProfile(profileData);

        // Get events user is registered for
        const { data: registrations } = await supabase
          .from('event_registrations')
          .select(`
            event_id,
            registered_at,
            events (*)
          `)
          .eq('user_id', user.id);

        if (registrations) {
          const eventsWithRegistrations = await Promise.all(
            registrations.map(async (reg: any) => {
              const { count } = await supabase
                .from('event_registrations')
                .select('*', { count: 'exact', head: true })
                .eq('event_id', reg.event_id);

              return {
                ...reg.events,
                registrations: count || 0,
                registered_at: reg.registered_at,
                is_registered: true
              };
            })
          );

          setUserEvents(eventsWithRegistrations);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to view your profile.</p>
      </div>
    );
  }

  const statusColors = {
    upcoming: "text-primary",
    ongoing: "text-success", 
    completed: "text-muted-foreground",
  };

  const categoryColors = {
    Academic: "bg-primary text-primary-foreground",
    Sports: "bg-success text-success-foreground", 
    Cultural: "bg-accent text-accent-foreground",
    Competition: "bg-warning text-warning-foreground",
    Workshop: "bg-secondary text-secondary-foreground",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <User className="h-6 w-6" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Display Name</p>
                <p className="font-medium">{profile?.display_name || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <Badge variant="secondary" className="capitalize">
                  {profile?.role || 'student'}
                </Badge>
              </div>
              {profile?.role === 'student' && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Student ID</p>
                    <p className="font-medium">{profile?.student_id || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Grade</p>
                    <p className="font-medium">{profile?.grade || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Section</p>
                    <p className="font-medium">{profile?.section || 'Not set'}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Registered Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-3">
                <Calendar className="h-6 w-6" />
                My Events ({userEvents.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No events yet</h3>
                <p className="text-muted-foreground">
                  {profile?.role === 'teacher' 
                    ? "You haven't created any events yet."
                    : "You haven't registered for any events yet."
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {userEvents.map((event) => {
                  const registrationPercentage = (event.registrations || 0) / event.max_registrations * 100;
                  
                  return (
                    <Card key={event.id} className="bg-gradient-card shadow-soft">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                              {event.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              {event.description}
                            </p>
                          </div>
                          <Badge className={categoryColors[event.category as keyof typeof categoryColors] || "bg-muted text-muted-foreground"}>
                            {event.category}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span className={statusColors[event.status]}>
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-2 h-4 w-4" />
                            <span>{event.time}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="mr-2 h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm mb-2">
                          <div className="flex items-center text-muted-foreground">
                            <Users className="mr-2 h-4 w-4" />
                            <span>{event.registrations}/{event.max_registrations} registered</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-muted-foreground">
                              {registrationPercentage.toFixed(0)}% filled
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {event.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(registrationPercentage, 100)}%` }}
                          />
                        </div>
                        
                        {event.registered_at && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <p className="text-xs text-muted-foreground">
                              Registered on {new Date(event.registered_at).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}