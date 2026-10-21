import { Button } from '@/components/ui/button';
import { File, Globe, Upload } from 'lucide-react';
import React from 'react';

const ACTIONS = [
  {
    tab: 'website',
    icon: Globe,
    title: 'Add Website',
    description:
      'Crawl your website or specific pages to automatically keep your knowledge base in sync.',
  },
  {
    tab: 'upload',
    icon: Upload,
    title: 'Upload File',
    description: 'Upload and process files to enhance your knowledge base.',
  },
  {
    tab: 'text',
    icon: File,
    title: 'Add Text',
    description:
      'Paste or write content directly to add it to your knowledge base.',
  },
];

const QuickActions = ({
  onOpenModal,
}: {
  onOpenModal: (tab: string) => void;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {ACTIONS.map(({ tab, icon: Icon, title, description }) => (
        <Button
          key={tab}
          variant="outline"
          className="h-auto py-8 px-6 flex flex-col items-center justify-center gap-4 border-white/5 bg-[#0a0a0e] hover:bg-white/2 hover:border-emerald-500/30 transition-all hover:text-white group whitespace-normal"
          onClick={() => onOpenModal(tab)}
        >
          <div className="p-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
            <Icon className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="space-y-1.5 text-center w-full">
            <span className="text-sm font-medium block whitespace-normal">
              {title}
            </span>
            <p className="text-xs text-zinc-500 font-normal leading-relaxed whitespace-normal wrap-break-word">
              {description}
            </p>
          </div>
        </Button>
      ))}
    </div>
  );
};

export default QuickActions;