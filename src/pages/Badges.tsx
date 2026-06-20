import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Zap, Crown, Shield, 
  Sparkles, Medal, Dumbbell, Calendar, Apple, 
  Lock, X, Award, Check, Activity, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/BottomNav';

interface Criterion {
  name: string;
  target: string;
  current: string;
  completed: boolean;
}

interface Badge {
  id: string;
  name: string;
  category: 'camera' | 'streak' | 'habits' | 'diet' | 'onboarding';
  desc: string;
  unlocked: boolean;
  xp: number;
  tier: 'DIAMOND' | 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
  unlockedAt?: string;
  criteria: Criterion[];
}

interface Tier {
  name: 'DIAMOND' | 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
  desc: string;
  colorClass: string;
  glowClass: string;
  borderClass: string;
  textClass: string;
  accentColor: string;
  badges: Badge[];
}

// Premium SVG Medal Renderer (Athletic Trophies Style)
const BadgeVisual = ({ id, tier, unlocked }: { id: string; tier: string; unlocked: boolean }) => {
  const colors = {
    DIAMOND: {
      primary: '#A855F7',
      secondary: '#6366F1',
      glow: 'rgba(168, 85, 247, 0.4)',
      bg: 'rgba(168, 85, 247, 0.1)'
    },
    PLATINUM: {
      primary: '#06B6D4',
      secondary: '#3B82F6',
      glow: 'rgba(6, 182, 212, 0.4)',
      bg: 'rgba(6, 182, 212, 0.1)'
    },
    GOLD: {
      primary: '#FBBF24',
      secondary: '#EA580C',
      glow: 'rgba(251, 191, 36, 0.4)',
      bg: 'rgba(251, 191, 36, 0.1)'
    },
    SILVER: {
      primary: '#94A3B8',
      secondary: '#475569',
      glow: 'rgba(148, 163, 184, 0.3)',
      bg: 'rgba(148, 163, 184, 0.08)'
    },
    BRONZE: {
      primary: '#F97316',
      secondary: '#7C2D12',
      glow: 'rgba(249, 115, 22, 0.3)',
      bg: 'rgba(249, 115, 22, 0.08)'
    }
  }[tier as 'DIAMOND' | 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE'] || {
    primary: '#FFF',
    secondary: '#888',
    glow: 'rgba(255,255,255,0.1)',
    bg: 'rgba(255,255,255,0.05)'
  };

  const gradId = `grad-${tier}-${id}`;
  const filterId = `glow-${tier}-${id}`;

  const renderIconContent = () => {
    switch (id) {
      // DIAMOND
      case 'd1': // Diamond Legend (Crown)
        return (
          <path d="M32 45 L38 56 H62 L68 45 L57 50 L50 36 L43 50 Z M38 56 L38 62 H62 L62 56" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'd2': // Diamond Beast (Zap)
        return (
          <path d="M54 32 L36 51 H48 L44 66 L62 47 H50 Z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
        );
      case 'd3': // Ultimate Athlete (Shield with Wings)
        return (
          <g>
            <path d="M50 32 L66 37 V52 C66 62 50 67 50 67 C50 67 34 62 34 52 V37 Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M44 48 L48 52 L56 44" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      
      // PLATINUM
      case 'p1': // Platinum Warrior (Helmet)
        return (
          <g>
            <path d="M50 30 C40 30 35 38 35 50 L37 60 H45 L47 48 L50 51 L53 48 L55 60 H63 L65 50 C65 38 60 30 50 30 Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M50 30 V22 L56 25 M50 22 L44 25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      case 'p2': // Platinum Elite (Shining Star)
        return (
          <path d="M50 28 L55 41 L69 43 L59 52 L62 65 L50 59 L38 65 L41 52 L31 43 L45 41 Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        );
      case 'p3': // Diet Champion (Laurel Wreath)
        return (
          <g>
            <circle cx="50" cy="50" r="11" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M38 42 A12 12 0 0 0 38 58 M62 42 A12 12 0 0 1 62 58" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      // GOLD
      case 'g1': // Gold Fitness Pro (Dumbbell)
        return (
          <path d="M32 45 V55 M38 41 V59 M38 50 H62 M62 41 V59 M68 45 V55" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'g2': // Endurance Master (Running timer)
        return (
          <g>
            <circle cx="50" cy="48" r="12" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M50 36 V44 M50 44 H56" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M30 48 Q33 40 38 40 M70 48 Q67 40 62 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      case 'g3': // Strength Builder (Trending Up)
        return (
          <g>
            <path d="M34 58 L46 46 L54 52 L66 38" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M56 38 H66 V48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );

      // SILVER
      case 's1': // Silver Target
        return (
          <g>
            <circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="4" fill="currentColor" />
          </g>
        );
      case 's2': // Silver Calendar
        return (
          <g>
            <rect x="35" y="36" width="30" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M35 44 H65 M43 32 V36 M57 32 V36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="45" cy="50" r="1.5" fill="currentColor" />
            <circle cx="55" cy="50" r="1.5" fill="currentColor" />
            <circle cx="50" cy="56" r="1.5" fill="currentColor" />
          </g>
        );
      case 's3': // Silver Sneaker
        return (
          <path d="M33 55 Q40 40 50 40 Q57 40 65 47 V55 Z M44 40 V55 M55 43 V55" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );

      // BRONZE
      case 'b1': // Bronze Play
        return (
          <path d="M42 36 L62 50 L42 64 Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'b2': // Bronze Plus
        return (
          <path d="M50 35 V65 M35 50 H65" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        );
      case 'b3': // Bronze Message
        return (
          <path d="M35 38 H65 V56 H45 L35 64 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );

      default:
        return null;
    }
  };

  const renderWrapper = () => {
    switch (tier) {
      case 'DIAMOND':
        return (
          <polygon 
            points="50,15 80,32 80,68 50,85 20,68 20,32" 
            fill={colors.bg} 
            stroke={`url(#${gradId})`} 
            strokeWidth="3.5" 
            filter={unlocked ? `url(#${filterId})` : undefined} 
            strokeLinejoin="round"
          />
        );
      case 'PLATINUM':
        return (
          <polygon 
            points="50,15 78,24 85,50 70,80 30,80 15,50 22,24" 
            fill={colors.bg} 
            stroke={`url(#${gradId})`} 
            strokeWidth="3.5" 
            filter={unlocked ? `url(#${filterId})` : undefined} 
            strokeLinejoin="round"
          />
        );
      case 'GOLD':
        return (
          <circle 
            cx="50" 
            cy="50" 
            r="35" 
            fill={colors.bg} 
            stroke={`url(#${gradId})`} 
            strokeWidth="3.5" 
            filter={unlocked ? `url(#${filterId})` : undefined}
          />
        );
      case 'SILVER':
        return (
          <circle 
            cx="50" 
            cy="50" 
            r="35" 
            fill={colors.bg} 
            stroke={`url(#${gradId})`} 
            strokeWidth="3" 
            filter={unlocked ? `url(#${filterId})` : undefined}
          />
        );
      case 'BRONZE':
        return (
          <polygon 
            points="50,15 80,30 80,70 50,85 20,70 20,30" 
            fill={colors.bg} 
            stroke={`url(#${gradId})`} 
            strokeWidth="3" 
            filter={unlocked ? `url(#${filterId})` : undefined}
            strokeLinejoin="round"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Clean soft drop shadow behind unlocked medals */}
      {unlocked && (
        <div 
          className="absolute w-[70px] h-[70px] rounded-full filter blur-[15px] opacity-35"
          style={{ backgroundColor: colors.primary }}
        />
      )}

      <svg 
        viewBox="0 0 100 100" 
        className={`w-[82px] h-[82px] transition-all duration-300 z-10 ${unlocked ? 'text-white' : 'text-white/20'}`}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={unlocked ? colors.primary : '#475569'} />
            <stop offset="50%" stopColor={unlocked ? '#FFFFFF' : '#334155'} />
            <stop offset="100%" stopColor={unlocked ? colors.secondary : '#1E293B'} />
          </linearGradient>

          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="0" result="offsetblur" />
            <feFlood floodColor={colors.primary} />
            <feComposite in2="offsetblur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {renderWrapper()}
        
        <g className="translate-y-0.5" style={{ color: unlocked ? colors.primary : '#475569' }}>
          {renderIconContent()}
        </g>
      </svg>
    </div>
  );
};

const INITIAL_TIERS: Tier[] = [
  {
    name: 'DIAMOND',
    desc: 'The ultimate recognition for elite fitness legends.',
    colorClass: 'bg-purple-950/10 border-purple-500/20 text-purple-400',
    glowClass: 'shadow-[0_4px_20px_rgba(168,85,247,0.15)]',
    borderClass: 'border-purple-500/20',
    textClass: 'text-purple-400',
    accentColor: '#A855F7',
    badges: [
      { 
        id: 'd1', 
        name: 'Diamond Legend', 
        category: 'streak',
        desc: 'Maintain a daily workout streak of 60 consecutive days.', 
        unlocked: true, 
        xp: 5000, 
        tier: 'DIAMOND',
        unlockedAt: '2026-05-15', 
        criteria: [
          { name: 'Daily workout streak log', target: '60 days', current: '60 days', completed: true },
          { name: 'Weekly weight verification checks', target: '8 weeks', current: '8 weeks', completed: true }
        ]
      },
      { 
        id: 'd2', 
        name: 'Diamond Beast', 
        category: 'camera',
        desc: 'Record 300 minutes of intensive camera posture tracking.', 
        unlocked: true, 
        xp: 3000, 
        tier: 'DIAMOND',
        unlockedAt: '2026-06-10', 
        criteria: [
          { name: 'Camera pose detection active log', target: '300 min', current: '300 min', completed: true },
          { name: 'Exercise sets tracked under analysis', target: '50 sets', current: '50 sets', completed: true }
        ]
      },
      { 
        id: 'd3', 
        name: 'Ultimate Athlete', 
        category: 'camera',
        desc: 'Complete all default exercises at 95%+ posture score.', 
        unlocked: false, 
        xp: 8000, 
        tier: 'DIAMOND',
        criteria: [
          { name: 'Average posture rating score', target: '>= 95%', current: '91%', completed: false },
          { name: 'Continuous pull-ups without warning', target: '10 reps', current: '7 reps', completed: false }
        ]
      }
    ]
  },
  {
    name: 'PLATINUM',
    desc: 'For those who go above and beyond.',
    colorClass: 'bg-cyan-950/10 border-cyan-500/20 text-cyan-400',
    glowClass: 'shadow-[0_4px_20px_rgba(6,182,212,0.15)]',
    borderClass: 'border-cyan-500/20',
    textClass: 'text-cyan-400',
    accentColor: '#06B6D4',
    badges: [
      { 
        id: 'p1', 
        name: 'Platinum Warrior', 
        category: 'camera',
        desc: 'Perfect 10 pullups in a single session.', 
        unlocked: true, 
        xp: 2500, 
        tier: 'PLATINUM',
        unlockedAt: '2026-04-12', 
        criteria: [
          { name: 'Correct posture pullup count', target: '10 reps', current: '10 reps', completed: true },
          { name: 'Wrist-to-shoulder height alignment', target: '>= 90%', current: '96%', completed: true }
        ]
      },
      { 
        id: 'p2', 
        name: 'Platinum Elite', 
        category: 'camera',
        desc: 'Complete 20 posture-correct yoga checks.', 
        unlocked: true, 
        xp: 2000, 
        tier: 'PLATINUM',
        unlockedAt: '2026-05-02', 
        criteria: [
          { name: 'Stable camera posture checks', target: '20 sessions', current: '20 sessions', completed: true },
          { name: 'Tree pose alignment duration', target: '60s', current: '60s', completed: true }
        ]
      },
      { 
        id: 'p3', 
        name: 'Diet Champion', 
        category: 'diet',
        desc: 'Follow diet plans correctly and achieve macro guidelines.', 
        unlocked: true, 
        xp: 1500, 
        tier: 'PLATINUM',
        unlockedAt: '2026-05-28', 
        criteria: [
          { name: 'Follow AI protein target daily', target: '14 days', current: '14 days', completed: true },
          { name: 'Stay below daily carbohydrate limit', target: '14 days', current: '14 days', completed: true }
        ]
      }
    ]
  },
  {
    name: 'GOLD',
    desc: 'Celebrating your dedication and outstanding progress.',
    colorClass: 'bg-yellow-950/10 border-yellow-500/20 text-yellow-400',
    glowClass: 'shadow-[0_4px_20px_rgba(251,191,36,0.15)]',
    borderClass: 'border-yellow-500/20',
    textClass: 'text-yellow-400',
    accentColor: '#FBBF24',
    badges: [
      { 
        id: 'g1', 
        name: 'Gold Fitness Pro', 
        category: 'camera',
        desc: 'Record a bicep curl set with zero warnings.', 
        unlocked: true, 
        xp: 1000, 
        tier: 'GOLD',
        unlockedAt: '2026-03-30', 
        criteria: [
          { name: 'Posture warnings during curl set', target: '0 warnings', current: '0 warnings', completed: true },
          { name: 'Elbows locked stance check', target: '100%', current: '100%', completed: true }
        ]
      },
      { 
        id: 'g2', 
        name: 'Endurance Master', 
        category: 'streak',
        desc: 'Keep a posture check active for 15 minutes.', 
        unlocked: false, 
        xp: 1000, 
        tier: 'GOLD',
        criteria: [
          { name: 'Posture detection analysis active time', target: '15 min', current: '12 min', completed: false },
          { name: 'Active workout calorie consumption', target: '400 kcal', current: '350 kcal', completed: false }
        ]
      },
      { 
        id: 'g3', 
        name: 'Strength Builder', 
        category: 'camera',
        desc: 'Perform 100 total squats under camera analysis.', 
        unlocked: true, 
        xp: 800, 
        tier: 'GOLD',
        unlockedAt: '2026-04-20', 
        criteria: [
          { name: 'Camera verified squats count', target: '100 squats', current: '100 squats', completed: true },
          { name: 'Hips-to-knees alignment score', target: '>= 90%', current: '94%', completed: true }
        ]
      }
    ]
  },
  {
    name: 'SILVER',
    desc: 'Honoring your consistency and hard work.',
    colorClass: 'bg-slate-900/10 border-slate-500/20 text-slate-300',
    glowClass: 'shadow-[0_4px_20px_rgba(148,163,184,0.1)]',
    borderClass: 'border-slate-500/20',
    textClass: 'text-slate-300',
    accentColor: '#94A3B8',
    badges: [
      { 
        id: 's1', 
        name: 'Silver Achiever', 
        category: 'onboarding',
        desc: 'Register a new profile and set your goal.', 
        unlocked: true, 
        xp: 500, 
        tier: 'SILVER',
        unlockedAt: '2026-03-19', 
        criteria: [
          { name: 'Set primary objective goal', target: 'Done', current: 'Done', completed: true },
          { name: 'Complete profile metadata setup', target: 'Done', current: 'Done', completed: true }
        ]
      },
      { 
        id: 's2', 
        name: 'Silver Consistent', 
        category: 'habits',
        desc: 'Complete 5 days of habit tracking.', 
        unlocked: true, 
        xp: 500, 
        tier: 'SILVER',
        unlockedAt: '2026-03-24', 
        criteria: [
          { name: 'Habit list daily completions', target: '5 days', current: '5 days', completed: true },
          { name: '3L Water daily target checks', target: '5 days', current: '5 days', completed: true }
        ]
      },
      { 
        id: 's3', 
        name: 'Silver Athlete', 
        category: 'diet',
        desc: 'Scan 5 healthy meals using the AI Scanner.', 
        unlocked: true, 
        xp: 400, 
        tier: 'SILVER',
        unlockedAt: '2026-04-05', 
        criteria: [
          { name: 'Meal analysis photo scans count', target: '5 scans', current: '5 scans', completed: true },
          { name: 'AI registered healthy ingredients', target: '3 plates', current: '3 plates', completed: true }
        ]
      }
    ]
  },
  {
    name: 'BRONZE',
    desc: 'Every journey starts here. Take the first step!',
    colorClass: 'bg-orange-950/10 border-orange-500/20 text-orange-400',
    glowClass: 'shadow-[0_4px_20px_rgba(249,115,22,0.1)]',
    borderClass: 'border-orange-500/20',
    textClass: 'text-orange-400',
    accentColor: '#F97316',
    badges: [
      { 
        id: 'b1', 
        name: 'Bronze Starter', 
        category: 'onboarding',
        desc: 'Complete your first onboarding session.', 
        unlocked: true, 
        xp: 200, 
        tier: 'BRONZE',
        unlockedAt: '2026-03-19', 
        criteria: [
          { name: 'Complete welcome tutorial steps', target: 'Done', current: 'Done', completed: true },
          { name: 'Access AI health coach system', target: 'Done', current: 'Done', completed: true }
        ]
      },
      { 
        id: 'b2', 
        name: 'Bronze Performer', 
        category: 'camera',
        desc: 'Count your first 10 reps of squats.', 
        unlocked: true, 
        xp: 200, 
        tier: 'BRONZE',
        unlockedAt: '2026-03-20', 
        criteria: [
          { name: 'Squat camera reps recorded', target: '10 reps', current: '10 reps', completed: true },
          { name: 'Stance validation check passed', target: 'Done', current: 'Done', completed: true }
        ]
      },
      { 
        id: 'b3', 
        name: 'Bronze Challenger', 
        category: 'diet',
        desc: 'Send your first message to the AI health coach.', 
        unlocked: true, 
        xp: 200, 
        tier: 'BRONZE',
        unlockedAt: '2026-03-20', 
        criteria: [
          { name: 'AI diet consultation logs', target: '1 question', current: '1 question', completed: true },
          { name: 'Meal replacement chat queries', target: '1 query', current: '1 query', completed: true }
        ]
      }
    ]
  }
];

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Modules', icon: Award },
  { id: 'camera', label: 'Camera Checks', icon: Shield },
  { id: 'streak', label: 'Daily Streaks', icon: Trophy },
  { id: 'habits', label: 'Habit Tracker', icon: Calendar },
  { id: 'diet', label: 'Nutrition & Diet', icon: Apple }
];

const Badges = () => {
  const navigate = useNavigate();
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Compute stats
  const totalBadgesLimit = INITIAL_TIERS.reduce((acc, tier) => acc + tier.badges.length, 0);
  const totalBadgesCount = INITIAL_TIERS.reduce(
    (acc, tier) => acc + tier.badges.filter(b => b.unlocked).length, 0
  );
  const progressPercentage = Math.round((totalBadgesCount / totalBadgesLimit) * 100);

  const getFilteredBadges = (badges: Badge[]) => {
    if (activeFilter === 'all') return badges;
    return badges.filter(b => b.category === activeFilter);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#00ff55] pb-28 pt-8 px-5 relative overflow-hidden selection:bg-[#00ff55]/30 selection:text-white">
      
      {/* Sleek, Athletic Content Layout */}
      <div className="relative z-10 max-w-xl mx-auto space-y-6">
        
        {/* Clean Modern Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-wide uppercase">
              PERFORMANCE REWARDS
            </h1>
            <p className="text-xs text-white/50 font-medium tracking-tight">Earn XP and unlock badges by staying active</p>
          </div>
        </div>

        {/* Athletic Progress Hub (Circular Fitness Watch Ring Style) */}
        <div className="relative bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-xl">
          {/* Radial Progress Ring */}
          <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r="46" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="6" fill="transparent" />
              <circle 
                cx="56" 
                cy="56" 
                r="46" 
                stroke="#00ff55" 
                strokeWidth="6" 
                fill="transparent"
                strokeDasharray={2 * Math.PI * 46}
                strokeDashoffset={2 * Math.PI * 46 * (1 - progressPercentage / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{ filter: 'drop-shadow(0 0 4px rgba(0, 255, 85, 0.4))' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-white">{progressPercentage}%</span>
              <span className="text-[8px] text-white/40 font-bold uppercase tracking-wider">Completed</span>
            </div>
          </div>

          {/* Simple Clean Metrics Layout */}
          <div className="flex-1 space-y-4 w-full">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 border-l-2 border-[#00ff55]/30 pl-3">
                <p className="text-[10px] text-white/40 uppercase font-black tracking-wider">Total XP Score</p>
                <p className="text-xl font-black text-white flex items-center gap-1">
                  17,400 <span className="text-[10px] text-[#00ff55] font-bold">XP</span>
                </p>
              </div>
              <div className="space-y-1 border-l-2 border-[#00ff55]/30 pl-3">
                <p className="text-[10px] text-white/40 uppercase font-black tracking-wider">Badges Unlocked</p>
                <p className="text-xl font-black text-white flex items-center gap-1.5">
                  {totalBadgesCount}/{totalBadgesLimit}
                </p>
              </div>
            </div>

            {/* Encouraging status panel */}
            <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-3 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#00ff55]/10 text-[#00ff55]">
                <TrendingUp size={16} />
              </div>
              <p className="text-xs text-white/70 leading-snug">
                You are on track! Complete 3 more camera posture sets to unlock the next level.
              </p>
            </div>
          </div>
        </div>

        {/* Rounded Pill Category Chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {CATEGORY_FILTERS.map(f => {
            const Icon = f.icon;
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 border ${
                  isActive 
                    ? 'bg-[#00ff55] border-[#00ff55] text-black shadow-[0_4px_12px_rgba(0,255,85,0.25)]'
                    : 'bg-white/[0.02] border-white/5 text-white/60 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon size={13} />
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tiers List */}
        <div className="space-y-8">
          {INITIAL_TIERS.map((tier) => {
            const filteredBadges = getFilteredBadges(tier.badges);
            if (filteredBadges.length === 0) return null;

            return (
              <div key={tier.name} className="space-y-4">
                {/* Clean Section Title */}
                <div className="flex items-center gap-3 pb-1 border-b border-white/5">
                  <h2 className="text-sm font-black tracking-widest uppercase" style={{ color: tier.accentColor }}>
                    {tier.name} REWARDS
                  </h2>
                  <p className="text-[10px] text-white/30 lowercase font-medium italic">{tier.desc}</p>
                </div>

                {/* Clean Rounded Badges Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {filteredBadges.map((badge) => {
                    const completedCount = badge.criteria.filter(c => c.completed).length;
                    const totalCount = badge.criteria.length;
                    const progressPct = Math.round((completedCount / totalCount) * 100);

                    return (
                      <motion.button
                        key={badge.id}
                        whileHover={badge.unlocked ? { scale: 1.03 } : {}}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedBadge(badge)}
                        className={`rounded-2xl border p-4 flex flex-col items-center justify-between text-center aspect-square relative transition-all duration-300 ${
                          badge.unlocked 
                            ? `bg-white/[0.01] ${tier.borderClass} ${tier.glowClass}`
                            : 'bg-white/[0.01] border-white/5 text-white/10'
                        }`}
                      >
                        {!badge.unlocked && (
                          <div className="absolute top-2 right-2 text-white/20">
                            <Lock size={11} />
                          </div>
                        )}
                        
                        {/* Beautiful Medal Visual Core */}
                        <div className="w-16 h-16 flex items-center justify-center">
                          <BadgeVisual id={badge.id} tier={tier.name} unlocked={badge.unlocked} />
                        </div>

                        {/* Title & Progress Bar */}
                        <div className="w-full mt-3 space-y-2">
                          <span className={`text-[10px] font-black uppercase tracking-wide block truncate ${
                            badge.unlocked ? 'text-white' : 'text-white/20'
                          }`}>
                            {badge.name}
                          </span>

                          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                            <div 
                              className="h-full transition-all duration-700" 
                              style={{ 
                                width: `${progressPct}%`,
                                backgroundColor: badge.unlocked ? tier.accentColor : 'rgba(255,255,255,0.05)',
                                boxShadow: badge.unlocked ? `0 0 4px ${tier.accentColor}` : undefined
                              }} 
                            />
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aesthetic Performance Detail Dialog */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-[370px] bg-[#0c0c0e] p-6 rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 bg-white/5 border border-white/5 p-1.5 rounded-full hover:bg-white/10 text-white/50 transition-colors"
              >
                <X size={14} />
              </button>

              {/* Medal Display */}
              <div className="flex flex-col items-center text-center mt-4">
                <div className="h-28 w-28 relative flex items-center justify-center">
                  <BadgeVisual id={selectedBadge.id} tier={selectedBadge.tier} unlocked={selectedBadge.unlocked} />
                </div>

                <h3 className="text-xl font-black text-white mt-4 uppercase tracking-wide">
                  {selectedBadge.name}
                </h3>
                
                <span className={`text-[9px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider mt-2 border ${
                  selectedBadge.unlocked 
                    ? 'bg-[#00ff55]/10 text-[#00ff55] border-[#00ff55]/20'
                    : 'bg-white/5 text-white/30 border-white/10'
                }`}>
                  {selectedBadge.unlocked ? 'Unlocked Achievement' : 'Goal Locked'}
                </span>
              </div>

              {/* Requirement Description */}
              <p className="text-center text-xs text-white/60 mt-4 leading-relaxed px-2 py-3 border-t border-b border-white/5">
                {selectedBadge.desc}
              </p>

              {/* Clean Checklist Criteria */}
              <div className="mt-5 space-y-2">
                <p className="font-black text-white/40 text-[9px] uppercase tracking-wider pl-1">
                  Required Milestones
                </p>
                
                {selectedBadge.criteria.map((c, i) => (
                  <div 
                    key={i} 
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      c.completed 
                        ? 'bg-white/[0.01] border-white/10 text-white' 
                        : 'bg-transparent border-white/5 text-white/30'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 max-w-[70%]">
                      <div className={`p-0.5 rounded-md mt-0.5 border text-black flex items-center justify-center ${
                        c.completed 
                          ? 'bg-[#00ff55] border-[#00ff55]' 
                          : 'bg-transparent border-white/15 text-white/20'
                      }`}>
                        {c.completed ? <Check size={10} strokeWidth={4} /> : <Lock size={10} />}
                      </div>
                      <div className="text-left leading-tight">
                        <p className="text-[11px] font-bold">{c.name}</p>
                        <p className={`text-[9px] mt-0.5 ${c.completed ? 'text-[#00ff55]/70' : 'text-white/30'}`}>
                          Goal: {c.target}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`text-[10px] font-bold ${
                        c.completed ? 'text-[#00ff55]' : 'text-white/30'
                      }`}>
                        {c.current}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reward and Date Stamp Info */}
              <div className="grid grid-cols-2 gap-2 mt-5">
                <div className="bg-white/[0.01] p-3 rounded-2xl border border-white/5 text-center">
                  <p className="text-[8px] text-white/30 uppercase font-black tracking-wider">Reward</p>
                  <p className="text-xs font-black text-[#00ff55]">+{selectedBadge.xp} XP</p>
                </div>
                <div className="bg-white/[0.01] p-3 rounded-2xl border border-white/5 text-center">
                  <p className="text-[8px] text-white/30 uppercase font-black tracking-wider">Unlocked On</p>
                  <p className="text-[10px] font-bold text-white/70 pt-0.5 truncate">
                    {selectedBadge.unlockedAt ? selectedBadge.unlockedAt : 'Locked'}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default Badges;
