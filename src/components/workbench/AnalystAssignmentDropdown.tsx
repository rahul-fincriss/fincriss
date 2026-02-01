import { useState } from 'react';
import { UserPlus, UserCheck, ChevronDown, User as UserIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface AnalystAssignmentDropdownProps {
  analysts: User[];
  currentAssignee?: { id: string; name: string };
  onAssign: (analyst: User) => void;
  onAssignToMe: () => void;
  compact?: boolean;
}

export function AnalystAssignmentDropdown({
  analysts,
  currentAssignee,
  onAssign,
  onAssignToMe,
  compact = false,
}: AnalystAssignmentDropdownProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isAssignedToMe = currentAssignee?.id === user?.id;

  if (compact) {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {currentAssignee ? (
              <>
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-[8px] bg-primary/20">
                    {getInitials(currentAssignee.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-[80px] truncate">{currentAssignee.name.split(' ')[0]}</span>
              </>
            ) : (
              <>
                <UserPlus className="h-3 w-3" />
                Assign
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuLabel>Assign Analyst</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {!isAssignedToMe && user?.role === 'analyst' && (
            <>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onAssignToMe();
                  setOpen(false);
                }}
                className="text-primary"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Assign to me
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {analysts.map((analyst) => (
            <DropdownMenuItem
              key={analyst.id}
              onClick={(e) => {
                e.stopPropagation();
                onAssign(analyst);
                setOpen(false);
              }}
              className={currentAssignee?.id === analyst.id ? 'bg-primary/10' : ''}
            >
              <Avatar className="h-5 w-5 mr-2">
                <AvatarFallback className="text-[10px]">
                  {getInitials(analyst.name)}
                </AvatarFallback>
              </Avatar>
              {analyst.name}
              {currentAssignee?.id === analyst.id && (
                <Badge variant="secondary" className="ml-auto text-[10px] h-4">
                  Current
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 min-w-[140px] justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          {currentAssignee ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px] bg-primary/20">
                  {getInitials(currentAssignee.name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate max-w-[100px]">{currentAssignee.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserIcon className="h-4 w-4" />
              <span>Unassigned</span>
            </div>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuLabel>Assign Analyst</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!isAssignedToMe && user?.role === 'analyst' && (
          <>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onAssignToMe();
                setOpen(false);
              }}
              className="text-primary font-medium"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Assign to me
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {analysts.map((analyst) => (
          <DropdownMenuItem
            key={analyst.id}
            onClick={(e) => {
              e.stopPropagation();
              onAssign(analyst);
              setOpen(false);
            }}
            className={currentAssignee?.id === analyst.id ? 'bg-primary/10' : ''}
          >
            <Avatar className="h-5 w-5 mr-2">
              <AvatarFallback className="text-[10px]">
                {getInitials(analyst.name)}
              </AvatarFallback>
            </Avatar>
            {analyst.name}
            {currentAssignee?.id === analyst.id && (
              <Badge variant="secondary" className="ml-auto text-[10px] h-4">
                Current
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
