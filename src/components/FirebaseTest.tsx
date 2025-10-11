import React, { useEffect, useState } from 'react';
import { firestore } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuthStore } from '../stores/authStore';

const FirebaseTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Testing connection...');
  const { user } = useAuthStore();

  useEffect(() => {
    const testConnection = async () => {
      if (!user) {
        setStatus('❌ Not authenticated');
        return;
      }

      try {
        await getDocs(collection(firestore, 'users'));
        setStatus('✅ Firebase connection successful!');
      } catch (error) {
        console.error('Firebase connection error:', error);
        setStatus(`❌ Firebase connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    testConnection();
  }, [user]);

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Firebase Connection Status</h2>
      <p className={`${status.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
        {status}
      </p>
      {user && (
        <p className="mt-2 text-sm text-gray-600">
          Logged in as: {user.email}
        </p>
      )}
    </div>
  );
};

export default FirebaseTest;