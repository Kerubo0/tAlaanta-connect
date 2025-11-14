import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
// TODO: Migrate to Supabase Realtime
// import { rtdb } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Send, 
  Search, 
  MoreVertical,
  Paperclip,
  Smile,
  Phone,
  Video,
  Info,
  Circle,
  Wallet,
  CheckCheck
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
  read?: boolean;
}

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: number;
  unread: number;
  online: boolean;
  walletAddress: string;
}

export function MessagesPage() {
  const { address, isConnected } = useAccount();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isConnected && address) {
      loadConversations();
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = () => {
    // Mock data - would be loaded from Firebase
    const mockConversations: Conversation[] = [
      {
        id: '1',
        name: 'Sarah Chen',
        lastMessage: 'Thanks for the update! Looking forward to the delivery.',
        timestamp: Date.now() - 300000,
        unread: 2,
        online: true,
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
      },
      {
        id: '2',
        name: 'Alex Rodriguez',
        lastMessage: 'Can we schedule a call tomorrow?',
        timestamp: Date.now() - 3600000,
        unread: 0,
        online: false,
        walletAddress: '0x853d955aCEf822Db058eb8505911ED77F175b99e'
      },
      {
        id: '3',
        name: 'Maya Patel',
        lastMessage: 'The design looks great! Just a few minor changes.',
        timestamp: Date.now() - 7200000,
        unread: 1,
        online: true,
        walletAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
      }
    ];
    setConversations(mockConversations);
  };

  const loadMessages = (conversationId: string) => {
    // Mock data - would be loaded from Firebase Realtime Database
    const mockMessages: Message[] = [
      {
        id: '1',
        text: 'Hi! I saw your proposal for the Web3 project.',
        senderId: conversationId,
        timestamp: Date.now() - 86400000,
        read: true
      },
      {
        id: '2',
        text: 'Hello! Yes, I\'d love to work on this project.',
        senderId: address || '',
        timestamp: Date.now() - 86000000,
        read: true
      },
      {
        id: '3',
        text: 'Great! Can you start next week?',
        senderId: conversationId,
        timestamp: Date.now() - 85600000,
        read: true
      },
      {
        id: '4',
        text: 'Absolutely! I\'ll have the initial designs ready by Wednesday.',
        senderId: address || '',
        timestamp: Date.now() - 85200000,
        read: true
      },
      {
        id: '5',
        text: 'Perfect! Looking forward to it. 🎨',
        senderId: conversationId,
        timestamp: Date.now() - 300000,
        read: true
      }
    ];
    setMessages(mockMessages);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !address) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      text: newMessage,
      senderId: address,
      timestamp: Date.now(),
      read: false
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');

    // Would push to Firebase here
    // await push(ref(rtdb, `messages/${selectedConversation}`), {
    //   text: newMessage,
    //   senderId: address,
    //   timestamp: serverTimestamp()
    // });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Wallet className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
                Connect Your Wallet
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Please connect your wallet to access your messages.
              </p>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <Wallet className="mr-2 h-5 w-5" />
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 animate-fade-in-up">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text mb-2">
            Messages
          </h1>
          <p className="text-gray-600">
            Chat with clients and freelancers securely
          </p>
        </div>

        {/* Main Chat Interface */}
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm lg:col-span-1 flex flex-col animate-fade-in-up">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-xl">Conversations</CardTitle>
                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  {conversations.reduce((sum, c) => sum + c.unread, 0)} new
                </Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {filteredConversations.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`p-4 cursor-pointer transition-all hover:bg-purple-50 ${
                        selectedConversation === conv.id ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                            {conv.name.charAt(0)}
                          </div>
                          {conv.online && (
                            <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">{conv.name}</h3>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatTime(conv.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate mb-1">{conv.lastMessage}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400 truncate">
                              {conv.walletAddress.slice(0, 6)}...{conv.walletAddress.slice(-4)}
                            </span>
                            {conv.unread > 0 && (
                              <Badge className="bg-purple-600 text-white text-xs">
                                {conv.unread}
                              </Badge>
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

          {/* Chat Area */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm lg:col-span-2 flex flex-col animate-fade-in-up delay-300">
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                          {selectedConv.name.charAt(0)}
                        </div>
                        {selectedConv.online && (
                          <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{selectedConv.name}</h2>
                        <div className="flex items-center gap-2 text-sm">
                          {selectedConv.online ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <Circle className="h-2 w-2 fill-current" />
                              Online
                            </span>
                          ) : (
                            <span className="text-gray-500">Offline</span>
                          )}
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500 text-xs">
                            {selectedConv.walletAddress.slice(0, 6)}...{selectedConv.walletAddress.slice(-4)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                        <Phone className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                        <Video className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                        <Info className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => {
                    const isOwn = message.senderId === address;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                      >
                        <div className={`flex items-end gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                          {!isOwn && (
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                              {selectedConv.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                isOwn
                                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-none'
                                  : 'bg-gray-100 text-gray-900 rounded-bl-none'
                              }`}
                            >
                              <p className="text-sm">{message.text}</p>
                            </div>
                            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-xs text-gray-500">
                                {formatTime(message.timestamp)}
                              </span>
                              {isOwn && (
                                <CheckCheck className={`h-3 w-3 ${message.read ? 'text-blue-600' : 'text-gray-400'}`} />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                      <Smile className="h-5 w-5" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No conversation selected</h3>
                  <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
