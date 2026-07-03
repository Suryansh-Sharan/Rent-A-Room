'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { mockConversations, mockMessages } from '@/lib/mock/messages';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import { EmptyMessages } from '@/components/ui/EmptyStates';
import { cn } from '@/lib/utils';

export default function TenantChatPage() {
  const { currentUser } = useAppStore();
  const currentUserId = currentUser?.id || 'u1';

  // Map mock data 'u1' to the real current user id
  const mappedConversations = mockConversations.map((c) => ({
    ...c,
    participantIds: c.participantIds.map((id) => (id === 'u1' ? currentUserId : id)),
  }));

  const mappedMessages = Object.keys(mockMessages).reduce<Record<string, typeof mockMessages[string]>>((acc, key) => {
    acc[key] = mockMessages[key].map((msg) => ({
      ...msg,
      senderId: msg.senderId === 'u1' ? currentUserId : msg.senderId,
    }));
    return acc;
  }, {});

  const [selectedId, setSelectedId] = useState<string | null>(mappedConversations[0]?.id ?? null);
  const [showSidebar, setShowSidebar] = useState(true);

  const selectedConv = mappedConversations.find((c) => c.id === selectedId);
  const messages = selectedId ? (mappedMessages[selectedId] ?? []) : [];

  return (
    <div className="h-[calc(100vh-12rem)] md:h-[calc(100vh-11rem)] lg:h-[calc(100vh-10rem)] flex overflow-hidden rounded-xl border border-border/60 bg-card/10 backdrop-blur-md">
      {/* Sidebar */}
      <div className={cn(
        'w-full md:w-72 flex-shrink-0 flex-col transition-all',
        selectedId && !showSidebar ? 'hidden md:flex' : 'flex'
      )}>
        <ChatSidebar
          conversations={mappedConversations}
          selectedId={selectedId}
          currentUserId={currentUserId}
          onSelect={(id) => { setSelectedId(id); setShowSidebar(false); }}
        />
      </div>

      {/* Chat window */}
      <div className={cn(
        'flex-1 min-w-0 flex flex-col bg-background/50',
        !selectedId || showSidebar ? 'hidden md:flex' : 'flex'
      )}>
        {selectedConv ? (
          <ChatWindow
            conversation={selectedConv}
            messages={messages}
            currentUserId={currentUserId}
            onBack={() => setShowSidebar(true)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyMessages />
          </div>
        )}
      </div>
    </div>
  );
}
