import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Trophy, Zap, Crown, Shield, 
  Sparkles, Medal, Dumbbell, Calendar, Apple, 
  Lock, X, Award, Check, Cpu, Compass, Database,
  Activity, RefreshCw
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

// Custom Premium SVG Badge Renderer (Hollywood Sci-Fi HUD Cockpit style)
const BadgeVisual = ({ id, tier, unlocked, isHovered }: { id: string; tier: string; unlocked: boolean; isHovered?: boolean }) => {
  const colors = {
    DIAMOND: {
      primary: '#00FF55',
      secondary: '#00AA33',
      glow: 'rgba(0, 255, 85, 0.65)',
      bg: 'rgba(0, 50, 20, 0.25)',
      radar: 'rgba(0, 255, 85, 0.15)'
    },
    PLATINUM: {
      primary: '#34D399',
      secondary: '#059669',
      glow: 'rgba(52, 211, 153, 0.65)',
      bg: 'rgba(6, 70, 45, 0.25)',
      radar: 'rgba(52, 211, 153, 0.15)'
    },
    GOLD: {
      primary: '#A3E635',
      secondary: '#65A30D',
      glow: 'rgba(163, 230, 53, 0.65)',
      bg: 'rgba(30, 60, 10, 0.25)',
      radar: 'rgba(163, 230, 53, 0.15)'
    },
    SILVER: {
      primary: '#86EFAC',
      secondary: '#16A34A',
      glow: 'rgba(134, 239, 172, 0.55)',
      bg: 'rgba(10, 45, 20, 0.25)',
      radar: 'rgba(134, 239, 172, 0.1)'
    },
    BRONZE: {
      primary: '#15803D',
      secondary: '#166534',
      glow: 'rgba(21, 128, 61, 0.55)',
      bg: 'rgba(5, 30, 10, 0.25)',
      radar: 'rgba(21, 128, 61, 0.1)'
    }
  }[tier as 'DIAMOND' | 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE'] || {
    primary: '#FFF',
    secondary: '#888',
    glow: 'rgba(255,255,255,0.2)',
    bg: 'rgba(0,0,0,0.2)',
    radar: 'rgba(255,255,255,0.05)'
  };

  const filterId = `glow-${tier}-${id}`;
  const gradId = `grad-${tier}-${id}`;
  const innerGradId = `inner-${tier}-${id}`;

  const renderIconContent = () => {
    switch (id) {
      // DIAMOND
      case 'd1': // Diamond Legend (Crown)
        return (
          <path d="M32 45 L38 56 H62 L68 45 L57 50 L50 36 L43 50 Z M38 56 L38 62 H62 L62 56" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'd2': // Diamond Beast (Zap)
        return (
          <path d="M54 32 L36 51 H48 L44 66 L62 47 H50 Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
      case 'g2': // Endurance Master (Running winged timer)
        return (
          <g>
            <circle cx="50" cy="48" r="12" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M50 36 V44 M50 44 H56" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M30 48 Q33 40 38 40 M70 48 Q67 40 62 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      case 'g3': // Strength Builder (Barbell / Trending Up)
        return (
          <g>
            <path d="M34 58 L46 46 L54 52 L66 38" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M56 38 H66 V48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );

      // SILVER
      case 's1': // Silver Achiever (Concentric Target)
        return (
          <g>
            <circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="4" fill="currentColor" />
          </g>
        );
      case 's2': // Silver Consistent (Calendar)
        return (
          <g>
            <rect x="35" y="36" width="30" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M35 44 H65 M43 32 V36 M57 32 V36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="45" cy="50" r="1.5" fill="currentColor" />
            <circle cx="55" cy="50" r="1.5" fill="currentColor" />
            <circle cx="50" cy="56" r="1.5" fill="currentColor" />
          </g>
        );
      case 's3': // Silver Athlete (Running Sneaker)
        return (
          <path d="M33 55 Q40 40 50 40 Q57 40 65 47 V55 Z M44 40 V55 M55 43 V55" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );

      // BRONZE
      case 'b1': // Bronze Starter (Play)
        return (
          <path d="M42 36 L62 50 L42 64 Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'b2': // Bronze Performer (Plus)
        return (
          <path d="M50 35 V65 M35 50 H65" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        );
      case 'b3': // Bronze Challenger (Message)
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
            strokeWidth="3" 
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
            strokeWidth="3" 
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
            strokeWidth="3" 
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
            strokeWidth="2.5" 
            filter={unlocked ? `url(#${filterId})` : undefined}
          />
        );
      case 'BRONZE':
        return (
          <polygon 
            points="50,15 80,30 80,70 50,85 20,70 20,30" 
            fill={colors.bg} 
            stroke={`url(#${gradId})`} 
            strokeWidth="2.5" 
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
      {/* Outer Rotating HUD Rings (JARVIS style) */}
      {unlocked && (
        <>
          {/* Degree Tick Ring (slow clockwise spin) */}
          <div 
            className="absolute inset-0 rounded-full border border-dashed pointer-events-none opacity-40 transition-transform duration-1000"
            style={{
              borderColor: colors.primary,
              animation: isHovered ? 'hud-spin-clockwise 6s linear infinite' : 'hud-spin-clockwise 20s linear infinite',
              padding: '2px'
            }}
          />
          {/* Inner Segment Ring (slow counter spin) */}
          <div 
            className="absolute inset-2 rounded-full border border-double pointer-events-none opacity-20 transition-transform duration-1000"
            style={{
              borderColor: colors.secondary,
              borderWidth: '2px',
              borderStyle: 'dashed',
              animation: isHovered ? 'hud-spin-counter 4s linear infinite' : 'hud-spin-counter 15s linear infinite'
            }}
          />
        </>
      )}

      {/* Target Crosshairs in corners (active HUD details) */}
      {unlocked && isHovered && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: colors.primary }} />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2" style={{ borderColor: colors.primary }} />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2" style={{ borderColor: colors.primary }} />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2" style={{ borderColor: colors.primary }} />
        </div>
      )}

      <svg 
        viewBox="0 0 100 100" 
        className={`w-4/5 h-4/5 transition-all duration-500 z-10 ${unlocked ? 'text-white' : 'text-white/20'}`}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={unlocked ? colors.primary : '#475569'} />
            <stop offset="50%" stopColor={unlocked ? '#FFFFFF' : '#334155'} />
            <stop offset="100%" stopColor={unlocked ? colors.secondary : '#1E293B'} />
          </linearGradient>

          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
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
    colorClass: 'bg-indigo-950/10 border-indigo-500/20 text-indigo-400',
    glowClass: 'shadow-[0_0_25px_rgba(168,85,247,0.2)]',
    borderClass: 'border-indigo-500/30',
    textClass: 'text-indigo-400',
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
    glowClass: 'shadow-[0_0_25px_rgba(6,182,212,0.2)]',
    borderClass: 'border-cyan-500/30',
    textClass: 'text-cyan-400',
    accentColor: '#00FF55',
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
    glowClass: 'shadow-[0_0_25px_rgba(251,191,36,0.2)]',
    borderClass: 'border-yellow-500/30',
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
    glowClass: 'shadow-[0_0_25px_rgba(148,163,184,0.15)]',
    borderClass: 'border-slate-500/30',
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
    glowClass: 'shadow-[0_0_25px_rgba(249,115,22,0.15)]',
    borderClass: 'border-orange-500/30',
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
  { id: 'all', label: 'ALL_MODULES', icon: Award },
  { id: 'camera', label: 'CAM_DIAGNOSTICS', icon: Shield },
  { id: 'streak', label: 'DAILY_STREAKS', icon: Trophy },
  { id: 'habits', label: 'HABIT_CALIBRATOR', icon: Calendar },
  { id: 'diet', label: 'NUTRITION_DIAGS', icon: Apple }
];

const Badges = () => {
  const navigate = useNavigate();
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [hoveredBadgeId, setHoveredBadgeId] = useState<string | null>(null);

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
    <div className="min-h-screen bg-[#030712] text-[#00FF55] pb-28 pt-8 px-5 relative overflow-hidden font-mono selection:bg-[#00FF55]/30 selection:text-white">
      {/* Cinematic Styles Injection */}
      <style>{`
        @keyframes grid-scroll {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        @keyframes laser-sweep {
          0% { top: -10%; opacity: 0; }
          5% { opacity: 0.8; }
          50% { opacity: 0.8; }
          95% { opacity: 0.8; }
          100% { top: 110%; opacity: 0; }
        }
        @keyframes hud-spin-clockwise {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes hud-spin-counter {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @keyframes scanner-pulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.4; }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .hud-grid {
          background-image: 
            linear-gradient(rgba(6, 182, 212, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: grid-scroll 24s linear infinite;
        }
        .cyber-clip {
          clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
        }
        .cyber-clip-sm {
          clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Holographic Radar Backdrop Layer */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Animated Blueprint Grid */}
        <div className="absolute inset-0 hud-grid opacity-60" />
        
        {/* Radial sonar rings */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full border border-[#00FF55]/5 pointer-events-none flex items-center justify-center animate-pulse" />
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full border border-[#00FF55]/10 pointer-events-none" />
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[200px] h-[200px] rounded-full border border-[#00FF55]/5 pointer-events-none" />

        {/* Ambient Glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-[#A855F7]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-10%] w-[350px] h-[350px] bg-[#00FF55]/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-xl mx-auto space-y-6">
        
        {/* Cinematic Header Console */}
        <div className="flex items-center justify-between border-b border-[#00FF55]/20 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#00FF55] animate-ping" />
              <p className="text-[9px] text-[#00FF55]/60 tracking-[0.2em] uppercase font-bold">SYSTEM // REWARDS_V4.2</p>
            </div>
            <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-1">
              ACHIEVEMENTS<span className="text-[#00FF55]">_</span>
            </h1>
          </div>
          <div className="text-right font-mono text-[9px] text-[#00FF55]/50 leading-relaxed">
            <p>HOST: ANTIGRAVITY_HUD</p>
            <p>SECTOR: SEC_STARK_09</p>
          </div>
        </div>

        {/* Telemetry Stats Dial Dashboard */}
        <div className="relative border border-[#00FF55]/20 bg-[#00FF55]/5 rounded-3xl p-6 overflow-hidden flex flex-col md:flex-row items-center gap-6">
          {/* Card Border brackets */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00FF55]/40" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00FF55]/40" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00FF55]/40" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00FF55]/40" />
          
          {/* Scanning laser sweep back */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00FF55]/5 to-transparent h-1/2 w-full pointer-events-none opacity-40" style={{ animation: 'laser-sweep 6s linear infinite' }} />

          {/* Radial Progress Ring Scanner */}
          <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              {/* Back track */}
              <circle cx="56" cy="56" r="46" stroke="rgba(6, 182, 212, 0.1)" strokeWidth="4" fill="transparent" />
              {/* Outer ticked telemetry ring */}
              <circle cx="56" cy="56" r="50" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="1" strokeDasharray="3 4" fill="transparent" />
              {/* Active track */}
              <circle 
                cx="56" 
                cy="56" 
                r="46" 
                stroke="#00FF55" 
                strokeWidth="4" 
                fill="transparent"
                strokeDasharray={2 * Math.PI * 46}
                strokeDashoffset={2 * Math.PI * 46 * (1 - progressPercentage / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{ filter: 'drop-shadow(0 0 6px #00FF55)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-white">{progressPercentage}%</span>
              <span className="text-[7px] text-[#00FF55]/60 tracking-wider">CALIBRATED</span>
            </div>
          </div>

          {/* Monospace telemetry logs */}
          <div className="flex-1 space-y-4 w-full">
            <div className="grid grid-cols-2 gap-3 text-[10px]">
              <div className="space-y-1">
                <p className="text-[#00FF55]/55 font-semibold">// OVERALL_XP</p>
                <p className="text-lg font-black text-white flex items-center gap-1.5">
                  <Activity size={12} className="text-[#00FF55] animate-pulse" />
                  17,400 <span className="text-[9px] text-[#00FF55]/65">XP</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[#00FF55]/55 font-semibold">// NODE_DEVICES</p>
                <p className="text-lg font-black text-white flex items-center gap-1.5">
                  <Cpu size={12} className="text-[#00FF55]" />
                  {totalBadgesCount}/{totalBadgesLimit} <span className="text-[9px] text-[#00FF55]/65">SEC</span>
                </p>
              </div>
            </div>

            {/* Simulated Live Console Log lines */}
            <div className="bg-[#030712]/80 border border-[#00FF55]/10 rounded-xl p-2.5 font-mono text-[8px] text-[#00FF55]/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><Compass size={8} className="animate-spin-slow" /> [LOG_SCAN] ACTIVE_POSE: VERIFIED_LOCK</span>
                <span className="text-green-500">[OK]</span>
              </div>
              <div className="flex items-center justify-between">
                <span>[LOG_PORTAL] SYSTEM_CALIBRATION_RATE: 99.84%</span>
                <span className="text-[#00FF55]">RUN_OK</span>
              </div>
            </div>
          </div>
        </div>

        {/* Futuristic Category Filter Chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 border-b border-[#00FF55]/10">
          {CATEGORY_FILTERS.map(f => {
            const Icon = f.icon;
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`flex items-center gap-2 px-4 py-2 text-[9px] font-bold tracking-widest uppercase transition-all duration-300 border relative ${
                  isActive 
                    ? 'bg-[#00FF55]/15 border-[#00FF55] text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-transparent border-transparent text-[#00FF55]/60 hover:text-white hover:border-[#00FF55]/20'
                }`}
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                }}
              >
                {isActive && (
                  <span className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-0.5 bg-[#00FF55]" />
                )}
                <Icon size={10} className={isActive ? 'text-[#00FF55] animate-pulse' : ''} />
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
                {/* Tier Subheader with Futuristic Brackets */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-4 w-1" style={{ backgroundColor: tier.accentColor }} />
                    <h2 className="text-[11px] font-black tracking-[0.25em] uppercase flex items-center gap-1.5" style={{ color: tier.accentColor }}>
                      {tier.name}_TIER_DIV_0{INITIAL_TIERS.indexOf(tier) + 1}
                    </h2>
                  </div>
                  <span className="text-[8px] text-[#00FF55]/30">MEM_LOCK // ENCRYPT_S_0{INITIAL_TIERS.indexOf(tier) + 1}</span>
                </div>

                {/* Cybernetic Badges Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {filteredBadges.map((badge) => {
                    const completedCount = badge.criteria.filter(c => c.completed).length;
                    const totalCount = badge.criteria.length;
                    const progressPct = Math.round((completedCount / totalCount) * 100);
                    const isHovered = hoveredBadgeId === badge.id;

                    return (
                      <motion.button
                        key={badge.id}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.97 }}
                        onHoverStart={() => setHoveredBadgeId(badge.id)}
                        onHoverEnd={() => setHoveredBadgeId(null)}
                        onClick={() => setSelectedBadge(badge)}
                        className={`cyber-clip border p-3.5 flex flex-col items-center justify-between text-center aspect-square relative overflow-hidden transition-all duration-500 ${
                          badge.unlocked 
                            ? `bg-[#030712]/80 ${tier.borderClass} ${tier.glowClass}`
                            : 'bg-[#030712]/30 border-white/5 text-white/10'
                        }`}
                        style={{
                          borderColor: isHovered ? tier.accentColor : undefined,
                          boxShadow: isHovered ? `0 0 20px ${tier.accentColor}25` : undefined
                        }}
                      >
                        {/* Hover sweeping laser effect line */}
                        {isHovered && badge.unlocked && (
                          <div 
                            className="absolute left-0 right-0 h-0.5 pointer-events-none opacity-80"
                            style={{ 
                              background: `linear-gradient(90deg, transparent, ${tier.accentColor}, transparent)`, 
                              animation: 'laser-sweep 1.8s linear infinite',
                              boxShadow: `0 0 8px ${tier.accentColor}`
                            }}
                          />
                        )}

                        {/* Top corner brackets detail */}
                        <div className="absolute top-1.5 left-1.5 text-[6px] tracking-tighter opacity-30 select-none">
                          {badge.unlocked ? `[SYS_OK]` : `[SYS_LCK]`}
                        </div>

                        {!badge.unlocked && (
                          <div className="absolute top-1.5 right-1.5 text-white/20">
                            <Lock size={9} />
                          </div>
                        )}
                        
                        {/* Rotating Badge Core */}
                        <div className="w-16 h-16 flex items-center justify-center mt-1">
                          <BadgeVisual id={badge.id} tier={tier.name} unlocked={badge.unlocked} isHovered={isHovered} />
                        </div>

                        {/* Telemetry Labels */}
                        <div className="w-full mt-2.5 space-y-1.5">
                          <span className={`text-[8px] font-black uppercase tracking-wider block truncate px-0.5 ${
                            badge.unlocked ? 'text-white' : 'text-[#00FF55]/25'
                          }`}>
                            {badge.name}
                          </span>

                          {/* Futuristic Grid Progress tracker */}
                          <div className="w-full flex items-center justify-between gap-1">
                            <div className="flex-1 bg-white/5 h-0.5 rounded-full overflow-hidden">
                              <div 
                                className="h-full transition-all duration-700 ease-out" 
                                style={{ 
                                  width: `${progressPct}%`,
                                  backgroundColor: badge.unlocked ? tier.accentColor : 'rgba(255,255,255,0.05)',
                                  boxShadow: badge.unlocked ? `0 0 6px ${tier.accentColor}` : undefined
                                }} 
                              />
                            </div>
                            <span className={`text-[6px] font-mono font-bold leading-none ${badge.unlocked ? 'text-white/70' : 'text-white/20'}`}>
                              {progressPct}%
                            </span>
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

      {/* Holographic Diagnostic Detail Modal Overlay */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setSelectedBadge(null)}
          >
            {/* Modal Blueprint sweep */}
            <div className="absolute inset-0 hud-grid opacity-20 pointer-events-none" />

            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="w-full max-w-[370px] cyber-clip bg-[#030712]/95 p-6 border relative overflow-hidden"
              onClick={e => e.stopPropagation()}
              style={{
                borderColor: INITIAL_TIERS.find(t => t.name === selectedBadge.tier)?.accentColor || '#00FF55',
                boxShadow: `0 0 35px ${(INITIAL_TIERS.find(t => t.name === selectedBadge.tier)?.accentColor || '#00FF55')}25`
              }}
            >
              {/* Scanline Sweep animation on modal open */}
              <div 
                className="absolute left-0 right-0 h-[3px] pointer-events-none opacity-80"
                style={{ 
                  background: `linear-gradient(90deg, transparent, ${INITIAL_TIERS.find(t => t.name === selectedBadge.tier)?.accentColor}, transparent)`, 
                  animation: 'laser-sweep 3s linear infinite',
                  boxShadow: `0 0 10px ${INITIAL_TIERS.find(t => t.name === selectedBadge.tier)?.accentColor}`
                }}
              />

              {/* Corner tech indicators */}
              <div className="absolute top-3 left-3 text-[8px] text-[#00FF55]/40 font-mono">DIAGNOSTICS_PORTAL // SYS_VER_1.8</div>
              <div className="absolute bottom-3 right-3 text-[8px] text-[#00FF55]/40 font-mono">SECTOR_STARK_INDEX</div>

              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 bg-white/5 border border-white/10 p-1.5 rounded-full hover:bg-white/10 text-white/60"
              >
                <X size={14} />
              </button>

              {/* Interactive Core Hologram Display */}
              <div className="flex flex-col items-center text-center mt-6">
                <div className="h-28 w-28 relative flex items-center justify-center">
                  <BadgeVisual id={selectedBadge.id} tier={selectedBadge.tier} unlocked={selectedBadge.unlocked} isHovered={true} />
                </div>

                <h3 className="text-lg font-black tracking-widest text-white mt-4 uppercase">
                  {selectedBadge.name}
                </h3>
                
                <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest mt-2.5 border ${
                  selectedBadge.unlocked 
                    ? 'bg-[#00FF55]/10 text-[#00FF55] border-[#00FF55]/30 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                    : 'bg-white/5 text-white/30 border-white/10'
                }`}>
                  {selectedBadge.unlocked ? '// UNLOCKED_ACCESS' : '// ENCRYPT_LOCKED'}
                </span>
              </div>

              {/* Unlock Requirement Statement */}
              <p className="text-center text-[10px] text-white/60 mt-4 leading-relaxed px-1 border-t border-b border-[#00FF55]/10 py-3 font-mono">
                DESCR: &quot;{selectedBadge.desc}&quot;
              </p>

              {/* Checklist Criteria Details */}
              <div className="mt-5 space-y-2">
                <p className="font-bold text-[#00FF55]/40 text-[8px] uppercase tracking-[0.2em] pl-1">
                  CRITERIA_CHECKLIST_VERIFICATION
                </p>
                
                {selectedBadge.criteria.map((c, i) => (
                  <div 
                    key={i} 
                    className={`flex items-center justify-between p-3 cyber-clip-sm border font-mono ${
                      c.completed 
                        ? 'bg-[#00FF55]/5 border-[#00FF55]/25 text-white' 
                        : 'bg-white/2 border-white/5 text-white/30'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 max-w-[70%]">
                      <div className={`p-0.5 rounded-sm mt-0.5 border text-black flex items-center justify-center ${
                        c.completed 
                          ? 'bg-[#00FF55] border-[#00FF55]' 
                          : 'bg-transparent border-white/15 text-white/20'
                      }`}>
                        {c.completed ? <Check size={8} strokeWidth={4} /> : <Lock size={8} />}
                      </div>
                      <div className="text-left leading-tight">
                        <p className="text-[10px] font-bold tracking-tight">{c.name}</p>
                        <p className={`text-[8px] mt-0.5 ${c.completed ? 'text-[#00FF55]/70' : 'text-white/20'}`}>
                          TARGET: {c.target}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`text-[9px] font-bold ${
                        c.completed ? 'text-[#00FF55] font-black' : 'text-white/30'
                      }`}>
                        {c.completed ? '[OK]' : '[PENDING]'} ({c.current})
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rewards Stats Footer */}
              <div className="grid grid-cols-2 gap-2 mt-5 pt-1">
                <div className="bg-white/2 p-2.5 cyber-clip-sm border border-white/5 text-center">
                  <p className="text-[8px] text-white/30 uppercase font-bold">REWARD_CREDIT</p>
                  <p className="text-xs font-black text-[#00FF55]">+{selectedBadge.xp} XP</p>
                </div>
                <div className="bg-white/2 p-2.5 cyber-clip-sm border border-white/5 text-center">
                  <p className="text-[8px] text-white/30 uppercase font-bold">STAMP_DATE</p>
                  <p className="text-[10px] font-bold text-white/70 pt-0.5 truncate">
                    {selectedBadge.unlockedAt ? selectedBadge.unlockedAt : 'UNRESOLVED'}
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
