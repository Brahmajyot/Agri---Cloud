import { SignedIn, SignedOut, RedirectToSignIn, ClerkProvider } from "@clerk/clerk-react"
import { Route, Routes, useNavigate } from "react-router-dom"
import RootLayout from "@/components/layout/RootLayout"

import Home from "@/pages/Home"
import Dashboard from "@/pages/Dashboard"
import Upload from "@/pages/Upload"
import Browse from "@/pages/Browse"
import SignInPage from "@/pages/auth/SignIn"
import SignUpPage from "@/pages/auth/SignUp"
import Profile from "@/pages/Profile"

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
    </ClerkProvider>
  );
}

function App() {
  return (
    <ClerkProviderWithRoutes />
  )
}

export default App
