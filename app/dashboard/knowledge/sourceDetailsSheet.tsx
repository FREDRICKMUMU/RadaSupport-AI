'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import {
    getStatusBadge,
    getTypeIcon,
    type KnowledgeSource,
    type SourceStatus,
    type SourceType,
} from '@/components/dashboard/knowledge/knowledgeTable'

interface SourceDetailsSheetProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    selectedSource: KnowledgeSource | null;
    onDisconnect?: (source: KnowledgeSource) => void;
}

const SourceDetailsSheet = ({
    isOpen,
    setIsOpen,
    selectedSource,
    onDisconnect,
}: SourceDetailsSheetProps) => {
    if (!selectedSource) return null;

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent className="w-full sm:max-w-md border-l border-white/10 bg-[#0a0a0e] p-0 shadow-2xl">
                <div className="h-full flex flex-col">
                    <SheetHeader className="p-6 border-b border-white/5">
                        <SheetTitle className="flex items-center gap-2 text-white">
                            {getTypeIcon(selectedSource.type as SourceType)}
                            {selectedSource.name}
                        </SheetTitle>
                        <SheetDescription className="text-zinc-500 break-all">
                            {selectedSource.source_url || "Manual entry"}
                        </SheetDescription>
                        <div className="flex items-center gap-3 pt-2">
                            {getStatusBadge(selectedSource.status as SourceStatus)}
                            {selectedSource.last_updated && (
                                <span className="text-xs text-zinc-500">
                                    Updated{" "}
                                    {new Date(selectedSource.last_updated).toLocaleString()}
                                </span>
                            )}
                        </div>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-zinc-300 uppercase tracking-wide">
                                Content Preview
                            </h4>
                            <div className="p-4 rounded-lg border border-white/5 bg-black/40 font-mono text-xs text-zinc-400 h-72 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                                {selectedSource.content ||
                                    `# ${selectedSource.name}\n\n(No content preview available)`}
                            </div>
                        </div>
                    </div>

                    <SheetFooter className="p-6 border-t border-white/5 bg-[#050509]">
                        <Button
                            variant="destructive"
                            className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20"
                            disabled={!onDisconnect}
                            onClick={() => onDisconnect?.(selectedSource)}
                        >
                            Disconnect Source
                        </Button>
                    </SheetFooter>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default SourceDetailsSheet