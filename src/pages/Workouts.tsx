import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Play, Timer, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/BottomNav';
import PoseChecker from '@/components/PoseChecker';

const exercises = [
  {
    name: 'Bench Press',
    sets: 4,
    reps: 12,
    emoji: '🏋️',
    muscle: 'Chest · Triceps · Shoulders',
    difficulty: 'Intermediate',
    demoUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    tips: 'Keep feet flat, arch your back slightly, full range of motion.',
  },
  {
    name: 'Shoulder Press',
    sets: 3,
    reps: 10,
    emoji: '💪',
    muscle: 'Shoulders · Triceps',
    difficulty: 'Intermediate',
    demoUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
    tips: 'Core braced, press directly overhead, controlled descent.',
  },
  {
    name: 'Tricep Dips',
    sets: 3,
    reps: 15,
    emoji: '🔥',
    muscle: 'Triceps · Chest',
    difficulty: 'Beginner',
    demoUrl: 'https://images.unsplash.com/photo-1530822847156-5df684ec5933?w=800&q=80',
    tips: 'Lean slightly forward, go until elbows reach 90°.',
  },
  {
    name: 'Pull-Ups',
    sets: 3,
    reps: 8,
    emoji: '🦾',
    muscle: 'Back · Biceps',
    difficulty: 'Advanced',
    demoUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&q=80',
    tips: 'Full hang at bottom, chin clears bar at top, no kipping.',
  },
  {
    name: 'Incline DB Press',
    sets: 3,
    reps: 12,
    emoji: '📈',
    muscle: 'Upper Chest · Shoulders',
    difficulty: 'Intermediate',
    demoUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    tips: 'Set bench to 30-45 degrees, focus on upper chest contraction.',
  },
  {
    name: 'Cable Flyes',
    sets: 3,
    reps: 15,
    emoji: '🦋',
    muscle: 'Chest',
    difficulty: 'Beginner',
    demoUrl: 'https://images.unsplash.com/photo-1541534741688-6078c64b52d3?w=800&q=80',
    tips: 'Squeeze at the center, slight bend in elbows, controlled stretch.',
  },
  {
    name: 'Bicep Curls',
    sets: 4,
    reps: 12,
    emoji: '💪',
    muscle: 'Biceps',
    difficulty: 'Beginner',
    demoUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
    tips: 'No swinging, full extension, rotate wrists at the top.',
  },
  {
    name: 'Lateral Raises',
    sets: 4,
    reps: 15,
    emoji: '🦅',
    muscle: 'Side Delts',
    difficulty: 'Intermediate',
    demoUrl: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=800&q=80',
    tips: 'Lead with elbows, pinkies slightly up, dont go above shoulder height.',
  },
  {
    name: 'Plate Hammer Curls',
    sets: 3,
    reps: 12,
    emoji: '🔨',
    muscle: 'Biceps · Forearms',
    difficulty: 'Beginner',
    demoUrl: 'https://images.unsplash.com/photo-1590239098509-e010d88db01c?w=800&q=80',
    tips: 'Hold the plate sides, neutral grip, controlled hammer motion.',
  },
  {
    name: 'Squats',
    sets: 3,
    reps: 15,
    emoji: '🦵',
    muscle: 'Quadriceps · Hamstrings · Glutes',
    difficulty: 'Beginner',
    demoUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80',
    tips: 'Keep chest up, knees behind toes, push hips back, drop thighs parallel to floor.',
  },
  {
    name: 'Pushups',
    sets: 3,
    reps: 20,
    emoji: '🤸',
    muscle: 'Chest · Triceps · Shoulders · Core',
    difficulty: 'Beginner',
    demoUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    tips: 'Keep body in a straight line, elbow angle should reach 90 degrees at bottom, push up fully.',
  },
];

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: 'text-green-400',
  Intermediate: 'text-yellow-400',
  Advanced: 'text-red-400',
};

const Workouts = () => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [timerOpen, setTimerOpen] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [running, setRunning] = useState(false);
  const [poseExercise, setPoseExercise] = useState<string | null>(null);

  const startTimer = () => {
    setTimerOpen(true);
    setSeconds(60);
    setRunning(true);
    const iv = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) { clearInterval(iv); setRunning(false); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  return (
    <div className="pb-20 min-h-screen bg-[#09090b] relative overflow-hidden">
      {/* Ambient background spotlights */}
      <div className="absolute top-[20%] left-0 w-72 h-72 bg-[radial-gradient(circle,rgba(0,255,85,0.03),transparent_70%)] pointer-events-none z-0" />
      <div className="absolute top-[60%] right-0 w-72 h-72 bg-[radial-gradient(circle,rgba(0,255,85,0.03),transparent_70%)] pointer-events-none z-0" />

      {/* Header Image */}
      <div className="relative h-60 z-10 border-b border-white/5">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"
          alt="Gym"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent" />
        <div className="absolute bottom-6 left-5">
          <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mb-1.5">ELITE COACHING CORE</p>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Day 4 · Upper Body</p>
          <h1 className="font-heading text-5xl text-white mt-1 tracking-wide">CHEST & ARMS</h1>
        </div>
        {/* Workout stats */}
        <div className="absolute top-6 right-4 glass rounded-2xl px-4 py-2.5 text-center border border-white/15 shadow-xl">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Today</p>
          <p className="font-heading text-2xl text-primary mt-0.5">{exercises.length} Exercises</p>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="flex justify-around mx-5 my-4 glass rounded-2xl p-4 border border-white/5">
        {[
          { label: 'Sets', value: exercises.reduce((s, e) => s + e.sets, 0) },
          { label: 'Est. Time', value: '65 min' },
          { label: 'Calories', value: '~550' },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="font-heading text-2xl text-primary">{value}</p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="px-5 space-y-3">
        {exercises.map((ex, i) => (
          <motion.div
            key={ex.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-3xl overflow-hidden border border-white/5 hover:border-primary/25 hover:shadow-[0_0_20px_rgba(0,255,85,0.03)] transition-all duration-300 relative z-10"
          >
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full flex items-center justify-between p-5"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl">
                  {ex.emoji}
                </div>
                <div className="text-left">
                  <p className="text-white font-heading text-xl">{ex.name}</p>
                  <p className="text-[11px] text-white/40">{ex.sets} sets × {ex.reps} reps</p>
                  <p className={`text-[10px] font-bold mt-0.5 ${DIFFICULTY_COLOR[ex.difficulty]}`}>
                    {ex.difficulty} · {ex.muscle}
                  </p>
                </div>
              </div>
              <ChevronDown
                size={18}
                className={`text-white/30 transition-transform ${expanded === i ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {expanded === i && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-3">
                    {/* Demo image */}
                    <div className="relative h-44 rounded-2xl overflow-hidden group/demo border border-white/5">
                      <img src={ex.demoUrl} alt={ex.name} className="w-full h-full object-cover group-hover/demo:scale-105 transition-all duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-black/30 to-transparent flex items-center justify-center">
                        <div className="bg-primary text-black rounded-full p-3.5 shadow-[0_0_20px_rgba(0,255,85,0.4)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer">
                          <Play size={22} fill="currentColor" className="ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Tip */}
                    <div className="flex gap-3 bg-primary/5 rounded-2xl p-3 border border-primary/10">
                      <span className="text-lg shrink-0">💡</span>
                      <p className="text-xs text-white/70">{ex.tips}</p>
                    </div>

                    {/* Set tracker */}
                    <div className="flex gap-2">
                      {Array.from({ length: ex.sets }).map((_, s) => (
                        <div key={s} className="flex-1 text-center py-2.5 rounded-xl bg-white/5 border border-white/5">
                          <p className="text-[9px] text-white/30 uppercase">Set {s + 1}</p>
                          <p className="text-sm font-bold text-white">{ex.reps}</p>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={startTimer}
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-xl gap-2 border-white/10 text-white hover:bg-white/5"
                      >
                        <Timer size={14} /> Rest Timer
                      </Button>
                      <Button
                        onClick={() => setPoseExercise(ex.name)}
                        size="sm"
                        className="flex-1 rounded-xl gap-2 bg-primary text-black hover:bg-primary/90 font-bold"
                      >
                        <Camera size={14} /> Check My Form
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        <Button className="w-full h-14 rounded-2xl text-lg font-heading tracking-widest mt-4 bg-primary text-black hover:bg-primary/90">
          START WORKOUT
        </Button>
      </div>

      {/* Rest Timer Modal */}
      <AnimatePresence>
        {timerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
            onClick={() => setTimerOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-[40px] p-10 text-center w-72 border border-white/10 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -z-10" />
              <p className="font-heading text-xl text-foreground mb-4 uppercase tracking-widest">Rest Phase</p>
              <div className="relative w-32 h-32 mx-auto flex items-center justify-center mb-4">
                <svg className="absolute w-full h-full -rotate-90">
                  <circle cx="64" cy="64" r="58" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                  <circle cx="64" cy="64" r="58" fill="none" stroke="#00ff55" strokeWidth="6"
                    strokeDasharray={364} strokeDashoffset={364 * (1 - seconds / 60)} strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <p className="font-heading text-5xl text-primary">{seconds}s</p>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                {running ? 'Recovering...' : 'Ready to work!'}
              </p>
              <Button
                onClick={() => setTimerOpen(false)}
                className="mt-6 rounded-2xl w-full bg-primary text-black font-heading tracking-widest hover:bg-primary/95 text-md h-12"
              >
                SKIP REST
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pose Checker */}
      <AnimatePresence>
        {poseExercise && (
          <PoseChecker exerciseName={poseExercise} onClose={() => setPoseExercise(null)} />
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default Workouts;
