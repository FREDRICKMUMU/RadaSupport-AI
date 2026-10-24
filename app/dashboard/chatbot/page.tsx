'use client'

// app/dashboard/chatbot/page.tsx
import React, { useEffect, useRef, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import ChatSimulator from '@/components/dashboard/chatbot/chatSimulator'
import AppearanceConfig from '@/components/dashboard/chatbot/apperanceConfig'
import EmbedCodeConfig from '@/components/dashboard/chatbot/embedCodeConfig'

interface ChatBotMetadata {
  id: string;
  user_email: string;
  color: string;
  welcome_message: string;
  created_at: string;
  source_ids: string[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  section: string | null;
  isWelcome?: boolean;
}

const DEFAULT_COLOR = '#4f46e5'
const DEFAULT_WELCOME = 'Hi! How can I help you?'

const ChatbotPage = () => {
  const [metadata, setMetadata] = useState<ChatBotMetadata | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const [primaryColor, setPrimaryColor] = useState(DEFAULT_COLOR)
  const [welcomeMessage, setWelcomeMessage] = useState(DEFAULT_WELCOME)
  const [isSaving, setIsSaving] = useState(false)

  // Load chatbot settings + sections once
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ASSUMPTION: change this URL if your metadata GET route is named differently
        const metaRes = await fetch('/api/chatbot/metadata/fetch')
        let welcome = DEFAULT_WELCOME

        if (metaRes.ok) {
          const metaData: ChatBotMetadata | null = await metaRes.json()
          setMetadata(metaData)

          if (metaData) {
            welcome = metaData.welcome_message || DEFAULT_WELCOME
            setPrimaryColor(metaData.color || DEFAULT_COLOR)
            setWelcomeMessage(welcome)
          }
        }

        setMessages([
          { role: 'assistant', content: welcome, isWelcome: true, section: null },
        ])

        const sectionsRes = await fetch('/api/section/fetch')
        if (sectionsRes.ok) {
          const sectionsData = await sectionsRes.json()
          setSections(Array.isArray(sectionsData) ? sectionsData : [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData() // <- the original had `fetchData;` and never called it
  }, [])

  // Auto-scroll to the newest message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!input.trim() || !activeSection || isTyping) return

    const currentSection = sections.find((s) => s.name === activeSection)
    const sourceIds =
      (currentSection as { source_ids?: string[] } | undefined)?.source_ids ?? []

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
      const res = await fetch('/api/chat/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // The API only understands role + content, so strip our extra fields
          messages: history.map(({ role, content }) => ({ role, content })),
          knowledge_source_ids: sourceIds,
        }),
      })

      const data = await res.json().catch(() => null)

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            data?.response ??
            'Sorry, something went wrong. Please try again.',
          section: null,
        },
      ])
    } catch (error) {
      console.error('Chat failed:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I could not reach the server. Please try again.',
          section: null,
        },
      ])
    } finally {
      setIsTyping(false) // always stop the typing dots, even on errors
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
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

  const handleReset = () => {
    setActiveSection(null)
    setInput('')
    setIsTyping(false)
    setMessages([
      {
        role: 'assistant',
        content: welcomeMessage || DEFAULT_WELCOME,
        isWelcome: true,
        section: null,
      },
    ])
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/chatbot/metadata/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          color: primaryColor,
          welcome_message: welcomeMessage,
        }),
      })

      if (res.ok) {
        const updated = await res.json()
        setMetadata(updated)
      } else {
        console.error('Failed to save changes')
      }
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges = metadata
    ? primaryColor !== (metadata.color || DEFAULT_COLOR) ||
      welcomeMessage !== (metadata.welcome_message || DEFAULT_WELCOME)
    : false

  if (loading) {
    return (
      <div className="p-8 text-zinc-500">Loading chatbot configuration...</div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-400 mx-auto animate-in fade-in duration-500 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Chatbot Playground
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Test your assistant, customize appearance, and deploy it.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
        <div className="lg:col-span-7 flex flex-col h-full min-h-0 space-y-4">
          <ChatSimulator
            messages={messages}
            primaryColor={primaryColor}
            sections={sections}
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            handleKeyDown={handleKeyDown}
            handleSectionClick={handleSectionClick}
            activeSection={activeSection}
            isTyping={isTyping}
            handleReset={handleReset}
            scrollRef={scrollRef}
          />
        </div>

        <div className="lg:col-span-5 h-full min-h-0 overflow-hidden flex flex-col">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6 pb-8">
              <AppearanceConfig
                primaryColor={primaryColor}
                setPrimaryColor={setPrimaryColor}
                welcomeMessage={welcomeMessage}
                setWelcomeMessage={setWelcomeMessage}
                handleSave={handleSave}
                isSaving={isSaving}
                hasChanges={hasChanges}
              />
              <EmbedCodeConfig chatbotId={metadata?.id} />
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

export default ChatbotPage