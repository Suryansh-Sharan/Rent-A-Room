import { LucideIcon } from 'lucide-react';
import { Building2, MessageSquare, Search, Bell, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        {Icon && <Icon className="h-7 w-7 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">{description}</p>
      {action}
    </div>
  );
}

export function EmptyRooms({ action }: { action?: React.ReactNode }) {
  return (
    <EmptyState
      icon={Building2}
      title="No rooms found"
      description="We couldn't find any rooms matching your criteria. Try adjusting your filters or search in a different location."
      action={action}
    />
  );
}

export function EmptyMessages() {
  return (
    <EmptyState
      icon={MessageSquare}
      title="No conversations yet"
      description="Start a conversation by expressing interest in a room listing."
    />
  );
}

export function EmptySearch() {
  return (
    <EmptyState
      icon={Search}
      title="Start your search"
      description="Use the search bar and filters above to find your perfect room."
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon={Bell}
      title="All caught up!"
      description="You don't have any new notifications. We'll let you know when something requires your attention."
    />
  );
}

export function EmptyRequests() {
  return (
    <EmptyState
      icon={FileText}
      title="No requests yet"
      description="When you express interest in a room, your requests will appear here."
    />
  );
}
