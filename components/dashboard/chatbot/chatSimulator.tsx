'use client'

import React from 'react'
import type { RefObject } from 'react'
import { Bot, RefreshCw, Send, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'

// Section comes from @types/types.d.ts

interface ChatSimulatorProps {
    messages: any[];
    primaryColor: string;
    sections: Section[];
    input: string;
    setInput: (val: string) => void;
    handleSend: () => void;
    handleKeyDown: (e: React.KeyboardEvent) => void;
    handleSectionClick: (name: string) => void;
    activeSection: string | null;
    isTyping: boolean;
    handleReset: () => void;
    scrollRef: RefObject<HTMLDivElement | null>;
}

const ChatSimulator = ({
    messages,
    primaryColor,
    sections,
    input,
    setInput,
    handleSend,
    handleKeyDown,
    handleSectionClick,
    activeSection,
    isTyping,
    handleReset,
    scrollRef,
}: ChatSimulatorProps) => {
    const canSend = !!activeSection && input.trim().length > 0;

    return (
        <Card className="flex flex-col h-[600px] border-white/5 bg-[#0a0a0e] overflow-hidden relative shadow-2xl">
            <div className="h-14 shrink-0 border-b border-white/5 flex items-center justify-between px-6 bg-[#0e0e12]">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium text-zinc-300">Test Environment</span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-8 text-zinc-500 hover:text-white hover:bg-white/10"
                >
                    <RefreshCw className="w-3.5 h-3.5 mr-2" />
                    Reset
                </Button>
            </div>

            <ScrollArea className="flex-1 min-h-0 p-6 relative bg-zinc-950/30">
                <div className="space-y-6 pb-4">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex w-full flex-col",
                                msg.role === "user" ? "items-end" : "items-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "flex max-w-[80%] gap-3",
                                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/5",
                                        msg.role === "user" ? "bg-zinc-800" : "text-white"
                                    )}
                                    style={
                                        msg.role !== "user"
                                            ? { backgroundColor: primaryColor }
                                            : {}
                                    }
                                >
                                    {msg.role === "user" ? (
                                        <User className="w-4 h-4 text-zinc-400" />
                                    ) : (
                                        <Bot className="w-4 h-4 text-white" />
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div
                                        className={cn(
                                            "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                                            msg.role === "user"
                                                ? "bg-zinc-800 text-zinc-200 rounded-tr-sm"
                                                : "bg-white text-zinc-900 rounded-tl-sm"
                                        )}
                                    >
                                        {msg.content}
                                    </div>

                                    {msg.isWelcome && sections.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-1 ml-1 animate-in fade-in slide-in-from-top-1 duration-300">
                                            {sections.map((section) => (
                                                <button
                                                    key={section.id}
                                                    type="button"
                                                    onClick={() => handleSectionClick(section.name)}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-full border text-xs font-medium transition-colors",
                                                        activeSection === section.name
                                                            ? "border-transparent text-white"
                                                            : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700"
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
                            <div className="flex max-w-[80%] gap-3 flex-row">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/5"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    <Bot className="w-4 h-4 text-white" />
                                </div>

                                <div className="p-4 rounded-2xl bg-white text-zinc-900 rounded-tl-sm shadow-sm flex items-end gap-1">
                                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            <div className="shrink-0 p-4 bg-[#0a0a0e] border-t border-white/5">
                <div className="relative">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={!activeSection}
                        placeholder={
                            activeSection
                                ? "Type a message..."
                                : "Please select a category above to start..."
                        }
                        className="min-h-12.5 max-h-37.5 pr-12 outline-none text-white bg-zinc-900/50 border-white/10 resize-none rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    />

                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!canSend}
                        className={cn(
                            "absolute right-2 bottom-2 h-8 w-8 transition-colors",
                            !canSend ? "bg-zinc-800 text-zinc-50" : ""
                        )}
                        style={
                            canSend
                                ? { backgroundColor: primaryColor, color: "white" }
                                : {}
                        }
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}

export default ChatSimulator