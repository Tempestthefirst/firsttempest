import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  label?: string;
  to?: string;
}

export const BackButton = ({ label = 'Back', to }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
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
        className="gap-2"
        aria-label={label}
      >
        <ArrowLeft className="w-4 h-4" />
        {label}
      </Button>
    </motion.div>
  );
};
