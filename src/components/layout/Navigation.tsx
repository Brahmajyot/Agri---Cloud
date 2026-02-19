import { Link, useLocation } from "react-router-dom"
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react"
import { Home, Search, PlusCircle, User, Compass, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import logo from "@/assets/logo.png"

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-white/70 backdrop-blur-xl transition-all supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <img src={logo} alt="Agri Cloud Logo" className="h-9 w-9 object-contain hover:scale-105 transition-transform" />
                    <span className="text-xl font-bold tracking-tight text-[var(--color-secondary)]">
                        Agri Cloud
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden items-center gap-4 md:flex">
                    <Link to="/browse">
                        <Button variant="ghost" className="gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] font-medium">
                            <Compass size={18} />
                            Agri Notes
                        </Button>
                    </Link>
                    <SignedIn>
                        <Link to="/dashboard">
                            <Button variant="ghost" className="gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] font-medium">
                                <LayoutDashboard size={18} />
                                Dashboard
                            </Button>
                        </Link>
                        <Link to="/upload">
                            <Button size="sm" className="gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white shadow-lg shadow-[var(--color-primary)]/20 font-semibold px-6 rounded-full transition-all hover:scale-105 active:scale-95">
                                <PlusCircle size={18} />
                                Upload Note
                            </Button>
                        </Link>
                    </SignedIn>
                </div>

                {/* Auth / Profile */}
                <div className="flex items-center gap-4">
                    <SignedOut>
                        <div className="hidden md:flex gap-2">
                            <Link to="/sign-in">
                                <Button variant="ghost" size="sm">Sign In</Button>
                            </Link>
                            <Link to="/sign-up">
                                <Button size="sm">Get Started</Button>
                            </Link>
                        </div>
                    </SignedOut>
                    <SignedIn>
                        <UserButton afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    avatarBox: "h-9 w-9 ring-2 ring-[var(--color-primary)]/20 hover:ring-[var(--color-primary)] transition-all"
                                }
                            }}
                        />
                    </SignedIn>
                </div>
            </div>
        </nav>
    )
}

export function BottomNav() {
    const location = useLocation()

    const navItems = [
        { label: "Home", icon: Home, path: "/" },
        { label: "Browse", icon: Search, path: "/browse" },
        { label: "Upload", icon: PlusCircle, path: "/upload" },
        { label: "Profile", icon: User, path: "/profile" },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-white/90 backdrop-blur-lg md:hidden">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200",
                                isActive
                                    ? "text-[var(--color-primary)]"
                                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                            )}
                        >
                            <Icon size={20} className={cn(isActive && "fill-current/20")} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
