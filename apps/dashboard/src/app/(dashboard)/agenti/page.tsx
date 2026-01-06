'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, MessageSquare, Zap, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Agent {
  id: string;
  type: 'editor' | 'marketer' | 'branding' | 'gtm' | 'social';
  name: string;
  description: string;
  status: 'idle' | 'working' | 'offline';
  capabilities: string[];
  lastActive?: string;
}

const agents: Agent[] = [
  {
    id: 'editor',
    type: 'editor',
    name: 'Editor Agent',
    description: 'Revisione e editing automatico dei contenuti',
    status: 'idle',
    capabilities: ['Controllo grammaticale', 'Miglioramento stile', 'Proofreading'],
    lastActive: '2 ore fa',
  },
  {
    id: 'marketer',
    type: 'marketer',
    name: 'Marketer Agent',
    description: 'Generazione strategie marketing e campagne',
    status: 'idle',
    capabilities: ['Strategia marketing', 'Suggerimenti campagne', 'Analisi trend'],
  },
  {
    id: 'branding',
    type: 'branding',
    name: 'Branding Agent',
    description: 'Creazione e gestione identita brand',
    status: 'idle',
    capabilities: ['Brand guidelines', 'Visual identity', 'Messaging'],
  },
  {
    id: 'gtm',
    type: 'gtm',
    name: 'GTM Agent',
    description: 'Pianificazione go-to-market',
    status: 'idle',
    capabilities: ['Piano lancio', 'Pricing strategy', 'Timeline'],
  },
  {
    id: 'social',
    type: 'social',
    name: 'Social Agent',
    description: 'Creazione contenuti social e posting su X',
    status: 'working',
    capabilities: ['Tweet generation', 'Thread creation', 'Scheduling', 'Analytics'],
    lastActive: 'Attivo ora',
  },
];

export default function AgentiPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'agent'; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedAgent) return;

    const userMessage = message;
    setMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Simulate agent response (will be replaced with actual Claude Code integration)
    setTimeout(() => {
      const agentResponse = getAgentResponse(selectedAgent.type, userMessage);
      setChatHistory(prev => [...prev, { role: 'agent', content: agentResponse }]);
      setIsLoading(false);
    }, 1500);
  };

  const getAgentResponse = (agentType: Agent['type'], userMsg: string): string => {
    const responses: Record<Agent['type'], string> = {
      editor: `Ho analizzato il tuo messaggio. Come Editor Agent, posso aiutarti a migliorare il testo, correggere errori grammaticali e ottimizzare lo stile. Cosa vorresti che revisionassi?`,
      marketer: `Ottima domanda! Come Marketer Agent, posso suggerirti strategie di marketing efficaci. Dimmi di piu sul contenuto che vuoi promuovere.`,
      branding: `Come Branding Agent, mi occupo di costruire e mantenere l'identita del tuo brand. Posso aiutarti con guidelines, visual identity e messaging coerente.`,
      gtm: `Come GTM Agent, sono specializzato in strategie go-to-market. Posso aiutarti a pianificare il lancio, definire il pricing e creare una timeline efficace.`,
      social: `Come Social Agent, posso generare tweet, creare thread coinvolgenti e gestire la programmazione dei post. Vuoi che crei un post per te?`,
    };
    return responses[agentType];
  };

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'working':
        return 'bg-blue-500';
      case 'idle':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <>
      <Header
        title="AI Agents"
        description="Interagisci con gli agenti intelligenti di Onde"
      />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="font-semibold text-gray-900 mb-4">Seleziona un Agent</h2>
            {agents.map((agent) => (
              <Card
                key={agent.id}
                className={`cursor-pointer transition-all ${
                  selectedAgent?.id === agent.id
                    ? 'ring-2 ring-indigo-500 bg-indigo-50'
                    : 'hover:shadow-md'
                }`}
                onClick={() => {
                  setSelectedAgent(agent);
                  setChatHistory([]);
                }}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        agent.status === 'working' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Bot className={`h-5 w-5 ${
                          agent.status === 'working' ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(agent.status)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">{agent.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{agent.description}</p>
                      {agent.lastActive && (
                        <p className="text-xs text-gray-400 mt-1">{agent.lastActive}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            {selectedAgent ? (
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      selectedAgent.status === 'working' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Bot className={`h-5 w-5 ${
                        selectedAgent.status === 'working' ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{selectedAgent.name}</CardTitle>
                      <CardDescription>{selectedAgent.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatHistory.length === 0 && (
                    <div className="text-center py-8">
                      <Bot className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">
                        Inizia una conversazione con {selectedAgent.name}
                      </p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {selectedAgent.capabilities.map((cap) => (
                          <span
                            key={cap}
                            className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {chatHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          msg.role === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-gray-500">Sto pensando...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={`Chiedi a ${selectedAgent.name}...`}
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Button onClick={handleSendMessage} disabled={!message.trim() || isLoading}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">Seleziona un agent per iniziare</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
