import { useUser } from "@clerk/clerk-react"
import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import api from "@/lib/api"
import { motion } from "framer-motion"

export default function Profile() {
    const { user } = useUser()
    const [uploadCount, setUploadCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const fetchStats = async () => {
            try {
                // Fetch files for the current user to count them
                const response = await api.get(`/files?userId=${user.id}`)
                setUploadCount(response.data.length)
            } catch (error) {
                console.error("Failed to fetch profile stats", error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()

        // Real-time updates
        const socket = io('http://localhost:3000')

        socket.on('connect', () => {
            console.log('Profile: Connected to socket server')
        })

        socket.on('files_updated', () => {
            // Check if the update is relevant to the current user (optional optimization, 
            // but simpler to just re-fetch or increment if we trust the event)
            // For accuracy, we'll re-fetch or if we had more granular events we could increment/decrement
            fetchStats()
        })

        return () => {
            socket.disconnect()
        }
    }, [user])

    if (!user) return null

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 rounded-2xl border border-[var(--color-border)] relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 -z-10" />

                <div className="flex flex-col md:flex-row items-center gap-6 mt-12">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full p-1 bg-white/10 backdrop-blur-md border border-[var(--color-border)] shadow-xl">
                            <img
                                src={user.imageUrl}
                                alt={user.fullName || "User"}
                                className="w-full h-full rounded-full object-cover"
                            />
                        </div>
                        <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-[var(--color-background)]" title="Online" />
                    </div>

                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-3xl font-bold text-[var(--color-text-main)]">
                            {user.fullName}
                        </h1>
                        <p className="text-[var(--color-text-muted)] flex items-center justify-center md:justify-start gap-2">
                            <span>📧</span> {user.primaryEmailAddress?.emailAddress}
                        </p>
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                Student
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]">
                                Premium Member
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <StatCard
                        label="Total Uploads"
                        value={loading ? "..." : uploadCount}
                        icon="📤"
                    />
                    <StatCard
                        label="Reputation"
                        value="Top 10%"
                        icon="🌟"
                    />
                    <StatCard
                        label="Joined"
                        value={new Date(user.createdAt || Date.now()).toLocaleDateString()}
                        icon="📅"
                    />
                </div>
            </motion.div>

            <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border)]">
                <h2 className="text-xl font-semibold mb-4 text-[var(--color-text-main)]">About</h2>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                    Passionate about sharing knowledge and helping others succeed.
                    Contributing high-quality notes and resources to the AgriNotes community.
                </p>
            </div>
        </div>
    )
}

function StatCard({ label, value, icon }: { label: string, value: string | number, icon: string }) {
    return (
        <div className="bg-[var(--color-background)]/50 p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-secondary)] transition-colors text-center md:text-left">
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-2xl font-bold text-[var(--color-text-main)]">{value}</div>
            <div className="text-sm text-[var(--color-text-muted)]">{label}</div>
        </div>
    )
}
