import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import { config } from './lib/wagmi';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AIChatbot } from './components/AIChatbot';
import { AuthProvider } from './context/AuthContext-supabase';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const JobsPage = lazy(() => import('./pages/JobsPage').then(m => ({ default: m.JobsPage })));
const JobDetailPage = lazy(() => import('./pages/JobDetailPage').then(m => ({ default: m.default })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.default })));
const PostJobPage = lazy(() => import('./pages/PostJobPage').then(m => ({ default: m.default })));
const JobApplicationsPage = lazy(() => import('./pages/JobApplicationsPage').then(m => ({ default: m.default })));
const MessagesPage = lazy(() => import('./pages/MessagesPage').then(m => ({ default: m.MessagesPage })));
const ReputationPage = lazy(() => import('./pages/ReputationPage').then(m => ({ default: m.ReputationPage })));
const SignUpPage = lazy(() => import('./pages/SignUpPage').then(m => ({ default: m.default })));
const SignInPage = lazy(() => import('./pages/SignInPage').then(m => ({ default: m.default })));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent mb-4"></div>
      <p className="text-lg text-gray-600">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-background text-foreground">
              <Header />
              <main className="flex-1">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/signin" element={<SignInPage />} />
                    <Route path="/jobs" element={<JobsPage />} />
                    <Route path="/job/:id" element={<JobDetailPage />} />
                    <Route path="/job/:id/applications" element={<JobApplicationsPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/post-job" element={<PostJobPage />} />
                    <Route path="/messages" element={<MessagesPage />} />
                    <Route path="/reputation" element={<ReputationPage />} />
                    <Route path="/reputation/:address" element={<ReputationPage />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
              <AIChatbot />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
