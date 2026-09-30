import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className='border-t border-white/5 py-12 bg-black/40'>
      <div className='max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6'>

        <Link href={"/"} className='flex items-center gap-2'>
          <div className='w-5 h-5 bg-white rounded-sm flex items-center justify-center'>
            <div className='w-2.5 h-2.5 bg-black rounded-[1px]'></div>
          </div>
          <span className='text-base font-semibold font-inter tracking-tight text-white/90'>
            RadaSupport AI
          </span>
        </Link>

        <div className='flex items-center gap-8 text-sm text-zinc-500'>
          <Link href="/privacy" className='hover:text-zinc-300 transition-colors'>
            Privacy
          </Link>
          <Link href="/terms" className='hover:text-zinc-300 transition-colors'>
            Terms
          </Link>

        <Link href="/terms" className='hover:text-zinc-300 transition-colors'>
            X
          </Link>

          <span>&copy; {new Date().getFullYear()} RadaSupport AI</span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;