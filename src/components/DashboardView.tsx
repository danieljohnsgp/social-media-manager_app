import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  TrendingUp,
  Calendar,
  FileText,
  Users,
  Loader2
} from 'lucide-react';

interface Stats {
  totalPosts: number;
  scheduledPosts: number;
  connectedAccounts: number;
  avgEngagement: number;
}

export function DashboardView() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    scheduledPosts: 0,
    connectedAccounts: 0,
    avgEngagement: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [postsData, accountsData, analyticsData] = await Promise.all([
        supabase
          .from('content_posts')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('social_accounts')
          .select('*')
          .eq('user_id', user!.id)
          .eq('is_connected', true),
        supabase
          .from('analytics_data')
          .select('engagement_rate')
          .eq('user_id', user!.id),
      ]);

      const scheduledCount = postsData.data?.filter(
        (p) => p.status === 'scheduled'
      ).length || 0;

      const avgEng =
        analyticsData.data && analyticsData.data.length > 0
          ? analyticsData.data.reduce((acc, curr) => acc + (curr.engagement_rate || 0), 0) /
            analyticsData.data.length
          : 0;

      setStats({
        totalPosts: postsData.data?.length || 0,
        scheduledPosts: scheduledCount,
        connectedAccounts: accountsData.data?.length || 0,
        avgEngagement: avgEng,
      });

      setRecentPosts(postsData.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Posts',
      value: stats.totalPosts,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'Scheduled',
      value: stats.scheduledPosts,
      icon: Calendar,
      color: 'bg-green-500',
    },
    {
      title: 'Connected Accounts',
      value: stats.connectedAccounts,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      title: 'Avg Engagement',
      value: `${stats.avgEngagement.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPosts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No posts yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Create your first post using the AI Creator
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            post.status === 'published'
                              ? 'bg-green-100 text-green-700'
                              : post.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {post.status}
                        </span>
                        {post.platforms && post.platforms.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {post.platforms.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
