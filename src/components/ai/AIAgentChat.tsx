
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Send, RefreshCw, Zap, Plus } from "lucide-react";
import { useAI } from "@/context/AIContext";
import { AIMessage } from "@/types/ai";
import { cn } from "@/lib/utils";

interface AIAgentChatProps {
  className?: string;
  compact?: boolean;
  showHeader?: boolean;
  maxHeight?: string;
}

export const AIAgentChat: React.FC<AIAgentChatProps> = ({
  className,
  compact = false,
  showHeader = true,
  maxHeight = "400px"
}) => {
  const { sendMessage, messages, isProcessing, clearMessages } = useAI();
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;
    
    await sendMessage(inputMessage);
    setInputMessage("");
    
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: AIMessage) => {
    const isAI = message.role === "assistant" || message.role === "system";
    
    return (
      <div
        key={message.id}
        className={cn(
          "flex gap-3 mb-4",
          isAI ? "justify-start" : "justify-end"
        )}
      >
        {isAI && (
          <Avatar className="h-8 w-8 bg-leap-purple text-white">
            <AvatarFallback>AI</AvatarFallback>
            <AvatarImage src="/ai-avatar.png" />
          </Avatar>
        )}
        
        <div
          className={cn(
            "px-4 py-3 rounded-lg max-w-[80%]",
            isAI 
              ? "bg-muted text-foreground rounded-tl-none" 
              : "bg-leap-purple text-white rounded-tr-none"
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <div className="text-xs opacity-70 mt-1 text-right">
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
        
        {!isAI && (
          <Avatar className="h-8 w-8">
            <AvatarFallback>ME</AvatarFallback>
            <AvatarImage src="/user-avatar.png" />
          </Avatar>
        )}
      </div>
    );
  };

  const renderSuggestions = () => {
    if (messages.length > 0) return null;
    
    const suggestions = [
      "How can I improve my leadership skills?",
      "Recommend resources for learning system design",
      "Help me create a goal for learning React",
      "What are the trending skills in tech?"
    ];
    
    return (
      <div className="space-y-2 mb-4">
        <p className="text-sm text-muted-foreground">Try asking:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => {
                setInputMessage(suggestion);
                if (textareaRef.current) {
                  textareaRef.current.focus();
                }
              }}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className={cn("flex flex-col", className)}>
      {showHeader && (
        <CardHeader className={cn(compact ? "p-3" : "")}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-leap-purple" />
              <CardTitle className={cn(compact ? "text-lg" : "")}>AI Assistant</CardTitle>
            </div>
            {messages.length > 0 && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={clearMessages}
                title="Clear conversation"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
      )}
      
      <CardContent className={cn(
        "flex-1 flex flex-col p-0",
        compact ? "px-3 pb-3" : "px-6 pb-6"
      )}>
        <ScrollArea className={cn("pr-4", `max-h-[${maxHeight}]`)}>
          <div className={cn("space-y-4", compact ? "pt-0" : "pt-2")}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                <div className="bg-leap-purple/10 p-3 rounded-full">
                  <Brain className="h-8 w-8 text-leap-purple" />
                </div>
                <div>
                  <h3 className="font-semibold">Your AI Career Assistant</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Ask about career paths, technical concepts, or get help with your goals.
                  </p>
                </div>
                
                {renderSuggestions()}
              </div>
            )}
            
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className={cn("mt-4 flex gap-2", compact ? "mt-3" : "")}>
          <Textarea
            ref={textareaRef}
            placeholder="Ask me anything about your career..."
            className="min-h-[60px] resize-none"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
          />
          <Button 
            size="icon" 
            onClick={handleSendMessage} 
            disabled={!inputMessage.trim() || isProcessing}
            className={cn("shrink-0", 
              isProcessing ? "animate-pulse bg-leap-purple/70" : "bg-leap-purple"
            )}
          >
            {isProcessing ? <Zap className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        
        {!compact && (
          <div className="mt-2 flex justify-start">
            <Button variant="outline" size="sm" className="text-xs flex items-center gap-1">
              <Plus className="h-3 w-3" />
              New conversation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
