import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Share2, Loader2, CheckCircle2, Plus } from 'lucide-react';

export function SocialAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    platform: 'twitter',
    account_name: '',
    account_handle: '',
  });
  const [saving, setSaving] = useState(false);

  const platforms = [
    { id: 'twitter', name: 'Twitter', icon: '𝕏', color: 'bg-black' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-blue-700' },
    { id: 'instagram', name: 'Instagram', icon: '📷', color: 'bg-pink-600' },
    { id: 'facebook', name: 'Facebook', icon: '📘', color: 'bg-blue-600' },
  ];

  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user]);

  const loadAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await fetch('https://danieljohnsgp.app.n8n.cloud/webhook-test/connect-social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: formData.platform,
          userId: user!.id,
          timestamp: new Date().toISOString(),
        }),
      }).catch((err) => console.error('Webhook error:', err));

      const { error } = await supabase.from('social_accounts').insert({
        user_id: user!.id,
        platform: formData.platform,
        account_name: formData.account_name,
        account_handle: formData.account_handle,
        is_connected: true,
      });

      if (error) throw error;

      setFormData({ platform: 'twitter', account_name: '', account_handle: '' });
      setShowAddForm(false);
      loadAccounts();
    } catch (error) {
      console.error('Error adding account:', error);
    } finally {
      setSaving(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Social Accounts</h1>
          <p className="text-gray-600 mt-1">Connect your social media accounts</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Connect New Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <Label htmlFor="platform">Platform</Label>
                <select
                  id="platform"
                  value={formData.platform}
                  onChange={(e) =>
                    setFormData({ ...formData, platform: e.target.value })
                  }
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {platforms.map((platform) => (
                    <option key={platform.id} value={platform.id}>
                      {platform.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="account_name">Account Name</Label>
                <Input
                  id="account_name"
                  value={formData.account_name}
                  onChange={(e) =>
                    setFormData({ ...formData, account_name: e.target.value })
                  }
                  placeholder="e.g., My Business Page"
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="account_handle">Account Handle</Label>
                <Input
                  id="account_handle"
                  value={formData.account_handle}
                  onChange={(e) =>
                    setFormData({ ...formData, account_handle: e.target.value })
                  }
                  placeholder="e.g., @mybusiness"
                  className="mt-2"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Connect Account
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="text-center py-12">
              <Share2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No accounts connected
              </h3>
              <p className="text-gray-600">
                Connect your social media accounts to start automating
              </p>
            </CardContent>
          </Card>
        ) : (
          accounts.map((account) => {
            const platform = platforms.find((p) => p.id === account.platform);
            return (
              <Card key={account.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`${platform?.color} p-3 rounded-lg text-2xl`}>
                      {platform?.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {account.account_name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {account.account_handle}
                      </p>
                      <div className="mt-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          Connected
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
