import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Calendar, Loader2, CheckCircle2 } from 'lucide-react';

export function SchedulerView() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    scheduled_for: '',
    platforms: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  const platforms = ['twitter', 'linkedin', 'instagram', 'facebook'];

  useEffect(() => {
    if (user) {
      loadScheduledPosts();
    }
  }, [user]);

  const loadScheduledPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'scheduled')
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase.from('content_posts').insert({
        user_id: user!.id,
        content: formData.content,
        platforms: formData.platforms,
        status: 'scheduled',
        scheduled_for: new Date(formData.scheduled_for).toISOString(),
      });

      if (error) throw error;

      setFormData({ content: '', scheduled_for: '', platforms: [] });
      setShowScheduleForm(false);
      loadScheduledPosts();
    } catch (error) {
      console.error('Error scheduling post:', error);
    } finally {
      setSaving(false);
    }
  };

  const togglePlatform = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scheduler</h1>
          <p className="text-gray-600 mt-1">Schedule your posts for optimal engagement</p>
        </div>
        <Button onClick={() => setShowScheduleForm(!showScheduleForm)}>
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Post
        </Button>
      </div>

      {showScheduleForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Schedule New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <Label htmlFor="content">Post Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="What would you like to post?"
                  className="mt-2 min-h-[100px]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="scheduled_for">Schedule Date & Time</Label>
                <Input
                  id="scheduled_for"
                  type="datetime-local"
                  value={formData.scheduled_for}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduled_for: e.target.value })
                  }
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label>Select Platforms</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  {platforms.map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => togglePlatform(platform)}
                      className={`p-3 border-2 rounded-lg capitalize transition-all ${
                        formData.platforms.includes(platform)
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={saving || formData.platforms.length === 0}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Schedule Post
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowScheduleForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No scheduled posts
              </h3>
              <p className="text-gray-600">
                Schedule your posts to automate your social media presence
              </p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base mb-2">
                      {new Date(post.scheduled_for).toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </CardTitle>
                    <div className="flex gap-2">
                      {post.platforms?.map((platform: string) => (
                        <span
                          key={platform}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded capitalize"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
