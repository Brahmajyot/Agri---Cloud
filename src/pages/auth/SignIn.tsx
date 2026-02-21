import { SignIn } from "@clerk/clerk-react"
import SEO from "@/components/ui/SEO"

export default function SignInPage() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <SEO
                title="Sign In — Agri Cloud"
                description="Sign in to Agri Cloud to access, upload, and download free B.Sc Agriculture notes, PYQ papers, and study materials."
                canonical="/sign-in"
            />
            <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
        </div>
    )
}

