import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  label?: string;
  to?: string;
  fallback?: string;
}

export const BackButton = ({ label = 'Back', to, fallback = '/dashboard' }: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      // Check if there's history to go back to
      // window.history.length > 2 because initial load counts as 1
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        // Fallback to home if no history
        navigate(fallback);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        variant="ghost"
        onClick={handleClick}
        className="gap-2 -ml-2"
        aria-label={`Go back${label !== 'Back' ? `: ${label}` : ''}`}
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        <span>{label}</span>
      </Button>
    </motion.div>
  );
};