'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import MobileTopbar from '@/components/layout/MobileTopbar';

export default function LabLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#09090b]">

            {/* ── Sidebar (desktop: always visible, mobile: drawer) ── */}
            <Sidebar
                mobileOpen={sidebarOpen}
                onMobileClose={() => setSidebarOpen(false)}
            />

            {/* ── Mobile backdrop overlay ── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm md:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* ── Main content shell ── */}
            <div className="flex flex-1 flex-col overflow-hidden">

                {/* Mobile topbar — only visible on small screens */}
                <MobileTopbar onMenuClick={() => setSidebarOpen(true)} />

                {/* Page content */}
                <main className="flex-1 overflow-y-auto bg-white scrollbar-thin">
                    {children}
                </main>
            </div>
        </div>
    );
}
