'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Send,
  Search,
  Plus,
  Paperclip,
  MoreVertical,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';
import { useEffect } from 'react';
import { DataNotFoundForEntity } from '@/components/ui/data-not-found';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  profileImage?: string;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string>('');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setApiError(null);
      const response = await apiService.getConversations();
      if (response.success) {
        // Ensure we always have an array
        const conversationsData = Array.isArray(response.data) ? response.data : [];
        setConversations(conversationsData);
        if (conversationsData.length > 0 && !selectedConversation) {
          setSelectedConversation(conversationsData[0].id);
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('Conversations fetch error:', error);
      // Handle the case where there are no conversations yet
      if (error.message && (error.message.includes('404') || error.message.includes('not found'))) {
        // Set empty conversations when there are no messages
        setConversations([]);
      } else {
        const errorMessage = error.message || 'Failed to load conversations';
        setApiError(errorMessage);
        // Set to empty array on error to prevent further issues
        setConversations([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;
      
      const response = await apiService.getMessages(conversation.participantId);
      if (response.success) {
        // Ensure we always have an array
        const messagesData = Array.isArray(response.data) ? response.data : [];
        setMessages(messagesData);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('Messages fetch error:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch messages: ${error.message || 'API endpoint not implemented'}`,
        variant: 'destructive',
      });
      // Set to empty array on error to prevent further issues
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (messageInput.trim() && selectedConversation) {
      setSending(true);
      try {
        const conversation = conversations.find(c => c.id === selectedConversation);
        if (conversation) {
          await apiService.sendMessage(conversation.participantId, messageInput.trim());
          setMessageInput('');
          fetchMessages(selectedConversation); // Refresh messages
          fetchConversations(); // Refresh conversations for last message
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to send message',
          variant: 'destructive',
        });
      } finally {
        setSending(false);
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showNoData = !loading && conversations.length === 0;
  const showNoResults = !loading && searchQuery !== '' && filteredConversations.length === 0;

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)]">
        <Card className="h-full">
          <div className="grid grid-cols-12 h-full">
            {/* Conversations List */}
            <div className="col-span-4 border-r">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Messages</CardTitle>
                  <Button size="icon" variant="ghost">
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
                <div className="relative mt-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </CardHeader>
              <ScrollArea className="h-[calc(100%-140px)]">
                {apiError ? (
                  <div className="p-4">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Messages Feature Not Available</AlertTitle>
                      <AlertDescription>
                        The messaging functionality is not yet implemented in the backend. 
                        This feature is planned for a future release.
                        <br /><br />
                        Error: {apiError}
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4">
                    <DataNotFoundForEntity entity="conversations" />
                  </div>
                ) : (
                  <div className="p-2">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors',
                          selectedConversation === conversation.id && 'bg-gray-100'
                        )}
                        onClick={() => setSelectedConversation(conversation.id)}
                      >
                        <Avatar>
                          <AvatarImage src={conversation.profileImage} />
                          <AvatarFallback>
                            {getInitials(conversation.participantName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm truncate">
                              {conversation.participantName}
                            </p>
                            <span className="text-xs text-gray-500">
                              {formatTime(conversation.lastMessageTime)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.lastMessage}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge
                                variant="default"
                                className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                              >
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {conversation.participantRole}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Messages Area */}
            <div className="col-span-8 flex flex-col">
              {/* Chat Header */}
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage />
                      <AvatarFallback>
                        {getInitials(
                          conversations.find((c) => c.id === selectedConversation)
                            ?.participantName || ''
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {
                          conversations.find((c) => c.id === selectedConversation)
                            ?.participantName
                        }
                      </p>
                      <p className="text-sm text-gray-500">
                        {
                          conversations.find((c) => c.id === selectedConversation)
                            ?.participantRole
                        }
                      </p>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex gap-3',
                        message.senderId === 'current-user' && 'flex-row-reverse'
                      )}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage />
                        <AvatarFallback className="text-xs">
                          {getInitials(message.senderName)}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          'max-w-[70%] space-y-1',
                          message.senderId === 'current-user' && 'items-end'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {message.senderName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <div
                          className={cn(
                            'rounded-lg p-3',
                            message.senderId === 'current-user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-gray-100'
                          )}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex items-end gap-2">
                  <Button size="icon" variant="ghost">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Textarea
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-[60px] max-h-[120px] resize-none"
                  />
                  <Button onClick={handleSendMessage} disabled={sending}>
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
