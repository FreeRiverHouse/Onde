'use client';

import { useState, useEffect } from 'react';
import {
  Zap, Cloud, HardDrive, CheckCircle, XCircle, Loader2,
  Send, Settings, ChevronDown, ChevronUp, ExternalLink, Copy
} from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  type: 'cloud' | 'local';
  baseUrl: string;
  models: string[];
  description: string;
  docsUrl?: string;
}

interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  selectedModel: string;
  enabled: boolean;
  status: 'unknown' | 'testing' | 'connected' | 'error';
  latency?: number;
  errorMessage?: string;
}

const PROVIDERS: Provider[] = [
  { id: 'openai', name: 'OpenAI', type: 'cloud', baseUrl: 'https://api.openai.com/v1', models: ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'], description: 'GPT-4, GPT-3.5 Turbo', docsUrl: 'https://platform.openai.com' },
  { id: 'anthropic', name: 'Anthropic', type: 'cloud', baseUrl: 'https://api.anthropic.com/v1', models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'], description: 'Claude 3.5 Sonnet, Opus', docsUrl: 'https://console.anthropic.com' },
  { id: 'grok', name: 'Grok (xAI)', type: 'cloud', baseUrl: 'https://api.x.ai/v1', models: ['grok-2-latest', 'grok-beta'], description: 'Grok 2', docsUrl: 'https://console.x.ai' },
  { id: 'deepseek', name: 'DeepSeek', type: 'cloud', baseUrl: 'https://api.deepseek.com/v1', models: ['deepseek-chat', 'deepseek-coder'], description: 'Chat & Coder', docsUrl: 'https://platform.deepseek.com' },
  { id: 'kimi', name: 'Kimi (Moonshot)', type: 'cloud', baseUrl: 'https://api.moonshot.cn/v1', models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'], description: '128k context', docsUrl: 'https://platform.moonshot.cn' },
  { id: 'groq', name: 'Groq', type: 'cloud', baseUrl: 'https://api.groq.com/openai/v1', models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'], description: 'Ultra-fast Llama/Mixtral', docsUrl: 'https://console.groq.com' },
  { id: 'together', name: 'Together AI', type: 'cloud', baseUrl: 'https://api.together.xyz/v1', models: ['meta-llama/Llama-3-70b-chat-hf', 'mistralai/Mixtral-8x7B-Instruct-v0.1'], description: 'Open source models', docsUrl: 'https://api.together.xyz' },
  { id: 'openrouter', name: 'OpenRouter', type: 'cloud', baseUrl: 'https://openrouter.ai/api/v1', models: ['anthropic/claude-3.5-sonnet', 'openai/gpt-4-turbo'], description: 'Multi-provider gateway', docsUrl: 'https://openrouter.ai' },
  { id: 'ollama', name: 'Ollama', type: 'local', baseUrl: 'http://localhost:11434/api', models: ['llama3', 'mistral', 'codellama', 'phi3'], description: 'Local models', docsUrl: 'https://ollama.ai' },
  { id: 'lmstudio', name: 'LM Studio', type: 'local', baseUrl: 'http://localhost:1234/v1', models: ['local-model'], description: 'Local server', docsUrl: 'https://lmstudio.ai' },
];

const CONFIG_KEY = 'llm-router-config';

export default function Home() {
  const [activeProvider, setActiveProvider] = useState<string>('openai');
  const [configs, setConfigs] = useState<Record<string, ProviderConfig>>({});
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState('Hello! Please respond with a short greeting.');
  const [testResponse, setTestResponse] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  // Load config from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setConfigs(parsed.configs || {});
      setActiveProvider(parsed.activeProvider || 'openai');
    } else {
      // Initialize default configs
      const defaults: Record<string, ProviderConfig> = {};
      PROVIDERS.forEach(p => {
        defaults[p.id] = {
          apiKey: '',
          baseUrl: p.baseUrl,
          selectedModel: p.models[0],
          enabled: false,
          status: 'unknown',
        };
      });
      setConfigs(defaults);
    }
  }, []);

  // Save config
  const saveConfig = (newConfigs: Record<string, ProviderConfig>, newActive?: string) => {
    const toSave = { configs: newConfigs, activeProvider: newActive || activeProvider };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(toSave));
    setConfigs(newConfigs);
    if (newActive) setActiveProvider(newActive);
  };

  // Test provider connection
  const testConnection = async (providerId: string) => {
    const provider = PROVIDERS.find(p => p.id === providerId);
    const config = configs[providerId];
    if (!provider || !config) return;

    setConfigs(prev => ({
      ...prev,
      [providerId]: { ...prev[providerId], status: 'testing' },
    }));

    try {
      const res = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          apiKey: config.apiKey,
          baseUrl: config.baseUrl,
        }),
      });
      const result = await res.json();

      const newConfigs = {
        ...configs,
        [providerId]: {
          ...configs[providerId],
          status: result.success ? 'connected' : 'error',
          latency: result.latency,
          errorMessage: result.success ? undefined : result.message,
          enabled: result.success,
        },
      };
      saveConfig(newConfigs as Record<string, ProviderConfig>);
    } catch (error: any) {
      setConfigs(prev => ({
        ...prev,
        [providerId]: { ...prev[providerId], status: 'error', errorMessage: error.message },
      }));
    }
  };

  // Send test chat
  const sendTestChat = async () => {
    const provider = PROVIDERS.find(p => p.id === activeProvider);
    const config = configs[activeProvider];
    if (!provider || !config) return;

    setIsTesting(true);
    setTestResponse('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: activeProvider,
          config,
          messages: [{ role: 'user', content: testMessage }],
        }),
      });
      const result = await res.json();

      if (result.success) {
        setTestResponse(result.content);
      } else {
        setTestResponse(`Error: ${result.error}`);
      }
    } catch (error: any) {
      setTestResponse(`Error: ${error.message}`);
    }

    setIsTesting(false);
  };

  const updateConfig = (providerId: string, updates: Partial<ProviderConfig>) => {
    const newConfigs = {
      ...configs,
      [providerId]: { ...configs[providerId], ...updates },
    };
    saveConfig(newConfigs);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'testing': return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default: return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const activeConfig = configs[activeProvider];
  const activeProviderData = PROVIDERS.find(p => p.id === activeProvider);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LLM Router</h1>
                <p className="text-sm text-gray-500">ClawdBot Multi-Provider</p>
              </div>
            </div>

            {/* Active Provider Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Active:</span>
              <select
                value={activeProvider}
                onChange={(e) => saveConfig(configs, e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white font-medium"
              >
                {PROVIDERS.filter(p => configs[p.id]?.enabled || configs[p.id]?.status === 'connected').map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
                {PROVIDERS.filter(p => !configs[p.id]?.enabled && configs[p.id]?.status !== 'connected').length > 0 && (
                  <option disabled>─── Not Connected ───</option>
                )}
                {PROVIDERS.filter(p => !configs[p.id]?.enabled && configs[p.id]?.status !== 'connected').map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Provider List */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Providers</h2>

            {/* Cloud Providers */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Cloud className="w-4 h-4" /> Cloud APIs
              </h3>
              {PROVIDERS.filter(p => p.type === 'cloud').map(provider => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  config={configs[provider.id]}
                  isExpanded={expandedProvider === provider.id}
                  isActive={activeProvider === provider.id}
                  onToggleExpand={() => setExpandedProvider(expandedProvider === provider.id ? null : provider.id)}
                  onUpdateConfig={(updates) => updateConfig(provider.id, updates)}
                  onTest={() => testConnection(provider.id)}
                  onSetActive={() => saveConfig(configs, provider.id)}
                  getStatusIcon={getStatusIcon}
                />
              ))}
            </div>

            {/* Local Providers */}
            <div className="space-y-2 mt-6">
              <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <HardDrive className="w-4 h-4" /> Local Models
              </h3>
              {PROVIDERS.filter(p => p.type === 'local').map(provider => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  config={configs[provider.id]}
                  isExpanded={expandedProvider === provider.id}
                  isActive={activeProvider === provider.id}
                  onToggleExpand={() => setExpandedProvider(expandedProvider === provider.id ? null : provider.id)}
                  onUpdateConfig={(updates) => updateConfig(provider.id, updates)}
                  onTest={() => testConnection(provider.id)}
                  onSetActive={() => saveConfig(configs, provider.id)}
                  getStatusIcon={getStatusIcon}
                />
              ))}
            </div>
          </div>

          {/* Test Panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border p-4 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Chat</h2>

              <div className="mb-3">
                <div className="text-sm text-gray-500 mb-1">Provider</div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  {getStatusIcon(activeConfig?.status || 'unknown')}
                  <span className="font-medium">{activeProviderData?.name}</span>
                  <span className="text-sm text-gray-500">({activeConfig?.selectedModel})</span>
                </div>
              </div>

              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Enter test message..."
                className="w-full p-3 border rounded-lg resize-none h-24 text-sm"
              />

              <button
                onClick={sendTestChat}
                disabled={isTesting || !activeConfig?.enabled}
                className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isTesting ? 'Sending...' : 'Send Test'}
              </button>

              {testResponse && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Response:</div>
                  <div className="text-sm whitespace-pre-wrap">{testResponse}</div>
                </div>
              )}

              {/* Proxy Config */}
              <div className="mt-6 pt-4 border-t">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Proxy Endpoint</h3>
                <div className="text-xs text-gray-500 mb-2">
                  Use this endpoint to route requests through the active provider:
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-gray-100 rounded text-xs font-mono">
                    http://localhost:3333/api/chat
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText('http://localhost:3333/api/chat')}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProviderCard({
  provider,
  config,
  isExpanded,
  isActive,
  onToggleExpand,
  onUpdateConfig,
  onTest,
  onSetActive,
  getStatusIcon,
}: {
  provider: Provider;
  config?: ProviderConfig;
  isExpanded: boolean;
  isActive: boolean;
  onToggleExpand: () => void;
  onUpdateConfig: (updates: Partial<ProviderConfig>) => void;
  onTest: () => void;
  onSetActive: () => void;
  getStatusIcon: (status: string) => JSX.Element;
}) {
  return (
    <div className={`bg-white rounded-xl border ${isActive ? 'ring-2 ring-blue-500' : ''}`}>
      <div
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3">
          {getStatusIcon(config?.status || 'unknown')}
          <div>
            <div className="font-medium text-gray-900">{provider.name}</div>
            <div className="text-sm text-gray-500">{provider.description}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {config?.latency && (
            <span className="text-xs text-gray-400">{config.latency}ms</span>
          )}
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t pt-4 space-y-3">
          {config?.errorMessage && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {config.errorMessage}
            </div>
          )}

          {provider.type === 'cloud' && (
            <div>
              <label className="text-sm font-medium text-gray-700">API Key</label>
              <input
                type="password"
                value={config?.apiKey || ''}
                onChange={(e) => onUpdateConfig({ apiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Base URL</label>
            <input
              type="text"
              value={config?.baseUrl || provider.baseUrl}
              onChange={(e) => onUpdateConfig({ baseUrl: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-mono"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Model</label>
            <select
              value={config?.selectedModel || provider.models[0]}
              onChange={(e) => onUpdateConfig({ selectedModel: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
            >
              {provider.models.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={(e) => { e.stopPropagation(); onTest(); }}
              className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Test Connection
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onSetActive(); }}
              disabled={config?.status !== 'connected'}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              Set Active
            </button>
          </div>

          {provider.docsUrl && (
            <a
              href={provider.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              <ExternalLink className="w-3 h-3" /> Get API Key
            </a>
          )}
        </div>
      )}
    </div>
  );
}
