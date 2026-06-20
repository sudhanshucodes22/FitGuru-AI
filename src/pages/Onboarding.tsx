import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80', // Dark premium action gym shot
    headline: 'Your AI Trainer.\nAlways On.',
    sub: 'Get personalized workout plans powered by artificial intelligence.',
  },
  {
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', // Premium healthy food on dark background
    headline: 'Know What You Eat.\nInstantly.',
    sub: 'Scan any meal and get instant nutrition analysis with AI.',
  },
  {
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80', // Highly focused posture/yoga stance
    headline: 'Perfect Posture.\nEvery Time.',
    sub: 'Real-time yoga pose correction with computer vision.',
  },
];

const Onboarding = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const next = () => {
    if (current < 2) setCurrent(current + 1);
    else navigate('/signup');
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].image}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full flex-col justify-end p-6 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h1 className="font-heading text-5xl leading-[1.1] text-foreground whitespace-pre-line mb-3">
              {slides[current].headline}
            </h1>
            <p className="text-muted-foreground text-base mb-8 max-w-[300px]">
              {slides[current].sub}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'w-8 bg-primary' : 'w-3 bg-muted'
                }`}
              />
            ))}
          </div>

          {current < 2 ? (
            <Button onClick={next} size="icon" className="h-14 w-14 rounded-full">
              <ChevronRight size={24} />
            </Button>
          ) : (
            <Button onClick={next} className="h-14 px-8 rounded-full text-lg font-heading tracking-wider">
              Get Started Free
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
