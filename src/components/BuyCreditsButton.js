'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function BuyCreditsButton() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleBuyCredits = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: currentUser.uid,
          email: currentUser.email,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Something went wrong while creating checkout session.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('An error occurred while trying to start payment.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleBuyCredits}
      disabled={loading}
      className="px-4 py-2 mt-4 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? 'Redirecting...' : 'Buy 500 Credits - $4.99'}
    </button>
  );
}
