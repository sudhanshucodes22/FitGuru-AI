import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, MessageCircle, Accessibility, Dumbbell, Droplets, Footprints, Flame, Star, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import BottomNav from '@/components/BottomNav';

const quickActions = [
  { icon: Camera, label: 'Scan My Meal', path: '/meals', emoji: '📷' },
  { icon: MessageCircle, label: 'Chat with AI', path: '/chat', emoji: '🤖' },
  { icon: Accessibility, label: 'Yoga Check', path: '/yoga', emoji: '🧘' },
  { icon: Dumbbell, label: "Today's Workout", path: '/workouts', emoji: '🏋️' },
];
const iconMap: Record<string, any> = {
  calories: Flame,
  protein: Dumbbell,
  water: Droplets,
  steps: Footprints,
};

const colorMap: Record<string, string> = {
  calories: 'text-orange-400',
  protein: 'text-blue-400',
  water: 'text-cyan-400',
  steps: 'text-emerald-400'
};

const ProgressRing = ({ value, max, size = 56 }: { value: number; max: number; size?: number }) => {
  const pct = Math.min(value / max, 1);
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--primary))" strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round" className="transition-all duration-700" />
    </svg>
  );
};

const Home = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState<any[]>([]);
  const [gymOffers, setGymOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [progressRes, gymsRes] = await Promise.all([
          api.home.getProgress(),
          api.home.getGymOffers()
        ]);
        setProgressData(progressRes);
        setGymOffers(gymsRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pb-20">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
        <BottomNav />
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="pb-20">
      <div className="p-5 pt-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-muted-foreground text-sm">{greeting}</p>
          <h1 className="font-heading text-3xl text-foreground">{user.name} 💪</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-4 inline-flex items-center gap-2 glass rounded-full px-4 py-2"
        >
          <span className="text-lg">🔥</span>
          <span className="text-sm font-medium text-foreground">7 Day Streak</span>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {quickActions.map((a, i) => (
            <motion.button
              key={a.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              onClick={() => navigate(a.path)}
              className="glass rounded-2xl p-4 text-left transition-transform active:scale-95"
            >
              <span className="text-2xl">{a.emoji}</span>
              <p className="text-sm font-medium text-foreground mt-2">{a.label}</p>
            </motion.button>
          ))}
        </div>

        {/* Today's Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <h2 className="font-heading text-xl text-foreground mb-3">Today's Summary</h2>
          <div className="grid grid-cols-4 gap-2">
            {progressData.map((p) => {
              const Icon = iconMap[p.id] || Flame;
              const color = colorMap[p.id] || 'text-white';
              return (
                <div key={p.id} className="flex flex-col items-center">
                  <div className="relative">
                    <ProgressRing value={p.value} max={p.max} />
                    <Icon size={18} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${color}`} />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1">{p.label}</span>
                  <span className="text-xs font-medium text-foreground">{p.value >= 1000 ? `${(p.value / 1000).toFixed(1)}k` : p.value}</span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 rounded-2xl overflow-hidden relative h-44"
        >
          <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80" alt="Workout" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <p className="font-heading text-xl text-foreground">Push Your Limits</p>
            <p className="text-xs text-muted-foreground">Today's featured workout</p>
          </div>
        </motion.div>

        {/* Nearby Gym Offers */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-heading text-xl text-foreground">Nearby Gym Offers</h2>
            <button onClick={() => navigate('/gyms')} className="text-xs text-primary">See all</button>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {gymOffers.map((g) => (
              <div key={g.id} className="glass rounded-2xl overflow-hidden min-w-[200px] flex-shrink-0">
                <img src={g.image} alt={g.name} className="w-full h-24 object-cover" />
                <div className="p-3">
                  <p className="text-sm font-medium text-foreground">{g.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={12} className="text-primary fill-primary" />
                    <span className="text-xs text-muted-foreground">{g.rating}</span>
                  </div>
                  <span className="inline-block mt-2 text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">{g.offer}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Home;
