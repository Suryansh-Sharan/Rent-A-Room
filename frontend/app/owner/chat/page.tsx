'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { mockConversations, mockMessages } from '@/lib/mock/messages';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import { EmptyMessages } from '@/components/ui/EmptyStates';
import { cn } from '@/lib/utils';

export default function OwnerChatPage() {
  const { currentUser } = useAppStore();
  const currentUserId = currentUser?.id || 'u2';

  // Map mock data 'u2' to the real current owner user id
  const mappedConversations = mockConversations.map((c) => ({
    ...c,
    participantIds: c.participantIds.map((id) => (id === 'u2' ? currentUserId : id)),
  }));

  const mappedMessages = Object.keys(mockMessages).reduce<Record<string, typeof mockMessages[string]>>((acc, key) => {
    acc[key] = mockMessages[key].map((msg) => ({
      ...msg,
      senderId: msg.senderId === 'u2' ? currentUserId : msg.senderId,
    }));
    return acc;
  }, {});

  const ownerConvs = mappedConversations.filter((c) => c.participantIds.includes(currentUserId));
  const [selectedId, setSelectedId] = useState<string | null>(ownerConvs[0]?.id ?? null);
  const [showSidebar, setShowSidebar] = useState(true);

  const selectedConv = ownerConvs.find((c) => c.id === selectedId);
  const messages = selectedId ? (mappedMessages[selectedId] ?? []) : [];

  return (
    <div className="h-[calc(100vh-12rem)] md:h-[calc(100vh-11rem)] lg:h-[calc(100vh-10rem)] flex overflow-hidden rounded-xl border border-border/60 bg-card/10 backdrop-blur-md">
      <div className={cn('w-full md:w-72 flex-shrink-0 flex-col', selectedId && !showSidebar ? 'hidden md:flex' : 'flex')}>
        <ChatSidebar
          conversations={ownerConvs}
          selectedId={selectedId}
          currentUserId={currentUserId}
          onSelect={(id) => { setSelectedId(id); setShowSidebar(false); }}
        />
      </div>
      <div className={cn('flex-1 min-w-0 flex flex-col bg-background/50', !selectedId || showSidebar ? 'hidden md:flex' : 'flex')}>
        {selectedConv ? (
          <ChatWindow conversation={selectedConv} messages={messages} currentUserId={currentUserId} onBack={() => setShowSidebar(true)} />
        ) : (
          <div className="flex-1 flex items-center justify-center"><EmptyMessages /></div>
        )}
      </div>
    </div>
  );
}
