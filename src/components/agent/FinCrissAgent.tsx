import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Minimize2, Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

type ContextType = 'alert' | 'case' | 'general';

interface Message {
  id: string;
  role: 'agent' | 'user';
  content: string;
}

interface QuickAction {
  label: string;
  action: string;
}

const alertQuickActions: QuickAction[] = [
  { label: 'Summarize why flagged', action: 'Summarize why this alert was flagged' },
  { label: 'Show key transactions', action: 'Show me the key transactions for this alert' },
  { label: 'Explain risk drivers', action: 'Explain the risk drivers for this alert' },
  { label: 'View raw payload', action: 'Show me the raw payload data' },
];

const caseQuickActions: QuickAction[] = [
  { label: 'Case summary', action: 'Give me a summary of this case' },
  { label: 'Evidence checklist', action: 'Show the evidence checklist' },
  { label: 'Draft STR points', action: 'Help me draft STR points' },
  { label: 'Show related alerts', action: 'Show alerts related to this case' },
];

function getContextFromPath(pathname: string): { type: ContextType; id?: string } {
  // Check for alert details: /alerts/:id
  const alertMatch = pathname.match(/^\/alerts\/([^/]+)$/);
  if (alertMatch) {
    return { type: 'alert', id: alertMatch[1] };
  }

  // Check for case workspace: /cases/:id
  const caseMatch = pathname.match(/^\/cases\/([^/]+)$/);
  if (caseMatch) {
    return { type: 'case', id: caseMatch[1] };
  }

  return { type: 'general' };
}

function getGreetingMessage(userName: string, context: { type: ContextType; id?: string }): string {
  const firstName = userName.split(' ')[0];
  const greeting = `Hi ${firstName}, I'm the FinCrisS Agent.`;

  switch (context.type) {
    case 'alert':
      return `${greeting}\n\nDo you want me to find more details about Alert ${context.id}?`;
    case 'case':
      return `${greeting}\n\nDo you want me to find more details about Case ${context.id}?`;
    default:
      return `${greeting}\n\nWhat would you like to look into today?`;
  }
}

export function FinCrissAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const { user } = useAuth();
  const location = useLocation();

  const context = getContextFromPath(location.pathname);
  const quickActions = context.type === 'alert' ? alertQuickActions : context.type === 'case' ? caseQuickActions : [];

  // Reset messages when chat opens or context changes
  useEffect(() => {
    if (isOpen && user) {
      const greeting = getGreetingMessage(user.name, context);
      setMessages([
        {
          id: 'greeting',
          role: 'agent',
          content: greeting,
        },
      ]);
    }
  }, [isOpen, location.pathname, user]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setMessages([]);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsOpen(false);
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Simulate agent response
    setTimeout(() => {
      const agentResponse: Message = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        content: `I understand you're asking about "${content.trim()}". This is a demo response. In a production environment, I would provide detailed insights based on your query and the current context.`,
      };
      setMessages((prev) => [...prev, agentResponse]);
    }, 1000);
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  if (!user) return null;

  return (
    <TooltipProvider>
      {/* Floating Chat Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleOpen}
            size="lg"
            className={cn(
              'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg',
              'bg-primary hover:bg-primary/90 text-primary-foreground',
              'transition-all duration-200 hover:scale-105',
              isMinimized && 'animate-pulse'
            )}
          >
            <Bot className="h-6 w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="font-medium">
          FinCrisS Agent
        </TooltipContent>
      </Tooltip>

      {/* Chat Panel */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[400px] sm:w-[440px] p-0 flex flex-col">
          <SheetHeader className="px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <SheetTitle className="text-base font-semibold">Chat with FinCrisS Agent</SheetTitle>
                  <p className="text-xs text-muted-foreground">AI-powered compliance assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleMinimize}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          {/* Context Badge */}
          {context.type !== 'general' && (
            <div className="px-4 py-2 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Context:</span>
                <span className="font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">
                  {context.type === 'alert' ? `Alert ${context.id}` : `Case ${context.id}`}
                </span>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <ScrollArea className="flex-1 px-4 py-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    )}
                  >
                    <p className="whitespace-pre-line">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && quickActions.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Quick actions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((qa) => (
                    <Button
                      key={qa.label}
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleQuickAction(qa.action)}
                    >
                      {qa.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-background">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
