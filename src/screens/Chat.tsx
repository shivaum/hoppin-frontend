import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { useDispatch } from 'react-redux';

import { useAuth } from '../contexts/AuthContext';
import ChatWindow from '../components/messages/ChatWindow';
import { useSocket } from '../hooks/useSocket';
import { useConversationSocket } from '../hooks/useConversationSocket';
import { loadMessages, appendMessage } from '../state/chat/chatSlice';
import { fetchMessagesWith } from '../integrations/hopin-backend/messaging';
import { sendMessage } from '../integrations/hopin-backend/sendMessage';
import { colors } from '../constants/colors';
import { MainStackParamList } from '../navigation/types';
import { MessageConversation } from '../components/messages/MessageListItem';
import { Message, Conversation } from '../types';

type ChatNavProp = NativeStackNavigationProp<MainStackParamList>;

type ChatRouteParams = {
  conversation: MessageConversation;
};


export default function Chat() {
  const { user } = useAuth();
  const navigation = useNavigation<ChatNavProp>();
  const route = useRoute<any>();
  const dispatch = useDispatch<any>();
  const { conversation } = route.params as ChatRouteParams;

  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessagesFromAPI();
  }, []);

  // Set up real-time message listening
  useConversationSocket({
    socket,
    rideId: conversation.ride.id,
    userId: user?.id || '',
    otherUserId: conversation.otherUser.id,
    onReceive: (message: Message) => {
      setMessages(prev => [...prev, message]);
    },
  });

  const loadMessagesFromAPI = async () => {
    try {
      setLoading(true);
      const messagesData = await fetchMessagesWith(
        conversation.otherUser.id,
        conversation.ride.id
      );
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
      Toast.show({
        type: 'error',
        text1: 'Error loading messages',
        text2: 'Unable to load conversation messages.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !socket) return;

    try {
      const messageContent = newMessage.trim();
      setNewMessage('');

      // Send message via WebSocket - let the server handle adding to UI via receive_message event
      await sendMessage({
        socket,
        to: conversation.otherUser.id,
        rideId: conversation.ride.id,
        content: messageContent,
      });

    } catch (error) {
      console.error('Error sending message:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to send message',
        text2: 'Please try again.',
      });
    }
  };

  const handleRideDetailsPress = () => {
    Toast.show({
      type: 'info',
      text1: 'Ride Details',
      text2: `Navigate to ride ${conversation.ride.id} details`,
    });
    // TODO: navigation.navigate('RideDetails', { rideId: conversation.ride.id });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Transform conversation data for ChatWindow component
  const chatConversation: Conversation = {
    id: conversation.id,
    rideId: conversation.ride.id,
    otherUser: conversation.otherUser,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.neutral.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.headerContent} onPress={handleRideDetailsPress}>
          <Text style={styles.headerName}>{conversation.otherUser.name}</Text>
          <Text style={styles.headerSubtitle}>
            {formatDate(conversation.ride.departure_time)} | {conversation.ride.start_location} to {conversation.ride.end_location}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.callButton}>
          <Text style={styles.callIcon}>📞</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.flex} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Chat Messages */}
        <View style={styles.chatContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading messages...</Text>
            </View>
          ) : (
            <ChatWindow
              user={user!}
              conversation={chatConversation}
              messages={messages}
            />
          )}
        </View>

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Message Liam..."
            placeholderTextColor={colors.neutral.gray400}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              newMessage.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Text style={styles.sendIcon}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
    backgroundColor: colors.neutral.white,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  backIcon: {
    fontSize: 24,
    color: colors.neutral.gray900,
    fontWeight: '300',
  },
  headerContent: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.neutral.gray600,
  },
  callButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary.purple,
    borderRadius: 22,
  },
  callIcon: {
    fontSize: 20,
    color: colors.neutral.white,
  },
  chatContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.neutral.gray500,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
  },
  messageInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    backgroundColor: colors.neutral.gray100,
    borderRadius: 22,
    fontSize: 16,
    color: colors.neutral.gray900,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: colors.primary.purple,
  },
  sendButtonInactive: {
    backgroundColor: colors.neutral.gray300,
  },
  sendIcon: {
    fontSize: 20,
    color: colors.neutral.white,
    fontWeight: '600',
  },
});