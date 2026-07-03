'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { Conversation } from '@/lib/mock/messages';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedId: string | null;
  currentUserId: string;
  onSelect: (id: string) => void;
}

export default function ChatSidebar({ conversations, selectedId, currentUserId, onSelect }: ChatSidebarProps) {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter((c) => {
    const otherName = c.participantNames.find((_, i) => c.participantIds[i] !== currentUserId) || '';
    return otherName.toLowerCase().includes(search.toLowerCase()) || (c.roomTitle?.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="flex flex-col h-full border-r border-border/60 bg-card/30">
      <div className="p-4 border-b border-border/60">
        <h2 className="font-bold text-lg mb-3">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 bg-muted/50 border-border/60 text-sm"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No conversations</p>
        ) : (
          filtered.map((conv) => {
            const otherIdx = conv.participantIds.findIndex((id) => id !== currentUserId);
            const otherName = conv.participantNames[otherIdx] || '';
            const otherAvatar = conv.participantAvatars[otherIdx] || '';
            const isSelected = selectedId === conv.id;

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={cn(
                  'w-full flex items-start gap-3 p-4 text-left transition-colors border-b border-border/40',
                  isSelected ? 'bg-gold/8 border-l-2 border-l-gold' : 'hover:bg-muted/40'
                )}
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={otherAvatar} />
                    <AvatarFallback>{otherName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {conv.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={cn('text-sm font-medium truncate', isSelected && 'text-gold')}>{otherName}</span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-1">
                      {formatDistanceToNow(new Date(conv.lastMessageTime), { addSuffix: false })}
                    </span>
                  </div>
                  {conv.roomTitle && (
                    <p className="text-[10px] text-gold/70 truncate mb-0.5">{conv.roomTitle}</p>
                  )}
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    {conv.unreadCount > 0 && (
                      <span className="flex-shrink-0 h-4 min-w-[16px] rounded-full bg-gold text-obsidian text-[9px] font-bold flex items-center justify-center px-1">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
