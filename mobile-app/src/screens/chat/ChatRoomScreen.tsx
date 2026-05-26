import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { useAuthStore } from '@/stores/authStore'
import socketService, { ChatMessage } from '@/services/socketService'

type ChatRoomRouteParams = {
  ChatRoom: {
    roomId: string
    roomName: string
  }
}

interface DisplayMessage {
  id: string
  userId: string
  username: string
  content: string
  timestamp: Date
  isOwn: boolean
  type: 'text' | 'song' | 'system'
}

export default function ChatRoomScreen() {
  const route = useRoute<RouteProp<ChatRoomRouteParams, 'ChatRoom'>>()
  const navigation = useNavigation()
  const { roomId, roomName } = route.params || { roomId: 'general', roomName: '音乐交流群' }

  const user = useAuthStore((state) => state.user)

  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState(0)
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  const flatListRef = useRef<FlatList>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    initializeChat()

    return () => {
      cleanupChat()
    }
  }, [roomId])

  async function initializeChat() {
    try {
      const connected = await socketService.connect()
      setIsConnected(connected)

      if (connected) {
        socketService.joinRoom(roomId)
      }

      // 加载欢迎消息
      setMessages([
        {
          id: 'welcome',
          userId: 'system',
          username: '系统',
          content: `欢迎来到 ${roomName}！开始聊天吧 🎵`,
          timestamp: new Date(),
          isOwn: false,
          type: 'system',
        },
      ])

      // 注册消息监听
      socketService.onMessage(handleNewMessage)
      socketService.onUserJoin(handleUserJoin)
      socketService.onUserLeave(handleUserLeave)
      socketService.onOnlineCountChange(handleOnlineCountChange)
      socketService.onTyping(handleUserTyping)
    } catch (error) {
      const message = error instanceof Error ? error.message : '连接失败'
      Alert.alert('错误', `无法连接到聊天服务器: ${message}`)
    }
  }

  function cleanupChat() {
    socketService.leaveRoom()
    socketService.disconnect()
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  const handleNewMessage = useCallback((msg: ChatMessage) => {
    const displayMsg: DisplayMessage = {
      id: msg.id,
      userId: msg.userId,
      username: msg.username,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      isOwn: msg.userId === user?.id,
      type: msg.type,
    }

    setMessages((prev) => [...prev, displayMsg])

    // 滚动到底部
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }, [user?.id])

  const handleUserJoin = useCallback((data: { userId: string; username: string }) => {
    const systemMsg: DisplayMessage = {
      id: `join_${Date.now()}`,
      userId: 'system',
      username: '系统',
      content: `${data.username} 加入了房间`,
      timestamp: new Date(),
      isOwn: false,
      type: 'system',
    }
    setMessages((prev) => [...prev, systemMsg])
  }, [])

  const handleUserLeave = useCallback((data: { userId: string; username: string }) => {
    const systemMsg: DisplayMessage = {
      id: `leave_${Date.now()}`,
      userId: 'system',
      username: '系统',
      content: `${data.username} 离开了房间`,
      timestamp: new Date(),
      isOwn: false,
      type: 'system',
    }
    setMessages((prev) => [...prev, systemMsg])
  }, [])

  const handleOnlineCountChange = useCallback((count: number) => {
    setOnlineUsers(count)
  }, [])

  const handleUserTyping = useCallback((data: { userId: string; username: string }) => {
    if (data.userId !== user?.id) {
      setTypingUsers((prev) => {
        if (prev.includes(data.username)) return prev
        return [...prev, data.username]
      })

      // 3秒后清除输入状态
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((name) => name !== data.username))
      }, 3000)
    }
  }, [user?.id])

  async function sendMessage() {
    if (!inputText.trim() || !isConnected) return

    const content = inputText.trim()

    // 乐观更新UI
    const optimisticMsg: DisplayMessage = {
      id: `local_${Date.now()}`,
      userId: user?.id || 'anonymous',
      username: user?.username || '匿名用户',
      content,
      timestamp: new Date(),
      isOwn: true,
      type: 'text',
    }

    setMessages((prev) => [...prev, optimisticMsg])
    setInputText('')

    // 滚动到底部
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 100)

    try {
      socketService.sendMessage(content)
    } catch (error) {
      Alert.alert('发送失败', '消息未能发送，请检查网络连接')
    }
  }

  function handleInputChange(text: string) {
    setInputText(text)

    // 发送输入状态
    if (text.length > 0) {
      socketService.startTyping()

      // 停止输入防抖
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping()
      }, 1000)
    }
  }

  function renderMessage({ item }: { item: DisplayMessage }) {
    if (item.type === 'system') {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.content}</Text>
        </View>
      )
    }

    return (
      <View
        style={[
          styles.messageContainer,
          item.isOwn ? styles.messageOwn : styles.messageOther,
        ]}
      >
        {!item.isOwn && (
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>
              {item.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={[styles.messageBubble, item.isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
          {!item.isOwn && (
            <Text style={styles.senderName}>{item.username}</Text>
          )}
          <Text style={[styles.messageText, item.isOwn ? styles.textOwn : styles.textOther]}>
            {item.content}
          </Text>
          <Text style={styles.timestamp}>
            {formatTime(item.timestamp)}
          </Text>
        </View>

        {item.isOwn && (
          <View style={styles.avatar}>
            <Text style={styles.avatarInitialOwn}>
              {(user?.username || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
    )
  }

  function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={26} color="#fafafa" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.roomName} numberOfLines={1}>{roomName}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, isConnected ? styles.online : styles.offline]} />
            <Text style={styles.statusText}>
              {isConnected ? `${onlineUsers} 人在线` : '连接中...'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="people-outline" size={24} color="#fafafa" />
        </TouchableOpacity>
      </View>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>
            {typingUsers.join('、')} 正在输入...
          </Text>
        </View>
      )}

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        inverted={false}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-ellipses-outline" size={64} color="#27272a" />
            <Text style={styles.emptyText}>暂无消息，发送第一条消息吧！</Text>
          </View>
        }
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={`在 ${roomName} 中输入消息...`}
            placeholderTextColor="#71717a"
            value={inputText}
            onChangeText={handleInputChange}
            multiline
            maxLength={500}
            editable={isConnected}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage()}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || !isConnected) && styles.sendDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || !isConnected}
            activeOpacity={0.8}
          >
            <Ionicons
              name="send"
              size={22}
              color={inputText.trim() && isConnected ? '#ffffff' : '#52525b'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#18181b',
    backgroundColor: '#09090b',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 4,
  },
  roomName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fafafa',
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  online: {
    backgroundColor: '#22c55e',
  },
  offline: {
    backgroundColor: '#71717a',
  },
  statusText: {
    fontSize: 12,
    color: '#a1a1aa',
  },
  menuButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#18181b',
  },
  typingText: {
    fontSize: 12,
    color: '#a1a1aa',
    fontStyle: 'italic',
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: '#52525b',
    marginTop: 12,
    textAlign: 'center',
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  systemMessageText: {
    fontSize: 12,
    color: '#71717a',
    backgroundColor: '#18181b',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  messageOther: {
    alignSelf: 'flex-start',
  },
  messageOwn: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#27272a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginLeft: 0,
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a1a1aa',
  },
  avatarInitialOwn: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366f1',
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    minWidth: 100,
  },
  bubbleOther: {
    backgroundColor: '#18181b',
    borderBottomLeftRadius: 4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  bubbleOwn: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  textOwn: {
    color: '#ffffff',
  },
  textOther: {
    color: '#e4e4e7',
  },
  timestamp: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#18181b',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: '#09090b',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#fafafa',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.4,
  },
})
