import { Calendar, Clock, TrendingUp, Users } from "lucide-react";
import { EventCard } from "@/components/ui/event-card";
import { StatsCard } from "@/components/ui/stats-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateEventDialog } from "@/components/ui/create-event-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import heroImage from "@/assets/hero-education.jpg";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const { user } = useAuth();
  const { events, loading } = useEvents();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
        
      setUserProfile(data);
    };
    
    fetchProfile();
  }, [user]);

  const upcomingEvents = events.filter(e => e.status === 'upcoming').slice(0, 3);
  const totalEvents = events.length;
  const totalRegistrations = events.reduce((sum, event) => sum + (event.registrations || 0), 0);
  const upcomingCount = events.filter(e => e.status === 'upcoming').length;
  const participationRate = totalEvents > 0 ? Math.round((totalRegistrations / (events.reduce((sum, event) => sum + event.max_registrations, 0))) * 100) : 0;
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-80 overflow-hidden rounded-2xl mx-6 mt-6">
        <img 
          src={heroImage} 
          alt="School Events Management" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Welcome to EduSync
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl">
              Manage and organize all your school events efficiently in one place
            </p>
            {userProfile?.role !== 'participant' && (
              <CreateEventDialog>
                <Button size="lg" variant="secondary" className="mt-4">
                  Create New Event
                </Button>
              </CreateEventDialog>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Events"
            value={totalEvents.toString()}
            description="All events"
            icon={Calendar}
          />
          <StatsCard
            title="Active Registrations"
            value={totalRegistrations.toString()}
            description="Across all events"
            icon={Users}
          />
          <StatsCard
            title="Upcoming Events"
            value={upcomingCount.toString()}
            description="Next events"
            icon={Clock}
          />
          <StatsCard
            title="Participation Rate"
            value={`${participationRate}%`}
            description="Average attendance"
            icon={TrendingUp}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-card rounded-xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {userProfile?.role !== 'participant' && (
              <CreateEventDialog>
                <Button variant="default" className="flex-1 min-w-[200px]">
                  Create New Event
                </Button>
              </CreateEventDialog>
            )}
            <Button variant="outline" className="flex-1 min-w-[200px]">
              View Calendar
            </Button>
            <Button variant="outline" className="flex-1 min-w-[200px]">
              Export Reports
            </Button>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Upcoming Events</h2>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {upcomingEvents.length} upcoming
              </Badge>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No upcoming events</h3>
              <p className="text-muted-foreground">
                {userProfile?.role === 'participant' 
                  ? "Check back later for new events."
                  : "Create your first event to get started!"
                }
              </p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-card rounded-xl p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-sm text-foreground">New registration for Science Fair</span>
              </div>
              <span className="text-xs text-muted-foreground">2 mins ago</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-sm text-foreground">Sports Competition venue changed</span>
              </div>
              <span className="text-xs text-muted-foreground">1 hour ago</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-foreground">Cultural Evening started</span>
              </div>
              <span className="text-xs text-muted-foreground">3 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}