'use client'

import React, { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, ChevronDown, MessageCircle, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ChatBotMetadata {
  id: string;
  color: string;
  welcome_message: string;
}

interface WidgetSection {
  id: string;
  name: string;
  source_ids: string[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  section: string | null;
  isWelcome?: boolean;
}

const AGENT_IMAGE =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&fit=crop'

const postResize = (width: string, height: string, borderRadius: string) => {
  if (typeof window === 'undefined' || window.parent === window) return
  window.parent.postMessage({ type: 'resize', width, height, borderRadius }, '*')
}

const AgentAvatar = () => (
  <div className="relative shrink-0">
    <div className="w-8 h-8 rounded-full overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={AGENT_IMAGE}
        alt="Support agent"
        width={32}
        height={32}
        className="w-full h-full object-cover"
      />
    </div>
    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0E0E12]" />
  </div>
)

const EmbedWidget = () => {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [metadata, setMetadata] = useState<ChatBotMetadata | null>(null)
  const [sections, setSections] = useState<WidgetSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const scrollViewportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.style.backgroundColor = 'transparent'
    document.documentElement.style.backgroundColor = 'transparent'
    postResize('60px', '60px', '30px')
  }, [])

  const toggleOpen = () => {
    const next = !isOpen
    setIsOpen(next)
    if (next) postResize('380px', '520px', '12px')
    else postResize('60px', '60px', '30px')
  }

  useEffect(() => {
    if (!token) {
      setError('Missing session token')
      setLoading(false)
      return
    }

    const fetchConfig = async () => {
      try {
        const res = await fetch(`/api/widget/config?token=${token}`)
        if (!res.ok) throw new Error('Failed to load widget configuration')

        const data = await res.json()
        setMetadata(data.metadata)
        setSections(data.sections || [])

        setMessages([
          {
            role: 'assistant',
            content:
              data.metadata?.welcome_message || 'Hi! How can I help you today?',
            isWelcome: true,
            section: null,
          },
        ])
      } catch (err) {
        console.error(err)
        setError('Unable to load chat. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [token])

  useEffect(() => {
    scrollViewportRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, isOpen])

  const canSend = !!activeSection && input.trim().length > 0 && !isTyping

  const handleSend = async () => {
    if (!canSend || !token) return

    const currentSection = sections.find((s) => s.name === activeSection)
    const sourceIds = currentSection?.source_ids || []

    const userMsg: ChatMessage = {
      role: 'user',
      content: input.trim(),
      section: activeSection,
    }
    const history = [...messages, userMsg]

    setMessages(history)
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/chat/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
          knowledge_source_ids: sourceIds,
        }),
      })

      const data = res.ok ? await res.json() : null

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            data?.response ??
            "I'm having trouble connecting right now. Please try again.",
          section: null,
        },
      ])
    } catch (err) {
      console.error(err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again.",
          section: null,
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSectionClick = (sectionName: string) => {
    setActiveSection(sectionName)
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: sectionName, section: null },
    ])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `You can ask me any question related to "${sectionName}".`,
          section: sectionName,
        },
      ])
    }, 800)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const primaryColor = metadata?.color || '#4f46e5'

  if (loading) return null

  if (error && isOpen) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-2 bg-[#0A0A0E] text-red-400 text-sm rounded-xl border border-white/10 p-4 text-center">
        <AlertCircle className="w-10 h-10" />
        <p>{error}</p>
      </div>
    )
  }

  if (!isOpen) {
    return (
      <button
        onClick={toggleOpen}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:brightness-110 transition-all text-white"
        style={{ backgroundColor: primaryColor }}
        aria-label="Open chat"
      >
        <MessageCircle className="w-8 h-8" />
      </button>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0E] overflow-hidden rounded-xl border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-[#0E0E12] shadow-sm shrink-0 z-20">
        <div className="flex items-center gap-3">
          <AgentAvatar />
          <div>
            <h1 className="text-sm font-semibold text-white leading-none">
              Support
            </h1>
            <span className="text-[11px] text-emerald-400 font-medium">
              Online
            </span>
          </div>
        </div>

        <button
          onClick={toggleOpen}
          className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
          aria-label="Minimize chat"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-zinc-950/30 p-4">
        <div className="space-y-6 pb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex w-full flex-col',
                msg.role === 'user' ? 'items-end' : 'items-start'
              )}
            >
              <div
                className={cn(
                  'flex max-w-[85%] gap-3',
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                {msg.role !== 'user' && <AgentAvatar />}

                <div className="space-y-2">
                  <div
                    className={cn(
                      'p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm',
                      msg.role === 'user'
                        ? 'bg-zinc-800 text-zinc-100 rounded-tr-sm'
                        : 'bg-white text-zinc-900 rounded-tl-sm'
                    )}
                  >
                    {msg.content}
                  </div>

                  {msg.isWelcome && sections.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1 ml-1 animate-in fade-in slide-in-from-top-1 duration-300">
                      {sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => handleSectionClick(section.name)}
                          className={cn(
                            'px-3 py-1.5 rounded-full border text-xs font-medium transition-all',
                            activeSection === section.name
                              ? 'border-transparent text-white'
                              : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-600 text-zinc-300'
                          )}
                          style={
                            activeSection === section.name
                              ? { backgroundColor: primaryColor }
                              : {}
                          }
                        >
                          {section.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex w-full justify-start">
              <div className="flex max-w-[85%] gap-3 flex-row">
                <AgentAvatar />
                <div className="p-4 rounded-2xl bg-white text-zinc-900 rounded-tl-sm shadow-sm flex items-end gap-1">
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={scrollViewportRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-[#0a0a0e] border-t border-white/5 shrink-0 z-20">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!activeSection}
            placeholder={
              activeSection ? 'Type a message...' : 'Select a topic above...'
            }
            className="min-h-12.5 max-h-30 pr-12 outline-none text-white bg-zinc-900/50 border-white/10 resize-none rounded-xl disabled:opacity-45 disabled:cursor-not-allowed placeholder:text-zinc-700 focus:ring-1 focus:ring-white/20"
          />

          <Button
            size="icon"
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              'absolute right-2 bottom-2 h-8 w-8 transition-colors',
              !canSend ? 'bg-zinc-800 text-zinc-50' : ''
            )}
            style={
              canSend ? { backgroundColor: primaryColor, color: 'white' } : {}
            }
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <div className="mt-2 text-center">
          <Link
            href="/"
            target="_blank"
            className="text-[10px] text-zinc-600 font-medium hover:text-zinc-500 transition-colors"
          >
            Powered by RadaSupport
          </Link>
        </div>
      </div>
    </div>
  )
}

const EmbedPage = () => (
  <Suspense fallback={null}>
    <EmbedWidget />
  </Suspense>
)

export default EmbedPage