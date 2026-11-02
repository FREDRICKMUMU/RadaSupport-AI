'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Search,
  Send,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Conversation {
  id: string;
  user: string;
  lastMessage: string;
  time: string;
  email?: string;
  visitor_ip?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const AGENT_IMAGE =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&fit=crop'

const formatMessageTime = (value: string) => {
  if (!value) return ''
  const date = new Date(value)
  return isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const ConversationsPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [currentMessages, setCurrentMessages] = useState<Message[]>([])
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [replyContent, setReplyContent] = useState('')
  const [isSending, setIsSending] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const filteredConversations = conversations.filter(
    (c) =>
      c.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedConv = conversations.find((c) => c.id === selectedId)

  // Inbox list
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversation/fetch')
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations ?? [])
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setIsLoadingList(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Messages of the selected conversation
  useEffect(() => {
    if (!selectedId) {
      setCurrentMessages([])
      return
    }

    let cancelled = false

    const loadMessages = async () => {
      setIsLoadingMessages(true)
      try {
        const res = await fetch(
          `/api/conversation/messages?id=${encodeURIComponent(selectedId)}`
        )
        if (res.ok && !cancelled) {
          const data = await res.json()
          setCurrentMessages(data.messages ?? [])
        }
      } catch (error) {
        console.error('Failed to load messages:', error)
      } finally {
        if (!cancelled) setIsLoadingMessages(false)
      }
    }

    loadMessages()
    return () => {
      cancelled = true
    }
  }, [selectedId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages, isLoadingMessages])

  const handleSendReply = async () => {
    const content = replyContent.trim()
    if (!content || !selectedId || isSending) return

    setIsSending(true)
    try {
      const res = await fetch('/api/conversation/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: selectedId, content }),
      })

      if (res.ok) {
        setCurrentMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content,
            created_at: new Date().toISOString(),
          },
        ])
        setReplyContent('')

        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedId
              ? { ...c, lastMessage: content, time: 'just now' }
              : c
          )
        )
      } else {
        console.error('Failed to send reply')
      }
    } catch (error) {
      console.error('Failed to send reply:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendReply()
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-black animate-in fade-in duration-500">
      {/* Inbox list */}
      <div className="w-87.5 md:w-100 shrink-0 flex flex-col border-r border-white/5 bg-[#050509]">
        <div className="p-4 border-b border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-white">Inbox</h1>
            <div className="text-xs text-zinc-500">
              {filteredConversations.length}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search..."
              className="pl-9 bg-[#0A0A0E] border-white/10 text-sm focus:border-white/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col">
            {isLoadingList ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 text-sm">
                No conversations found
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedId(conversation.id)}
                  className={cn(
                    'flex flex-col items-start gap-1 p-4 text-left transition-colors border-b border-white/5 hover:bg-white/2',
                    selectedId === conversation.id
                      ? 'bg-white/4 border-l-2 border-l-indigo-500 border-b-transparent'
                      : 'border-l-2 border-l-transparent'
                  )}
                >
                  <div className="flex w-full flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'font-medium text-sm truncate max-w-45',
                          selectedId === conversation.id
                            ? 'text-white'
                            : 'text-zinc-300'
                        )}
                      >
                        {conversation.user}
                      </span>
                      <span className="text-[10px] text-zinc-500 shrink-0">
                        {conversation.time}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 line-clamp-2">
                      {conversation.lastMessage}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Conversation view */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0e]">
        {selectedConv ? (
          <>
            <div className="h-16 shrink-0 border-b border-white/5 flex items-center justify-between px-6 bg-[#0e0e12]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                  <User className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="font-medium text-white text-sm">
                    {selectedConv.user}
                  </h2>
                  {selectedConv.visitor_ip && (
                    <span className="text-xs text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded">
                      {selectedConv.visitor_ip}
                    </span>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1 min-h-0 p-6">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center p-10">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-6">
                  {currentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex w-full gap-3',
                        msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      )}
                    >
                      {msg.role === 'user' ? (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/5 bg-zinc-800">
                          <User className="w-4 h-4 text-zinc-400" />
                        </div>
                      ) : (
                        <div className="relative w-8 h-8 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={AGENT_IMAGE}
                            alt="Support Agent"
                            width={32}
                            height={32}
                            className="w-full h-full rounded-full object-cover border border-white/5"
                          />
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0e0e12] rounded-full" />
                        </div>
                      )}

                      <div
                        className={cn(
                          'flex flex-col gap-1 max-w-[75%]',
                          msg.role === 'user' ? 'items-end' : 'items-start'
                        )}
                      >
                        <div
                          className={cn(
                            'p-3 rounded-lg text-sm leading-relaxed',
                            msg.role === 'user'
                              ? 'bg-zinc-800 text-zinc-200'
                              : 'bg-[#050509] border border-white/10 text-zinc-300'
                          )}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-zinc-600 px-1">
                          {formatMessageTime(msg.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            <div className="shrink-0 p-4 border-t border-white/5 bg-[#0e0e12]">
              <div className="max-w-3xl mx-auto flex gap-2">
                <Input
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your reply..."
                  className="bg-zinc-900/50 border-white/10 text-zinc-200 placeholder:text-zinc-600"
                  disabled={isSending}
                />
                <Button
                  onClick={handleSendReply}
                  disabled={!replyContent.trim() || isSending}
                  size="icon"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-2">
            <MessageSquare className="w-8 h-8 text-zinc-700" />
            <p className="text-sm mt-2">Select a conversation to view details</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversationsPage;