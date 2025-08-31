import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Profile {
  first_name: string;
  last_name: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  creator: Profile;  // Changed from profiles to creator to match the query
  creator_name?: string;
}

export default function Announcements() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    fetchAnnouncements();
    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    setUserProfile(data);
  };

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          id,
          title,
          content,
          created_by,
          created_at,
          creator:profiles!announcements_created_by_fkey (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAnnouncements(
        data?.map((announcement) => ({
          ...announcement,
          creator_name: announcement.creator ? 
            `${announcement.creator.first_name} ${announcement.creator.last_name}` : 
            'Unknown'
        })) || []
      );
    } catch (error: any) {
      toast({
        title: "Error fetching announcements",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async () => {
    if (!user) return;
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast({
        title: "Missing fields",
        description: "Please fill in both title and content",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('announcements')
        .insert([{
          title: newAnnouncement.title,
          content: newAnnouncement.content,
          created_by: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Announcement created",
        description: "Your announcement has been posted successfully"
      });

      setNewAnnouncement({ title: '', content: '' });
      fetchAnnouncements();
    } catch (error: any) {
      toast({
        title: "Error creating announcement",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Announcement deleted",
        description: "The announcement has been removed"
      });

      fetchAnnouncements();
    } catch (error: any) {
      toast({
        title: "Error deleting announcement",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Announcements</h1>
        </div>

        {userProfile?.role !== 'participant' && (
          <div className="bg-card p-6 rounded-lg shadow-soft space-y-4">
            <h2 className="text-xl font-semibold">Create Announcement</h2>
            <Input
              placeholder="Announcement Title"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
            />
            <Textarea
              placeholder="Announcement Content"
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
            />
            <Button onClick={createAnnouncement} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Post Announcement
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading announcements...</div>
          ) : announcements.length === 0 ? (
            <div className="text-center text-muted-foreground">No announcements yet</div>
          ) : (
            announcements.map((announcement) => (
              <div key={announcement.id} className="bg-card p-6 rounded-lg shadow-soft">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{announcement.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      By {announcement.creator_name} • {new Date(announcement.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {user?.id === announcement.created_by && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAnnouncement(announcement.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <p className="mt-4 whitespace-pre-wrap">{announcement.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}