/**
 * Dashboard Page
 * Role-based dashboard (Freelancer vs Client)
 */

import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import FreelancerDashboard from '../components/FreelancerDashboard';
import ClientDashboard from '../components/ClientDashboard';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  if (!user || !userProfile) {
    return <Navigate to="/signin" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {userProfile.role === 'freelancer' ? (
        <FreelancerDashboard />
      ) : (
        <ClientDashboard />
      )}
    </div>
  );
}
