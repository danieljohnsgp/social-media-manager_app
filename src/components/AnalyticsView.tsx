import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, Heart, MessageCircle, Share2, Eye, Loader2 } from 'lucide-react';

export function AnalyticsView() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_data')
        .select('*, content_posts(content, platforms)')
        .eq('user_id', user!.id)
        .order('recorded_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAnalytics(data || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalMetrics = analytics.reduce(
    (acc, curr) => ({
      likes: acc.likes + curr.likes,
      comments: acc.comments + curr.comments,
      shares: acc.shares + curr.shares,
      views: acc.views + curr.views,
    }),
    { likes: 0, comments: 0, shares: 0, views: 0 }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Track your social media performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Likes</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {totalMetrics.likes.toLocaleString()}
                </p>
              </div>
              <div className="bg-red-500 p-3 rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Comments</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {totalMetrics.comments.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Shares</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {totalMetrics.shares.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg">
                <Share2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {totalMetrics.views.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-500 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Post Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No analytics yet</h3>
              <p className="text-gray-600">
                Publish posts to start tracking your performance
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded capitalize">
                      {item.platform}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(item.recorded_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-600">Likes</p>
                      <p className="text-lg font-semibold text-gray-900">{item.likes}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Comments</p>
                      <p className="text-lg font-semibold text-gray-900">{item.comments}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Shares</p>
                      <p className="text-lg font-semibold text-gray-900">{item.shares}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Views</p>
                      <p className="text-lg font-semibold text-gray-900">{item.views}</p>
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
