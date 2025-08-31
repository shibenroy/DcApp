import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import { Event } from "@/hooks/useEvents";
import { supabase } from "@/integrations/supabase/client";

interface EventCardProps {
  event: Event;
  className?: string;
}

const categoryColors = {
  Academic: "bg-primary text-primary-foreground",
  Sports: "bg-success text-success-foreground", 
  Cultural: "bg-accent text-accent-foreground",
  Competition: "bg-warning text-warning-foreground",
  Workshop: "bg-secondary text-secondary-foreground",
};

const statusColors = {
  upcoming: "text-primary",
  ongoing: "text-success", 
  completed: "text-muted-foreground",
};

export function EventCard({ event, className }: EventCardProps) {
  const { user } = useAuth();
  const { registerForEvent, unregisterFromEvent } = useEvents();
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const registrationPercentage = ((event.registrations || 0) / event.max_registrations) * 100;

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

  const handleButtonClick = () => {
    if (!user) return;
    
    if (event.is_registered) {
      unregisterFromEvent(event.id);
    } else {
      registerForEvent(event.id);
    }
  };

  const getButtonText = () => {
    if (event.status === "completed") return "View Results";
    if (event.status === "ongoing") return event.is_registered ? "Leave Event" : "Join Now";
    return event.is_registered ? "Unregister" : "Register";
  };

  const isDisabled = () => {
    if (!user) return true;
    if (event.status === "completed") return true;
    if (!event.is_registered && (event.registrations || 0) >= event.max_registrations) return true;
    return false;
  };

  return (
    <Card className={cn("bg-gradient-card shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-foreground line-clamp-2">
            {event.title}
          </CardTitle>
          <Badge className={categoryColors[event.category as keyof typeof categoryColors] || "bg-muted text-muted-foreground"}>
            {event.category}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
          {event.description}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-3">
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
          <span className="line-clamp-1">{event.location}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-muted-foreground">
            <Users className="mr-2 h-4 w-4" />
            <span>{event.registrations || 0}/{event.max_registrations} registered</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {registrationPercentage.toFixed(0)}% filled
          </span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${Math.min(registrationPercentage, 100)}%` }}
          />
        </div>
      </CardContent>
      
      <CardFooter className="pt-3">
        <Button 
          className="w-full" 
          variant={event.is_registered ? "secondary" : "default"}
          disabled={isDisabled()}
          onClick={handleButtonClick}
        >
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
}