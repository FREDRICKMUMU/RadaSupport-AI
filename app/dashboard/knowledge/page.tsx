"use client"

import AddKnowledgeModal from '@/components/dashboard/knowledge/addKnowledgeModal'
import KnowledgeTable, {
    type KnowledgeSource,
} from '@/components/dashboard/knowledge/knowledgeTable'
import QuickActions from '@/components/dashboard/knowledge/quickActions'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import SourceDetailsSheet from './sourceDetailsSheet'
import React, { useCallback, useEffect, useState } from 'react'

const QuickActionsComponent = QuickActions as unknown as React.ComponentType<{
    onOpenModal: (tab: string) => void;
}>;

const Page = () => {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [defaultTab, setDefaultTab] = useState('website');
    const [knowledgeStoringLoader, setKnowledgeStoringLoader] = useState(false);
    const [knowledgeSourcesLoader, setKnowledgeSourcesLoader] = useState(true);
    const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);

    const [selectedSource, setSelectedSource] = useState<KnowledgeSource | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const openModal = (tab: string) => {
        setDefaultTab(tab);
        setIsAddOpen(true);
    };

    const loadSources = useCallback(async () => {
        try {
            const res = await fetch("/api/knowledge/fetch");
            if (!res.ok) throw new Error("Failed to load sources");
            const data = await res.json();
            setKnowledgeSources(data.sources ?? []);
        } catch (error) {
            console.error(error);
        } finally {
            setKnowledgeSourcesLoader(false);
        }
    }, []);

    useEffect(() => {
        loadSources();
    }, [loadSources]);

    const handleImportSource = async (data: any) => {
        setKnowledgeStoringLoader(true);

        try {
            let response: Response;

            if (data.type === "upload" && data.file) {
                const formData = new FormData();
                formData.append("type", "upload");
                formData.append("file", data.file);

                // Don't set Content-Type here: the browser adds the multipart boundary.
                response = await fetch("/api/knowledge/store", {
                    method: "POST",
                    body: formData,
                });
            } else {
                response = await fetch("/api/knowledge/store", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
            }

            if (!response.ok) {
                const err = await response.json().catch(() => null);
                throw new Error(err?.error || "Failed to store source");
            }

            await loadSources();
            setIsAddOpen(false);
        } catch (error) {
            console.error(error);
            // Re-throw so the modal keeps its form and shows an error message.
            throw error;
        } finally {
            setKnowledgeStoringLoader(false);
        }
    };

    const handleSourceClick = (source: KnowledgeSource) => {
        setSelectedSource(source);
        setIsSheetOpen(true);
    }

    return (
        <div className='p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500'>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                <div>
                    <h1 className='text-2xl font-semibold text-white tracking-tight'>Knowledge Base</h1>
                    <p className='text-sm text-zinc-400 mt-1'>Welcome to the Knowledge Base!</p>
                </div>

                <div className='flex items-center gap-2'>
                    <Button
                        onClick={() => openModal('website')}
                        className='bg-white text-black hover:bg-zinc-100'
                    >
                        <Plus className='w-4 h-4 mr-2' />
                        Add Knowledge
                    </Button>
                </div>
            </div>

            {/* Quick Actions */}
            <QuickActionsComponent onOpenModal={openModal} />

            <KnowledgeTable
                sources={knowledgeSources}
                onSourceClick={handleSourceClick}
                isLoading={knowledgeSourcesLoader}
            />

            <AddKnowledgeModal
                isOpen={isAddOpen}
                setIsOpen={setIsAddOpen}
                defaultTab={defaultTab}
                setDefaultTab={setDefaultTab}
                onImport={handleImportSource}
                isLoading={knowledgeStoringLoader}
                existingSources={knowledgeSources as React.ComponentProps<typeof AddKnowledgeModal>['existingSources']}
            />

            <SourceDetailsSheet
            isOpen={isSheetOpen}
            setIsOpen={setIsSheetOpen}
            selectedSource={selectedSource}
            />
        </div>
    )
}

export default Page