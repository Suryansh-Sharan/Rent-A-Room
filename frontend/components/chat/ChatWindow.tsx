'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { Conversation, Message } from '@/lib/mock/messages';

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  onBack?: () => void;
}

export default function ChatWindow({ conversation, messages, currentUserId, onBack }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState(messages);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const otherName = conversation.participantNames.find((_, i) => conversation.participantIds[i] !== currentUserId) || '';
  const otherAvatar = conversation.participantAvatars[conversation.participantIds.findIndex((id) => id !== currentUserId)] || '';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: `local-${Date.now()}`,
      conversationId: conversation.id,
      senderId: currentUserId,
      content: input.trim(),
      timestamp: new Date().toISOString(),
      read: false,
      type: 'text',
    };
    setLocalMessages((prev) => [...prev, newMsg]);
    setInput('');
    setIsTyping(false);

    // Simulate typing response
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setLocalMessages((prev) => [
          ...prev,
          {
            id: `reply-${Date.now()}`,
            conversationId: conversation.id,
            senderId: conversation.participantIds.find((id) => id !== currentUserId)!,
            content: 'Thanks for your message! I will get back to you shortly.',
            timestamp: new Date().toISOString(),
            read: false,
            type: 'text',
          },
        ]);
      }, 2000);
    }, 1000);
  };

  const groupedMessages = localMessages.reduce<{ date: string; messages: Message[] }[]>((groups, msg) => {
    const date = format(new Date(msg.timestamp), 'dd MMM yyyy');
    const last = groups[groups.length - 1];
    if (last && last.date === date) { last.messages.push(msg); }
    else { groups.push({ date, messages: [msg] }); }
    return groups;
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-card/50">
        {onBack && (
          <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="relative">
          <Avatar className="h-9 w-9">
            <AvatarImage src={otherAvatar} />
            <AvatarFallback>{otherName.charAt(0)}</AvatarFallback>
          </Avatar>
          {conversation.online && (
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-background" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{otherName}</p>
          {conversation.roomTitle && (
            <p className="text-xs text-muted-foreground truncate">Re: {conversation.roomTitle}</p>
          )}
          <p className="text-[10px] text-emerald-400">
            {conversation.online ? 'Online' : 'Offline'}
          </p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {groupedMessages.map((group) => (
          <div key={group.date}>
            <div className="flex justify-center mb-4">
              <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-3 py-0.5">
                {group.date}
              </span>
            </div>
            <div className="space-y-2">
              {group.messages.map((msg) => {
                const isSent = msg.senderId === currentUserId;
                return (
                  <div key={msg.id} className={cn('flex items-end gap-2', isSent ? 'justify-end' : 'justify-start')}>
                    {!isSent && (
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <AvatarImage src={otherAvatar} />
                        <AvatarFallback className="text-[9px]">{otherName.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn('max-w-[75%] space-y-0.5')}>
                      <div className={cn('rounded-2xl px-3.5 py-2.5 text-sm', isSent ? 'chat-bubble-sent rounded-br-sm' : 'chat-bubble-received rounded-bl-sm')}>
                        {msg.content}
                      </div>
                      <p className={cn('text-[10px] text-muted-foreground/60', isSent ? 'text-right' : 'text-left')}>
                        {format(new Date(msg.timestamp), 'hh:mm a')}
                        {isSent && <span className="ml-1">{msg.read ? '✓✓' : '✓'}</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2 animate-fade-in">
            <Avatar className="h-6 w-6 flex-shrink-0">
              <AvatarImage src={otherAvatar} />
              <AvatarFallback className="text-[9px]">{otherName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="chat-bubble-received rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border/60 bg-card/50">
        <div className="flex gap-2 items-end">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-muted/50 border-border/60 focus:border-gold/50 rounded-full px-4"
          />
          <Button
            size="icon"
            disabled={!input.trim()}
            onClick={sendMessage}
            className="h-9 w-9 rounded-full bg-gold-gradient text-obsidian hover:opacity-90 flex-shrink-0 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
