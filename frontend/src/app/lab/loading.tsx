import { Skeleton } from '@/components/ui/skeleton';

export default function LabLoading() {
    return (
        <div className="flex h-full w-full overflow-hidden">
            {/* ─── Skeleton: Input Panel (Left) ─── */}
            <div className="w-input-panel min-w-input-panel border-r border-edge-light bg-white p-4 space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-full" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                </div>
                <div className="space-y-4 pt-4 border-t border-edge-light">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                </div>
            </div>

            {/* ─── Skeleton: Right Area ─── */}
            <div className="flex flex-1 flex-col bg-surface-canvas">
                {/* Toolbar Skeleton */}
                <div className="h-[52px] border-b border-edge-light bg-white px-4 flex items-center justify-between">
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                    <Skeleton className="h-6 w-32 hidden md:block" />
                    <Skeleton className="h-8 w-24 rounded-lg" />
                </div>

                {/* Instruction Skeleton */}
                <div className="h-[70px] border-b border-edge-light bg-white p-4 flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-full max-w-lg" />
                    </div>
                </div>

                {/* Canvas Skeleton */}
                <div className="flex-1 p-6 flex items-center justify-center">
                    <Skeleton className="h-full w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}
