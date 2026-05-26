import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'
import chatService from '@/services/chatService'

interface Message {
  id: string
  roomId: string
  userId: string
  username: string
  content: string
  timestamp: Date
  type: 'text' | 'song' | 'system'
}

interface ChatRoomProps {
  roomId?: string
}

export default function ChatRoom({ roomId = 'general' }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Array<{ userId: string; username: string }>>([])
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) return

    // 连接WebSocket
    chatService.connect().then(() => {
      setIsConnected(true)

      // 注册事件监听器
      chatService.on('onMessage', (message: Message) => {
        setMessages((prev) => [...prev, message])
        scrollToBottom()
      })

      chatService.on('onUserJoined', (data: { userId: string; username: string }) => {
        setOnlineUsers((prev) => [...prev, data])

        // 添加系统消息
        setMessages((prev) => [
          ...prev,
          {
            id: `sys_${Date.now()}`,
            roomId,
            userId: 'system',
            username: '系统',
            content: `${data.username} 加入了聊天`,
            timestamp: new Date(),
            type: 'system',
          },
        ])
      })

      chatService.on('onUserLeft', (data: { userId: string; username: string }) => {
        setOnlineUsers((prev) => prev.filter(u => u.userId !== data.userId))

        setMessages((prev) => [
          ...prev,
          {
            id: `sys_${Date.now()}`,
            roomId,
            userId: 'system',
            username: '系统',
            content: `${data.username} 离开了聊天`,
            timestamp: new Date(),
            type: 'system',
          },
        ])
      })

      chatService.on('onUserTyping', (data: { userId: string }) => {
        setTypingUsers((prev) => new Set(prev).add(data.userId))
      })

      chatService.on('onStopTyping', (userId: string) => {
        setTypingUsers((prev) => {
          const next = new Set(prev)
          next.delete(userId)
          return next
        })
      })

      // 加入房间
      chatService.joinRoom(roomId)

      // 获取在线用户列表
      chatService.getOnlineUsers()

      chatService.on('onConnect', () => {
        setIsConnected(true)
      })

      chatService.on('onDisconnect', () => {
        setIsConnected(false)
      })

      chatService.on('onError', () => {
        console.error('聊天服务错误')
      })
    })

    return () => {
      chatService.leaveRoom()
      chatService.off('onMessage')
      chatService.off('onUserJoined')
      chatService.off('onUserLeft')
      chatService.off('onUserTyping')
      chatService.off('onStopTyping')
      chatService.off('onConnect')
      chatService.off('onDisconnect')
      chatService.off('onError')
    }
  }, [roomId, isAuthenticated])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = () => {
    if (!inputMessage.trim()) return

    chatService.sendMessage(inputMessage.trim(), 'text')
    setInputMessage('')

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    chatService.stopTyping()
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value)

    // 发送正在输入状态
    chatService.sendTyping()

    // 防抖停止输入
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      chatService.stopTyping()
    }, 1000)
  }

  if (!isAuthenticated) {
    return (
      <Card className="h-[500px] flex items-center justify-center">
        <CardContent>
          <p className="text-muted-foreground">请先登录以使用聊天功能</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">💬 音乐聊天室</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {isConnected ? '已连接' : '未连接'}
          </div>
        </div>

        {/* 在线用户 */}
        <div className="mt-2 flex items-center gap-1 overflow-x-auto pb-1">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            在线 ({onlineUsers.length}):
          </span>
          {onlineUsers.map((u) => (
            <span key={u.userId} className="px-2 py-0.5 bg-secondary rounded-full text-xs">
              {u.username}
            </span>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${
              msg.type === 'system' ? 'text-center' : msg.userId === user?.id ? 'text-right' : 'text-left'
            }`}
          >
            {msg.type === 'system' ? (
              <span className="text-xs text-muted-foreground italic">{msg.content}</span>
            ) : (
              <div
                className={`inline-block max-w-[80%] px-4 py-2 rounded-lg ${
                  msg.userId === user?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {msg.userId !== user?.id && (
                  <p className="text-xs font-medium mb-1 opacity-70">{msg.username}</p>
                )}
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.userId === user?.id ? 'opacity-60' : 'opacity-50'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* 正在输入提示 */}
        {typingUsers.size > 0 && (
          <div className="text-xs text-muted-foreground italic">
            {Array.from(typingUsers).length > 1
              ? `${Array.from(typingUsers).length}人正在输入...`
              : '对方正在输入...'}
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      {/* 输入框 */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="输入消息..."
            disabled={!isConnected}
            className="flex-1"
          />

          <Button onClick={sendMessage} disabled={!isConnected || !inputMessage.trim()}>
            发送
          </Button>
        </div>
      </div>
    </Card>
  )
}
