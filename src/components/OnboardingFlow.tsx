import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Twitter, Linkedin, Instagram, Facebook, ArrowRight, X } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [connecting, setConnecting] = useState<string | null>(null);

  const platforms = [
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700',
      hoverColor: 'hover:bg-blue-800',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500',
      hoverColor: 'hover:opacity-90',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
    },
  ];

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setConnecting(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center relative">
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Skip for now"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <CardTitle className="text-2xl font-bold">Connect Your Social Accounts</CardTitle>
          <CardDescription className="text-base">
            Connect your social media accounts to start automating your content.
            You can always add more accounts later from the Social Accounts tab.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              const isConnecting = connecting === platform.id;

              return (
                <button
                  key={platform.id}
                  onClick={() => handleConnect(platform.id)}
                  disabled={isConnecting}
                  className={`group relative p-6 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg ${
                    isConnecting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${platform.color} ${platform.hoverColor} rounded-xl flex items-center justify-center transition-colors`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {platform.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {isConnecting ? 'Connecting...' : 'Click to connect'}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onSkip}
              className="flex-1"
            >
              Skip for now
            </Button>
            <Button
              onClick={onComplete}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Continue to Dashboard
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500">
            Don't worry! You can connect or disconnect accounts anytime from the Social Accounts section.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
