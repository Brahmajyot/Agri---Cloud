import { SignedIn, SignedOut, RedirectToSignIn, ClerkProvider } from "@clerk/clerk-react"
import { Route, Routes, useNavigate } from "react-router-dom"
import { lazy, Suspense } from "react"
import RootLayout from "@/components/layout/RootLayout"

// Lazy-load pages — each page only downloads when the user visits that route
const Home = lazy(() => import("@/pages/Home"))
const Dashboard = lazy(() => import("@/pages/Dashboard"))
const Upload = lazy(() => import("@/pages/Upload"))
const Browse = lazy(() => import("@/pages/Browse"))
const SignInPage = lazy(() => import("@/pages/auth/SignIn"))
const SignUpPage = lazy(() => import("@/pages/auth/SignUp"))
const Profile = lazy(() => import("@/pages/Profile"))

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  // We'll proceed without key for now to render UI, but auth will fail if interactive
  console.warn("Missing Publishable Key")
}

function ClerkProviderWithRoutes() {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      routerPush={(to: string) => navigate(to)}
      routerReplace={(to: string) => navigate(to, { replace: true })}
    >
      <Suspense fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      }>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/sign-in/*" element={<SignInPage />} />
            <Route path="/sign-up/*" element={<SignUpPage />} />

            <Route
              path="/dashboard"
              element={
                <>
                  <SignedIn>
                    <Dashboard />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />
            <Route
              path="/upload"
              element={
                <>
                  <SignedIn>
                    <Upload />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />
            <Route path="/profile" element={
              <>
                <SignedIn>
                  <Profile />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            } />
          </Route>
        </Routes>
      </Suspense>
    </ClerkProvider>
  );
}

function App() {
  return (
    <ClerkProviderWithRoutes />
  )
}

export default App
