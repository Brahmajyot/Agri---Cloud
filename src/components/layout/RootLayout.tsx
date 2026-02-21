import { Outlet } from "react-router-dom"
import { Navbar, BottomNav } from "./Navigation"
import { Toaster } from "sonner"
import WhatsAppFeedback from "@/components/ui/WhatsAppFeedback"

export default function RootLayout() {
    return (
        <div className="min-h-screen bg-[var(--color-bg)] font-sans text-[var(--color-text-main)] selection:bg-[var(--color-primary)]/20">
            <Navbar />
            <main className="container mx-auto px-4 py-6 pb-24 md:pb-8 animate-fade-in">
                <Outlet />
            </main>
            <BottomNav />
            <Toaster position="top-center" richColors />
            <WhatsAppFeedback />
        </div>
    )
}
