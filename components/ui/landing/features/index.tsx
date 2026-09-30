import { BookOpen, MessageCircleHeart, ShieldCheck } from 'lucide-react';
import React from 'react'

const Features = () => {
  return (
    <section id='features' className='py-32 px-6 max-w-6xl mx-auto'>
        <div className='mb-20'>
            <h2 className='text-3xl md:text-5xl font-medium text-white tracking-tight mb-6'>Trustworthy by default.</h2>
            <p className='text-xl text-zinc-500 font-light max-w-xl leading-relaxed'>
           No hallucinations, no guesswork. Every answer comes straight from your content, in a voice you define.
            </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='group p-8 rounded-3xl border border-white/5 bg-linear-to-b from-white/3 to-transparent hover:border-white/10 transition-colors'>
                <div className='w-12 h-12 rounded-2xl bg-[#oAoAoE] border border-white/10 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform'>
                    <BookOpen className='w-6 h-6 text-zinc-300' />
                </div>
                <h3 className='text-lg font-medium text-white mb-3'>
                    Knowledge Graph
                </h3>
                <p className='text-sm text-zinc-400 font-light leading-relaxed'>
                  RadaSupport reads your website and documentation automatically, turning them into knowledge your assistant understands. No manual setup needed.
                </p>
            </div>

             <div className='group p-8 rounded-3xl border border-white/5 bg-linear-to-b from-white/3 to-transparent hover:border-white/10 transition-colors'>
                <div className='w-12 h-12 rounded-2xl bg-[#oAoAoE] border border-white/10 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform'>
                    <ShieldCheck className='w-6 h-6 text-zinc-300' />
                </div>
                <h3 className='text-lg font-medium text-white mb-3'>
                    Strict Guardrails
                </h3>
                <p className='text-sm text-zinc-400 font-light leading-relaxed'>
               Set clear limits on what your assistant will and won't answer. Anything outside scope gets a polite decline.
                </p>
            </div>


                         <div className='group p-8 rounded-3xl border border-white/5 bg-linear-to-b from-white/3 to-transparent hover:border-white/10 transition-colors'>
                <div className='w-12 h-12 rounded-2xl bg-[#oAoAoE] border border-white/10 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform'>
                    <MessageCircleHeart className='w-6 h-6 text-zinc-300' />
                </div>
                <h3 className='text-lg font-medium text-white mb-3'>
                    Tone Matching
                </h3>
                <p className='text-sm text-zinc-400 font-light leading-relaxed'>
                    Professional, playful, or straight to the point, the AI matches your brand's voice exactly.                </p>
            </div>

        </div>
    </section>
  )
}

export default Features;