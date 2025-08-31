import { Socket } from 'socket.io-client';

export interface SendMessageParams {
  socket: Socket;
  to: string;
  rideId: string;
  content: string;
}

export function sendMessage({ socket, to, rideId, content }: SendMessageParams) {
  return new Promise<void>((resolve, reject) => {
    if (!socket.connected) {
      reject(new Error('Socket not connected'));
      return;
    }

    // Set up listeners for response
    const handleSent = () => {
      socket.off('message_sent', handleSent);
      socket.off('message_error', handleError);
      resolve();
    };

    const handleError = (error: any) => {
      socket.off('message_sent', handleSent);
      socket.off('message_error', handleError);
      reject(new Error(error.message || 'Failed to send message'));
    };

    // Listen for response
    socket.once('message_sent', handleSent);
    socket.once('message_error', handleError);

    // Send the message
    socket.emit('send_message', {
      to,
      ride_id: rideId,
      message: content,
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      socket.off('message_sent', handleSent);
      socket.off('message_error', handleError);
      reject(new Error('Message send timeout'));
    }, 10000);
  });
}