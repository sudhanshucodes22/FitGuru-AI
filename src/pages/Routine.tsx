import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BottomNav from '@/components/BottomNav';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const initialTasks = [
  { label: 'Morning Walk', time: '6:30 AM', done: true },
  { label: 'Drink 1L Water', time: '8:00 AM', done: true },
  { label: 'Workout — Upper Body', time: '10:00 AM', done: true },
  { label: 'Log Breakfast', time: '9:00 AM', done: false },
  { label: '15 min Meditation', time: '7:00 PM', done: false },
  { label: 'Sleep by 11 PM', time: '11:00 PM', done: false },
];

const streakData = [85, 100, 70, 90, 60, 0, 0]; // percent per day

const ProgressRing = ({ value, size = 72 }: { value: number; size?: number }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(var(--primary))" strokeWidth="5"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - value / 100)} strokeLinecap="round" />
    </svg>
  );
};

const Routine = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedDay, setSelectedDay] = useState(2); // Wed = today mock
  const [sheetOpen, setSheetOpen] = useState(false);
  const [newHabit, setNewHabit] = useState('');

  const done = tasks.filter((t) => t.done).length;
  const pct = Math.round((done / tasks.length) * 100);

  const toggleTask = (i: number) => {
    setTasks(tasks.map((t, idx) => (idx === i ? { ...t, done: !t.done } : t)));
  };

  const addHabit = () => {
    if (!newHabit.trim()) return;
    setTasks([...tasks, { label: newHabit, time: '—', done: false }]);
    setNewHabit('');
    setSheetOpen(false);
  };

  return (
    <div className="pb-20 min-h-screen">
      <div className="p-5 pt-8">
        <h1 className="font-heading text-3xl text-foreground">Daily Routine</h1>

        {/* Week Strip */}
        <div className="flex gap-2 mt-4 overflow-x-auto hide-scrollbar">
          {weekDays.map((d, i) => (
            <button
              key={d}
              onClick={() => setSelectedDay(i)}
              className={`flex flex-col items-center min-w-[44px] py-2 rounded-xl transition-all ${
                selectedDay === i ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}
            >
              <span className="text-[10px]">{d}</span>
              <span className="text-lg font-heading">{24 + i}</span>
            </button>
          ))}
        </div>

        {/* Completion Ring */}
        <div className="flex items-center gap-5 mt-6">
          <div className="relative">
            <ProgressRing value={pct} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-heading text-lg text-primary">{pct}%</span>
            </div>
          </div>
          <div>
            <p className="font-heading text-lg text-foreground">{pct}% Done Today</p>
            <p className="text-xs text-muted-foreground">{done}/{tasks.length} tasks completed</p>
          </div>
        </div>

        {/* Tasks */}
        <div className="mt-5 space-y-2">
          {tasks.map((t, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => toggleTask(i)}
              className="w-full glass rounded-xl px-4 py-3 flex items-center gap-3 text-left"
            >
              <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                t.done ? 'bg-primary border-primary' : 'border-muted-foreground'
              }`}>
                {t.done && <span className="text-primary-foreground text-xs">✓</span>}
              </div>
              <div className="flex-1">
                <p className={`text-sm ${t.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{t.label}</p>
              </div>
              <span className="text-[10px] text-muted-foreground">{t.time}</span>
            </motion.button>
          ))}
        </div>

        <Button onClick={() => setSheetOpen(true)} variant="outline" className="w-full mt-4 rounded-xl gap-2">
          <Plus size={16} /> Add Custom Habit
        </Button>

        {/* Streak Chart */}
        <div className="mt-6">
          <h2 className="font-heading text-lg text-foreground mb-3">7-Day Streak</h2>
          <div className="flex items-end gap-2 h-24">
            {streakData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-md bg-primary/20 relative" style={{ height: `${Math.max(v, 5)}%` }}>
                  <div className="absolute bottom-0 w-full rounded-t-md bg-primary transition-all" style={{ height: `${v}%` }} />
                </div>
                <span className="text-[9px] text-muted-foreground">{weekDays[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Performance */}
        <div className="glass rounded-2xl p-4 mt-4">
          <p className="text-sm text-foreground">You completed <span className="text-primary font-medium">85%</span> of your routine this week 🎉</p>
        </div>
      </div>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setSheetOpen(false)}
          >
            <motion.div
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[430px] glass rounded-t-3xl p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-heading text-xl text-foreground">Add Custom Habit</h3>
                <button onClick={() => setSheetOpen(false)}><X size={20} className="text-muted-foreground" /></button>
              </div>
              <Input
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                placeholder="e.g., Read 20 pages"
                className="h-12 rounded-xl bg-secondary border-0"
              />
              <Button onClick={addHabit} className="w-full mt-3 rounded-xl">Add Habit</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default Routine;
