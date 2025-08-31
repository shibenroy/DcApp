import { useState, useEffect } from "react";
import { Calendar, Filter, Plus, Search } from "lucide-react";
import { EventCard } from "@/components/ui/event-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CreateEventDialog } from "@/components/ui/create-event-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = ["All", "Academic", "Sports", "Cultural", "Workshop", "Competition"];
const statuses = ["All", "upcoming", "ongoing", "completed"];

export default function Events() {
  const { user } = useAuth();
  const { events, loading } = useEvents();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

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

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
    const matchesStatus = selectedStatus === "All" || event.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const eventCounts = {
    total: events.length,
    upcoming: events.filter(e => e.status === "upcoming").length,
    ongoing: events.filter(e => e.status === "ongoing").length,
    completed: events.filter(e => e.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">All Events</h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize your school events
            </p>
          </div>
          {userProfile?.role !== 'participant' && (
            <CreateEventDialog>
              <Button className="w-fit">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </CreateEventDialog>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-card rounded-lg p-4 shadow-soft">
            <div className="text-2xl font-bold text-foreground">{eventCounts.total}</div>
            <div className="text-sm text-muted-foreground">Total Events</div>
          </div>
          <div className="bg-gradient-card rounded-lg p-4 shadow-soft">
            <div className="text-2xl font-bold text-primary">{eventCounts.upcoming}</div>
            <div className="text-sm text-muted-foreground">Upcoming</div>
          </div>
          <div className="bg-gradient-card rounded-lg p-4 shadow-soft">
            <div className="text-2xl font-bold text-success">{eventCounts.ongoing}</div>
            <div className="text-sm text-muted-foreground">Ongoing</div>
          </div>
          <div className="bg-gradient-card rounded-lg p-4 shadow-soft">
            <div className="text-2xl font-bold text-muted-foreground">{eventCounts.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gradient-card rounded-xl p-6 shadow-soft">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[130px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "All" ? "All Status" : 
                       status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedCategory !== "All" || selectedStatus !== "All" || searchTerm) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedCategory !== "All" && (
                <Badge variant="secondary" className="text-xs">
                  Category: {selectedCategory}
                </Badge>
              )}
              {selectedStatus !== "All" && (
                <Badge variant="secondary" className="text-xs">
                  Status: {selectedStatus}
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Search: "{searchTerm}"
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedStatus("All");
                  setSearchTerm("");
                }}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Events Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              {filteredEvents.length} Events Found
            </h2>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No events found</h3>
              <p className="text-muted-foreground">
                {events.length === 0 
                  ? userProfile?.role !== 'participant'
                    ? "Create your first event to get started!"
                    : "No events available yet."
                  : "Try adjusting your search criteria."
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}