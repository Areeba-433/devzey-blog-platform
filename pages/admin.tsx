import { useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminDashboard from '../components/AdminDashboard';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('adminToken');
    if (!token) {
      // Redirect to login will be handled by the AdminDashboard component
    }
  }, []);

  return <AdminDashboard />;
}
