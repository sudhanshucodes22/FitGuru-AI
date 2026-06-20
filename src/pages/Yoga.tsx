import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const poses = ['Warrior I', 'Downward Dog', 'Tree Pose', "Child's Pose", 'Cobra'];

const ProgressRing = ({ value, size = 80 }: { value: number; size?: number }) => {
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

const Yoga = () => {
  const [selectedPose, setSelectedPose] = useState('Warrior I');

  return (
    <div className="pb-20 min-h-screen">
      <div className="p-5 pt-8">
        <h1 className="font-heading text-3xl text-foreground">Yoga Posture Check</h1>
        <p className="text-sm text-muted-foreground">AI-powered pose correction</p>

        {/* Camera Preview */}
        <div className="mt-4 rounded-2xl overflow-hidden h-56 relative">
          <img
            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80"
            alt="Yoga pose"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/20" />
          <div className="absolute top-3 right-3 glass rounded-full px-3 py-1 text-xs text-primary font-medium">
            📹 Live
          </div>
          <div className="absolute bottom-3 left-3 right-3 text-center">
            <p className="text-xs text-foreground glass rounded-full px-3 py-1.5 inline-block">Stand back 6 feet and hold your pose</p>
          </div>
        </div>

        {/* Pose Selector */}
        <div className="flex gap-2 mt-4 overflow-x-auto hide-scrollbar pb-1">
          {poses.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPose(p)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedPose === p ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Feedback */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-5 space-y-4">
          {/* Score */}
          <div className="glass rounded-2xl p-5 flex items-center gap-5">
            <div className="relative">
              <ProgressRing value={78} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-heading text-xl text-primary">78%</span>
              </div>
            </div>
            <div>
              <p className="font-heading text-lg text-foreground">Pose Accuracy</p>
              <p className="text-xs text-muted-foreground mt-0.5">{selectedPose} — Good form, minor adjustments needed</p>
            </div>
          </div>

          {/* Feedback Card */}
          <div className="glass rounded-2xl p-4 flex gap-3">
            <AlertTriangle size={20} className="text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Alignment Feedback</p>
              <p className="text-xs text-muted-foreground mt-1">Your spine alignment is off by 12°. Straighten your back and engage your core for better stability.</p>
            </div>
          </div>

          {/* Tips */}
          <div className="glass rounded-2xl p-4">
            <p className="text-sm font-medium text-foreground mb-2">Quick Tips for {selectedPose}</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>• Keep your front knee directly over your ankle</li>
              <li>• Engage your core and lengthen your spine</li>
              <li>• Press firmly through your back foot</li>
              <li>• Keep your hips square to the front</li>
            </ul>
          </div>
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Yoga;
