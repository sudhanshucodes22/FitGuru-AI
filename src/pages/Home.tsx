import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, MessageCircle, Accessibility, Dumbbell, Droplets, Footprints, Flame, Star, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import BottomNav from '@/components/BottomNav';

const quickActions = [
  { icon: Camera, label: 'Scan My Meal', path: '/meals' },
  { icon: MessageCircle, label: 'Chat with AI', path: '/chat' },
  { icon: Accessibility, label: 'Yoga Check', path: '/yoga' },
  { icon: Dumbbell, label: "Today's Workout", path: '/workouts' },
];

const iconMap: Record<string, any> = {
  calories: Flame,
  protein: Dumbbell,
  water: Droplets,
  steps: Footprints,
};

const ProgressRing = ({ value, max, size = 50 }: { value: number; max: number; size?: number }) => {
  const pct = Math.min(value / max, 1);
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="4" />
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
      <div className="min-h-screen flex flex-col items-center justify-center pb-20 bg-[#09090b]">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
        <BottomNav />
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="pb-24 min-h-screen bg-[#09090b]">
      <div className="p-5 pt-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">{greeting}</p>
          <h1 className="font-heading text-4xl text-foreground mt-0.5">{user.name} 💪</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-4 inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 shadow-[0_0_15px_rgba(0,255,85,0.1)]"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-heading tracking-widest text-primary uppercase">7 Day Workout Streak</span>
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
              className="glass rounded-2xl p-4 text-left transition-all hover:border-primary/40 group relative overflow-hidden active:scale-95 duration-300"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-4 -mt-4 transition-all group-hover:bg-primary/10" />
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-primary transition-colors group-hover:bg-primary/20 group-hover:border-primary/20">
                <a.icon size={20} className="text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground mt-3 font-heading tracking-wide uppercase">{a.label}</p>
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
          <h2 className="font-heading text-xl text-foreground mb-3 uppercase tracking-wide">Today's Summary</h2>
          <div className="grid grid-cols-2 gap-3">
            {progressData.map((p) => {
              const Icon = iconMap[p.id] || Flame;
              return (
                <div key={p.id} className="glass rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden border border-white/5 hover:border-primary/20 transition-all duration-300">
                  <div className="relative">
                    <ProgressRing value={p.value} max={p.max} size={50} />
                    <Icon size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">{p.label}</span>
                    <span className="text-lg font-heading text-foreground leading-tight block">
                      {p.value >= 1000 ? `${(p.value / 1000).toFixed(1)}k` : p.value}
                      <span className="text-[10px] text-muted-foreground ml-1 font-sans">/ {p.max >= 1000 ? `${(p.max / 1000).toFixed(0)}k` : p.max}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate('/workouts')}
          className="mt-6 rounded-3xl overflow-hidden relative h-48 cursor-pointer group border border-white/5 hover:border-primary/30 transition-all duration-500"
        >
          <img 
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80" 
            alt="Workout" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute top-4 left-4 bg-primary text-black font-heading text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
            Featured Routine
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <div>
              <p className="font-heading text-2xl text-white tracking-wide">CHEST & ARMS BLITZ</p>
              <p className="text-xs text-primary font-medium tracking-wider uppercase">65 Min • Intense • Form Correct Enabled</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-black group-hover:scale-110 transition-transform duration-300">
              <Dumbbell size={18} />
            </div>
          </div>
        </motion.div>

        {/* Nearby Gym Offers */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-heading text-xl text-foreground uppercase tracking-wide">Nearby Gym Partners</h2>
            <button onClick={() => navigate('/gyms')} className="text-xs text-primary font-bold uppercase tracking-wider hover:underline">See all</button>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4">
            {gymOffers.map((g) => (
              <div key={g.id} className="glass rounded-2xl overflow-hidden min-w-[210px] flex-shrink-0 border border-white/5 hover:border-primary/20 transition-all duration-300 hover:scale-[1.01]">
                <div className="h-28 relative">
                  <img src={g.image} alt={g.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <Star size={10} className="text-primary fill-primary" />
                    <span className="text-[10px] font-bold text-white">{g.rating}</span>
                  </div>
                </div>
                <div className="p-3 bg-[#121218]/40">
                  <p className="text-sm font-heading tracking-wide uppercase text-foreground truncate">{g.name}</p>
                  <span className="inline-block mt-2 text-[10px] font-bold bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider">{g.offer}</span>
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
