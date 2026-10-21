'use client'

import React from 'react'
import { ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

// Section comes from @types/types.d.ts

interface SectionTableProps {
    sections: Section[];
    isLoading: boolean;
    onPreview: (section: Section) => void;
    onCreateSection: () => void;
}

const TONE_STYLES: Record<string, string> = {
    neutral: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20',
    friendly: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    professional: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    formal: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    casual: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

const STATUS_STYLES: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    draft: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    inactive: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
}

const FALLBACK_STYLE = 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'

const getToneBadge = (tone: string) => (
    <Badge
        variant="secondary"
        className={`capitalize shadow-none ${TONE_STYLES[tone] ?? FALLBACK_STYLE}`}
    >
        {tone}
    </Badge>
)

const getStatusBadge = (status: string) => (
    <Badge
        variant="secondary"
        className={`capitalize shadow-none ${STATUS_STYLES[status] ?? FALLBACK_STYLE}`}
    >
        {status}
    </Badge>
)

const headClass = 'text-xs uppercase font-medium text-zinc-500'

const SectionsTable = ({
    sections,
    isLoading,
    onPreview,
    onCreateSection,
}: SectionTableProps) => {
    return (
        <Table>
            <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className={headClass}>Name</TableHead>
                    <TableHead className={headClass}>Tone</TableHead>
                    <TableHead className={headClass}>Scope</TableHead>
                    <TableHead className={headClass}>Sources</TableHead>
                    <TableHead className={headClass}>Status</TableHead>
                    <TableHead className={`${headClass} text-right`}>Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={6} className="h-48 text-center">
                            <div className="flex items-center justify-center gap-2 text-zinc-500">
                                <div className="w-4 h-4 rounded-full border-2 border-zinc-600 border-t-transparent animate-spin" />
                                <span>Loading sections...</span>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : sections?.length > 0 ? (
                    sections.map((section) => (
                        <TableRow
                            key={section.id}
                            className="border-white/5 group transition-colors"
                        >
                            <TableCell className="font-medium text-zinc-200">
                                {section.name}
                            </TableCell>
                            <TableCell>{getToneBadge(section.tone)}</TableCell>
                            <TableCell className="text-zinc-400 text-sm">
                                {section.scopeLabel}
                            </TableCell>
                            <TableCell className="text-zinc-400 text-sm">
                                {section.sourceCount}{" "}
                                <span className="text-zinc-600">Sources</span>
                            </TableCell>
                            <TableCell>{getStatusBadge(section.status)}</TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-zinc-400 hover:text-white hover:bg-white/5"
                                    onClick={() => onPreview(section)}
                                >
                                    Preview
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={6} className="h-48 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <ShieldAlert className="w-8 h-8 text-zinc-600" />
                                <Button
                                    variant="link"
                                    className="text-indigo-400"
                                    onClick={onCreateSection}
                                >
                                    Create your first section
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}

export default SectionsTable