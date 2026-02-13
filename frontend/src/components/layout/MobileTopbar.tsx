'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';

interface Props {
    onMenuClick: () => void;
}

export default function MobileTopbar({ onMenuClick }: Props) {
    return (
        <header className="
      flex h-[52px] items-center gap-3 border-b border-white/[0.06]
      bg-[#0f0f14] px-4 md:hidden
    ">
            <button
                onClick={onMenuClick}
                className="
          flex h-9 w-9 items-center justify-center
          rounded-lg border border-white/[0.08]
          bg-white/[0.04] text-slate-400
          transition-colors hover:bg-white/[0.07] hover:text-white
        "
                aria-label="Open navigation menu"
            >
                <Menu size={18} />
            </button>

            <Link
                href="/"
                className="flex items-center gap-2 font-heading text-sm font-bold text-white"
            >
                <span className="
          flex h-7 w-7 items-center justify-center
          rounded-lg bg-gradient-to-br from-primary-500 to-violet-600
          text-[11px] font-black text-white
        ">
                    EG
                </span>
                Virtual Lab
            </Link>
        </header>
    );
}
