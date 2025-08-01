import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";

export function useSocket(): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeSocket = async () => {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) return;

      const newSocket = io(API_URL, {
        transports: ["websocket"],
        auth: { token },
        autoConnect: true,
      });

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
      });

      newSocket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
      });

      if (isMounted) {
        setSocket(newSocket);
      }
    };

    initializeSocket();

    return () => {
      isMounted = false;
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, []);

  return socket;
}