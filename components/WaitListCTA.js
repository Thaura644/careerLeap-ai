// components/WaitlistCTA.js
import { useRouter } from 'next/router';

const WaitlistCTA = () => {
  const router = useRouter();

  const handleJoinClick = () => {
    // Programmatic navigation with proper cleanup
    router.push('/waitlist')
      .then(() => window.scrollTo(0, 0))
      .catch((error) => console.error('Navigation error:', error));
  };

  return (
    <button
      onClick={handleJoinClick}
      className="fixed bottom-4 right-4 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg shadow-lg transition-colors"
    >
      Join Waitlist
    </button>
  );
};

export default WaitlistCTA;