import { useEffect } from "react";
import type { Socket } from "socket.io-client";
import type { Message } from "../types";

interface UseConversationSocketParams {
  socket: Socket | null;
  rideId?: string | null;
  userId?: string | null;
  otherUserId?: string | null;
  onReceive: (message: Message) => void;
}

export function useConversationSocket({
  socket,
  rideId,
  userId,
  otherUserId,
  onReceive,
}: UseConversationSocketParams) {
  useEffect(() => {
    if (!socket || !rideId || !userId || !otherUserId) return;

    const [id1, id2] = [userId, otherUserId].sort();
    const room = `conversation:${rideId}:${id1}:${id2}`;

    const joinRoom = () => {
      console.log("Joining socket room:", room);
      socket.emit("join_room", { room });
    };

    const handleReceive = (msg: Message) => {
      const isRelevant =
        msg.ride_id === rideId &&
        ((msg.sender_id === userId && msg.receiver_id === otherUserId) ||
         (msg.sender_id === otherUserId && msg.receiver_id === userId));

      if (isRelevant) {
        onReceive(msg);
      }
    };

    // Join room and set up listeners
    socket.on("connect", joinRoom);
    joinRoom(); // In case already connected
    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("receive_message", handleReceive);
    };
  }, [socket, rideId, userId, otherUserId, onReceive]);
}