import { useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminDashboard from '../components/AdminDashboard';
import Head from 'next/head';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('adminToken');
    if (!token) {
      // Redirect to login will be handled by the AdminDashboard component
    }
  }, []);

  return (
    <>
      <Head>
        <title>Admin - DevZey Blog</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminDashboard />
    </>
  );
}
