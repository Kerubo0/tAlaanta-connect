import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { getChatbotResponse } from '@/lib/ai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your TalentBridge AI assistant. Ask me anything about using the platform, connecting your wallet, creating jobs, or understanding Web3 freelancing! 🚀",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await getChatbotResponse(userMessage.content, conversationHistory);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "How do I connect my wallet?",
    "What are the platform fees?",
    "How does escrow work?",
    "How do I post a job?"
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl hover:scale-110 transition-all animate-pulse-glow flex items-center justify-center group"
        >
          <MessageCircle className="h-6 w-6 group-hover:animate-wiggle" />
          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 animate-bounce-slow">
            AI
          </Badge>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 z-50 w-96 h-[600px] shadow-2xl border-0 flex flex-col animate-scale-up">
          {/* Header */}
          <CardHeader className="border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    AI Assistant
                    <Sparkles className="h-4 w-4 animate-spin" style={{ animationDuration: '3s' }} />
                  </CardTitle>
                  <p className="text-xs text-white/80">Always here to help</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-purple-50/50 to-blue-50/50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 animate-fade-in-up ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                      : 'bg-gradient-to-r from-green-400 to-emerald-500'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-tr-none'
                      : 'bg-white shadow-md rounded-tl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-2 animate-fade-in-up">
                <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-green-400 to-emerald-500">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white shadow-md rounded-2xl rounded-tl-none px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                </div>
              </div>
            )}

            {messages.length === 1 && (
              <div className="space-y-2 animate-fade-in-up delay-300">
                <p className="text-xs text-gray-500 text-center mb-2">Quick questions:</p>
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="w-full text-left px-3 py-2 text-sm bg-white hover:bg-purple-50 border border-purple-200 rounded-lg transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input */}
          <div className="border-t p-4 bg-white rounded-b-lg">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by AI • Response times may vary
            </p>
          </div>
        </Card>
      )}
    </>
  );
}
