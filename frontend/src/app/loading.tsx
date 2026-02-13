import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
                <p className="font-heading text-sm font-medium text-slate-500 animate-pulse">
                    Loading EG Virtual Lab...
                </p>
            </div>
        </div>
    );
}
