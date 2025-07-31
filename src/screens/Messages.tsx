// src/pages/Messages.tsx
import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/hooks/useSocket";
import ConversationList from "@/components/messages/ConversationList";
import ChatWindow from "@/components/messages/ChatWindow";
import MessageInput from "@/components/messages/MessageInput";
import { useConversationSocket } from "@/hooks/useConversationSocket";
import { fetchMessagesWith, fetchUserConversations } from "@/integrations/hopin-backend/messaging";

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const socket = useSocket();

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUserConversations()
      .then(setConversations)
      .catch(() =>
        toast({
          title: "Error loading conversations",
          description: "Unable to load your conversations.",
          variant: "destructive",
        })
      );
  }, [toast]);

  useEffect(() => {
    if (!selectedConv || !user) return;

    fetchMessagesWith(selectedConv.otherUser.id, selectedConv.rideId)
      .then(setMessages)
      .catch(() =>
        toast({
          title: "Error loading messages",
          description: "Unable to load conversation history.",
          variant: "destructive",
        })
      );
  }, [selectedConv, user, toast]);

  // Hook into live socket updates
  useConversationSocket({
    socket,
    rideId: selectedConv?.rideId ?? undefined,
    userId: user?.id ?? undefined,
    otherUserId: selectedConv?.otherUser?.id ?? undefined,
    onReceive: (msg) => setMessages((prev) => [...prev, msg]),
  });

  const handleSend = () => {
    if (!socket || !user || !selectedConv || !newMessage.trim()) return;

    socket.emit("send_message", {
      to: selectedConv.otherUser.id,
      ride_id: selectedConv.rideId,
      message: newMessage.trim(),
    });
    setNewMessage("");
  };

  return (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>

      <CardContent className="h-[500px] flex overflow-hidden space-x-4">
        <div className="w-64 border-r pr-2 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            selected={selectedConv}
            onSelect={setSelectedConv}
          />
        </div>

        <div className="flex-1 flex flex-col">
          {selectedConv ? (
            <>
              <ChatWindow
                user={user}
                conversation={selectedConv}
                messages={messages}
              />
              <MessageInput
                value={newMessage}
                onChange={setNewMessage}
                onSend={handleSend}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a conversation to start messaging.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);
}
