import { ArrowRight, Send, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ParticleBackground } from "@/components/particle-background";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
      <ParticleBackground />

      <div className="max-w-4xl mx-auto text-center relative z-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 animate-float">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          <span className="text-xs text-zinc-300 tracking-wide font-light">
            Version 1.0.0 available now
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-white mb-6 leading-[1.1]">
          Friendly AI support,
          <br />
          <span className="text-zinc-400">Your AI website assistant</span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 font-light mb-10 max-w-2xl mx-auto leading-relaxed">
          RadaSupport reads your website and answers visitors instantly,
          in a friendly, human voice.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link
            href="/sign-in"
            className="h-11 px-8 cursor-pointer rounded-full bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-all flex items-center gap-2"
          >
            Start for free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            className="h-11 px-8 rounded-full border border-zinc-800 text-zinc-300 text-sm font-medium hover:border-zinc-600 hover:text-white transition-all bg-black/20 backdrop-blur-sm"
          >
            View Demo
          </button>
        </div>
      </div>

      {/* Chat preview */}
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="rounded-2xl p-1 md:p-2 relative overflow-hidden ring-1 ring-white/10 bg-[#0a0a0e] shadow-2xl animate-float">
          <div className="flex flex-col h-125 md:h-150 w-full bg-[#0a0a0e] rounded-xl overflow-hidden">
            <div className="h-14 border-b border-white/5 flex items-center px-6 bg-[#0e0e12] shrink-0">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-zinc-300">
                  RadaSupport AI
                </span>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-zinc-950/30">

              {/* Bot: greeting + quick options */}
              <div className="flex w-full flex-col items-start">
                <div className="flex max-w-[85%] gap-3 flex-row">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                    <Image
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&fit=crop"
                      alt="Support agent"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="p-4 rounded-2xl text-sm leading-relaxed shadow-sm bg-white text-zinc-900 rounded-tl-sm">
                      Hi there, how can I help you today?
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1 ml-1">
                      <span className="px-3 py-1.5 rounded-full border border-zinc-700 bg-zinc-800/50 text-zinc-300 text-xs font-medium cursor-default">FAQ</span>
                      <span className="px-3 py-1.5 rounded-full border border-zinc-700 bg-zinc-800/50 text-zinc-300 text-xs font-medium cursor-default">Pricing</span>
                      <span className="px-3 py-1.5 rounded-full border border-zinc-700 bg-zinc-800/50 text-zinc-300 text-xs font-medium cursor-default">Support</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* User: question */}
              <div className="flex w-full flex-col items-end">
                <div className="flex max-w-[85%] gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/5 bg-zinc-800">
                    <User className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div className="p-4 rounded-2xl text-sm leading-relaxed shadow-sm bg-zinc-600 text-white rounded-tr-sm">
                    I need some information about RadaSupport
                  </div>
                </div>
              </div>

              {/* Bot: answer */}
              <div className="flex w-full flex-col items-start">
                <div className="flex max-w-[85%] gap-3 flex-row">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                    <Image
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&fit=crop"
                      alt="Support agent"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 rounded-2xl text-sm leading-relaxed shadow-sm bg-zinc-800 text-zinc-200 rounded-tl-sm">
                   RadaSupport answers customer questions using your own website content, so your visitors get help instantly, day or night.
                  </div>
                </div>

           
              </div>
              

            </div>
          </div>
               <div className="p-4 bg-[#oAoAoE] border-white/5 shrink-0">
                    <div className="relative">
                      <div className="min-h-12.5 w-full px-4 py-3 text-sm bg-zinc-900/50 border border-white/10 rounded-xl text-zinc-500 flex items-center justify-between">
                        <span>Type a message...</span>
                        <button className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 cursor-default">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                </div>
        </div>

        
      </div>
    </section>
  );
};

export default Hero;