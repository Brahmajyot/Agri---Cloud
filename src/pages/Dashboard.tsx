import { useUser } from "@clerk/clerk-react"
import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import api from "@/lib/api"

export default function Dashboard() {
    const { user } = useUser()
    const [stats, setStats] = useState({
        totalUploads: 0,
        totalDownloads: 1234, // Mock data for now
        subjects: 5 // Mock data for now
    })
    const [recentUploads, setRecentUploads] = useState<any[]>([])

    useEffect(() => {
        // Fetch initial data
        const fetchData = async () => {
            try {
                const response = await api.get('/files')
                setRecentUploads(response.data.slice(0, 3)) // Get top 3
                setStats(prev => ({ ...prev, totalUploads: response.data.length }))
            } catch (error) {
                console.error("Failed to fetch dashboard data", error)
            }
        }

        fetchData()

        // Connect to Socket.io
        const socket = io('http://localhost:3000')

        socket.on('connect', () => {
            console.log('Connected to socket server')
        })

        socket.on('files_updated', (data) => {
            console.log('Real-time update received:', data)
            // Re-fetch data on update to ensure consistency
            // Alternatively, we could append/remove locally for better performance
            fetchData()
        })

        return () => {
            socket.disconnect()
        }
    }, [])

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-[var(--color-secondary)]">
                    Good Evening, {user?.firstName || "Student"} 🌱
                </h1>
                <span className="text-sm text-[var(--color-text-muted)]">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard title="Total Uploads" value={stats.totalUploads.toString()} icon="📄" />
                <StatsCard title="Total Downloads" value={stats.totalDownloads.toLocaleString()} icon="⬇️" />
                <StatsCard title="Subjects" value={stats.subjects.toString()} icon="📚" />
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Recent Uploads</h2>
                {recentUploads.length === 0 ? (
                    <div className="glass-panel p-8 text-center text-[var(--color-text-muted)] rounded-2xl">
                        <p>You haven't uploaded any notes yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {recentUploads.map((file) => (
                            <div key={file.id} className="glass-panel p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-secondary)] transition-colors">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-medium text-[var(--color-text-main)] truncate max-w-[200px]">{file.title}</h3>
                                        <p className="text-sm text-[var(--color-text-muted)]">{file.subject}</p>
                                    </div>
                                    <span className="text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1 rounded-full">
                                        {file.semester}
                                    </span>
                                </div>
                                <div className="mt-4 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                                    <span>{new Date(file.created_at).toLocaleDateString()}</span>
                                    <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-secondary)]">View</a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

function StatsCard({ title, value, icon }: { title: string, value: string, icon: string }) {
    return (
        <div className="frosted-card p-6 rounded-2xl shadow-sm hover-lift border border-[var(--color-border)]">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-[var(--color-text-muted)]">{title}</p>
                    <h3 className="text-2xl font-bold text-[var(--color-text-main)] mt-1">{value}</h3>
                </div>
                <span className="text-2xl">{icon}</span>
            </div>
        </div>
    )
}
