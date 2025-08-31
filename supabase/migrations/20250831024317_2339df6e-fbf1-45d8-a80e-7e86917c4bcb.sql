-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  max_registrations INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event_registrations table for tracking participants
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS on both tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Everyone can view events" 
ON public.events 
FOR SELECT 
USING (true);

CREATE POLICY "Teachers can create events" 
ON public.events 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'teacher'
  )
);

CREATE POLICY "Teachers can update their own events" 
ON public.events 
FOR UPDATE 
USING (
  auth.uid() = created_by AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'teacher'
  )
);

CREATE POLICY "Teachers can delete their own events" 
ON public.events 
FOR DELETE 
USING (
  auth.uid() = created_by AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'teacher'
  )
);

-- Event registrations policies
CREATE POLICY "Users can view registrations for events they can see" 
ON public.event_registrations 
FOR SELECT 
USING (true);

CREATE POLICY "Students can register for events" 
ON public.event_registrations 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'student'
  )
);

CREATE POLICY "Users can cancel their own registrations" 
ON public.event_registrations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_created_by ON public.events(created_by);
CREATE INDEX idx_events_date ON public.events(date);
CREATE INDEX idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX idx_event_registrations_user_id ON public.event_registrations(user_id);