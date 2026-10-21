'use client'

import React, { useMemo, useState } from 'react'
import { FileText, Filter, Globe, Search, Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

export type SourceType = 'website' | 'upload' | 'text'
export type SourceStatus = 'active' | 'training' | 'error' | 'excluded'

export interface KnowledgeSource {
    id?: string | number;
    name: string;
    type: string;
    status: string;
    source_url?: string | null;
    last_updated?: string | Date | null;
    content?: string | null;
}

interface KnowledgeTableProps {
    sources: KnowledgeSource[];
    onSourceClick: (source: KnowledgeSource) => void;
    isLoading: boolean;
}

export const getTypeIcon = (type: SourceType) => {
    switch (type) {
        case 'website':
            return <Globe className="w-4 h-4 text-blue-400" />;
        case 'upload':
            return <Upload className="w-4 h-4 text-emerald-400" />;
        case 'text':
        default:
            return <FileText className="w-4 h-4 text-zinc-400" />;
    }
}

export const getStatusBadge = (status: SourceStatus) => {
    switch (status) {
        case 'active':
            return <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 shadow-none">Active</Badge>;
        case 'training':
            return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20 shadow-none">Training</Badge>;
        case 'error':
            return <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 shadow-none">Error</Badge>;
        case 'excluded':
            return <Badge variant="secondary" className="bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500/20 border-zinc-500/20 shadow-none">Excluded</Badge>;
        default:
            return <Badge variant="outline">Unknown</Badge>;
    }
}

const headClass = 'text-xs uppercase font-medium text-zinc-500'

const KnowledgeTable = ({ sources, onSourceClick, isLoading }: KnowledgeTableProps) => {
    const [query, setQuery] = useState('')

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return sources
        return sources.filter(
            (s) =>
                s.name?.toLowerCase().includes(q) ||
                s.source_url?.toLowerCase().includes(q)
        )
    }, [sources, query])

    return (
        <Card className="border-white/5 bg-[#0a0a0e]">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium text-white">
                        Sources
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                            <Input
                                className="pl-9 h-9 w-50 md:w-75 bg-white/2 border-white/10 text-sm"
                                placeholder="Search sources..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-zinc-400 hover:text-white hover:bg-white/5"
                        >
                            <Filter className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className={headClass}>Name</TableHead>
                            <TableHead className={headClass}>Type</TableHead>
                            <TableHead className={headClass}>Status</TableHead>
                            <TableHead className={headClass}>Last Updated</TableHead>
                            <TableHead className={`${headClass} text-right`}>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="border-white/5">
                                    {Array.from({ length: 5 }).map((_, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-5 w-32 bg-white/5" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : filtered.length > 0 ? (
                            filtered.map((source, index) => (
                                <TableRow
                                    key={source.id ?? index}
                                    className="border-white/5 hover:bg-white/2 cursor-pointer group transition-colors"
                                    onClick={() => onSourceClick(source)}
                                >
                                    <TableCell className="font-medium text-zinc-200 group-hover:text-white">
                                        <div className="flex items-center gap-3">
                                            {getTypeIcon(source.type as SourceType)}
                                            <div className="flex flex-col">
                                                <span>{source.name}</span>
                                                {source.source_url && (
                                                    <span className="text-xs text-zinc-500 font-normal">
                                                        {source.source_url}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell className="capitalize text-zinc-400">
                                        {source.type}
                                    </TableCell>

                                    <TableCell>
                                        {getStatusBadge(source.status as SourceStatus)}
                                    </TableCell>

                                    <TableCell className="text-zinc-400">
                                        {source.last_updated
                                            ? new Date(source.last_updated).toLocaleDateString()
                                            : '—'}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-zinc-400 hover:text-white hover:bg-white/2"
                                        >
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow className="hover:bg-transparent">
                                <TableCell
                                    colSpan={5}
                                    className="h-32 text-center text-zinc-500"
                                >
                                    {query
                                        ? 'No sources match your search.'
                                        : 'No knowledge sources added yet.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default KnowledgeTable