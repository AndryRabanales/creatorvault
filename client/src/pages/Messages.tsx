import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams, Link } from "wouter";
import { Loader2, Send, ArrowLeft, MessageSquare } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getLoginUrl } from "@/const";

export default function Messages() {
  const { id } = useParams<{ id?: string }>();
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationsQuery = trpc.message.getConversations.useQuery(undefined, { enabled: isAuthenticated });
  const messagesQuery = trpc.message.getMessages.useQuery(
    { conversationId: parseInt(id || "0") },
    { enabled: !!id && isAuthenticated, refetchInterval: 3000 }
  );
  const sendMutation = trpc.message.sendMessage.useMutation();
  const markReadMutation = trpc.message.markAsRead.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  useEffect(() => {
    if (id && isAuthenticated) {
      markReadMutation.mutate({ conversationId: parseInt(id) });
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesQuery.data]);

  const handleSend = async () => {
    if (!newMessage.trim() || !id) return;
    try {
      await sendMutation.mutateAsync({
        conversationId: parseInt(id),
        content: newMessage,
      });
      setNewMessage("");
      utils.message.getMessages.invalidate();
      utils.message.getConversations.invalidate();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const conversations = conversationsQuery.data || [];
  const messages = messagesQuery.data || [];
  const isCreator = user?.role === "creator";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href={isCreator ? "/dashboard/creator" : "/dashboard/brand"}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Messages</h1>
          </div>
        </div>
      </header>

      <div className="container py-6">
        <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Conversations List */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-18rem)]">
                {conversationsQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground px-4">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {conversations.map((conv: any) => (
                      <Link key={conv.id} href={`/messages/${conv.id}`}>
                        <div className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                          parseInt(id || "0") === conv.id ? "bg-muted" : ""
                        }`}>
                          <div className="flex items-center justify-between">
                            <p className="font-medium">
                              {isCreator ? `Brand #${conv.brandId}` : `Creator #${conv.creatorId}`}
                            </p>
                            {((isCreator && conv.creatorUnread > 0) || (!isCreator && conv.brandUnread > 0)) && (
                              <span className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {conv.campaignId ? `Campaign #${conv.campaignId}` : "General"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(conv.lastMessageAt || conv.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="md:col-span-2 flex flex-col">
            {id ? (
              <>
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-lg">
                    Conversation
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 flex flex-col">
                  <ScrollArea className="flex-1 p-4">
                    {messagesQuery.isLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {[...messages].reverse().map((msg: any) => {
                          const isMe = (isCreator && msg.senderType === "creator") || 
                                       (!isCreator && msg.senderType === "brand");
                          return (
                            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[70%] rounded-lg p-3 ${
                                isMe 
                                  ? "bg-primary text-primary-foreground" 
                                  : "bg-muted"
                              }`}>
                                <p className="text-sm">{msg.content}</p>
                                <p className={`text-xs mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                  {new Date(msg.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>
                  <div className="p-4 border-t border-border">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      />
                      <Button onClick={handleSend} disabled={sendMutation.isPending || !newMessage.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to view messages</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
