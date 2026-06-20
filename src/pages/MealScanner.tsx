import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Lightbulb, Target, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/BottomNav';

type Goal = 'bulking' | 'cutting' | 'recomp' | 'maintenance';

interface Ingredient {
  name: string;
  quantity: string; // e.g. "150g" or "2 pieces"
}

interface MealResult {
  name: string;
  imageUrl: string;
  goal: Goal[];
  ingredients: Ingredient[];
  nutrition: { label: string; value: number; unit: string; max: number; color: string }[];
  aiSuggestions: Record<Goal, string>;
  mealType: string; // Breakfast / Lunch / Dinner / Snack
  totalCalories: number;
}

const GOAL_META: Record<Goal, { label: string; color: string; bg: string; emoji: string }> = {
  bulking: { label: 'Bulking', color: 'hsl(var(--primary))', bg: 'rgba(0, 255, 85, 0.1)', emoji: '🔥' },
  cutting: { label: 'Cutting', color: 'hsl(var(--primary))', bg: 'rgba(0, 255, 85, 0.1)', emoji: '⚡' },
  recomp: { label: 'Recomp', color: 'hsl(var(--primary))', bg: 'rgba(0, 255, 85, 0.1)', emoji: '💪' },
  maintenance: { label: 'Maintenance', color: 'hsl(var(--primary))', bg: 'rgba(0, 255, 85, 0.1)', emoji: '🎯' },
};

const MOCK_MEALS: MealResult[] = [
  {
    name: 'Paneer Butter Masala + Rice',
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80',
    mealType: 'Lunch',
    totalCalories: 620,
    goal: ['bulking', 'maintenance'],
    ingredients: [
      { name: 'Paneer', quantity: '150g' },
      { name: 'Basmati Rice', quantity: '1 cup (180g)' },
      { name: 'Butter', quantity: '1 tbsp (14g)' },
      { name: 'Tomato Gravy', quantity: '100ml' },
      { name: 'Cream', quantity: '2 tbsp (30ml)' },
    ],
    nutrition: [
      { label: 'Calories', value: 620, unit: 'kcal', max: 800, color: 'bg-orange-400' },
      { label: 'Protein', value: 28, unit: 'g', max: 50, color: 'bg-blue-400' },
      { label: 'Carbs', value: 72, unit: 'g', max: 100, color: 'bg-yellow-400' },
      { label: 'Fats', value: 24, unit: 'g', max: 50, color: 'bg-red-400' },
      { label: 'Fiber', value: 3, unit: 'g', max: 15, color: 'bg-green-400' },
      { label: 'Sugar', value: 8, unit: 'g', max: 25, color: 'bg-pink-400' },
      { label: 'Sodium', value: 680, unit: 'mg', max: 2300, color: 'bg-purple-400' },
    ],
    aiSuggestions: {
      bulking: 'Great calorie-dense choice for bulking! Add an extra 50g paneer for more protein. Pair with a banana shake post-meal.',
      cutting: 'High in carbs for a cutting phase. Reduce rice to ½ cup (90g) and skip the cream — saves ~180 kcal while keeping protein.',
      recomp: 'Good protein-carb balance. Swap white rice for brown rice (1 cup) for better fiber. Add a cup of salad to increase volume.',
      maintenance: 'Well-balanced meal for maintenance. Portion looks just right for a sedentary day. Active days, add another 50g rice.',
    },
  },
  {
    name: 'Grilled Chicken + Sweet Potato',
    imageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&q=80',
    mealType: 'Dinner',
    totalCalories: 470,
    goal: ['cutting', 'recomp', 'maintenance'],
    ingredients: [
      { name: 'Chicken Breast', quantity: '200g' },
      { name: 'Sweet Potato', quantity: '1 medium (130g)' },
      { name: 'Olive Oil', quantity: '1 tsp (5ml)' },
      { name: 'Mixed Greens', quantity: '1 cup (30g)' },
    ],
    nutrition: [
      { label: 'Calories', value: 470, unit: 'kcal', max: 800, color: 'bg-orange-400' },
      { label: 'Protein', value: 48, unit: 'g', max: 50, color: 'bg-blue-400' },
      { label: 'Carbs', value: 38, unit: 'g', max: 100, color: 'bg-yellow-400' },
      { label: 'Fats', value: 10, unit: 'g', max: 50, color: 'bg-red-400' },
      { label: 'Fiber', value: 6, unit: 'g', max: 15, color: 'bg-green-400' },
      { label: 'Sugar', value: 5, unit: 'g', max: 25, color: 'bg-pink-400' },
      { label: 'Sodium', value: 280, unit: 'mg', max: 2300, color: 'bg-purple-400' },
    ],
    aiSuggestions: {
      bulking: 'Too low in calories for a bulk. Add a second chicken breast + 2 tbsp peanut butter on the side for an extra ~350 kcal.',
      cutting: 'Perfect cutting meal! High protein keeps you full and preserves muscle. Keep this in your daily rotation. ✅',
      recomp: 'Excellent recomp meal — high protein, moderate carbs, low fat. Ideal post-workout dinner.',
      maintenance: 'Clean and balanced. On high-activity days, add 1 more sweet potato to top up carbs.',
    },
  },
];

const MealScanner = () => {
  const [scanned, setScanned] = useState(false);
  const [tab, setTab] = useState<'camera' | 'upload'>('camera');
  const [selectedGoal, setSelectedGoal] = useState<Goal>('maintenance');
  const [meal, setMeal] = useState<MealResult>(MOCK_MEALS[0]);
  const [showIngredients, setShowIngredients] = useState(false);

  const handleScan = () => {
    // Cycle through mock meals for demo
    setMeal(MOCK_MEALS[Math.floor(Math.random() * MOCK_MEALS.length)]);
    setScanned(true);
    setShowIngredients(false);
  };

  return (
    <div className="pb-20 min-h-screen bg-[#09090b]">
      <div className="p-5 pt-10">
        <h1 className="font-heading text-4xl text-white tracking-wide">MEAL SCANNER</h1>
        <p className="text-sm text-white/40 mt-1">Snap a photo to get goal-based nutrition analysis</p>

        {/* Goal Selector */}
        <div className="mt-5 glass rounded-3xl p-4 border border-white/5">
          <p className="text-[10px] uppercase font-bold text-white/30 mb-3 tracking-widest">Your Current Goal</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(GOAL_META) as Goal[]).map((g) => {
              const meta = GOAL_META[g];
              const isActive = selectedGoal === g;
              return (
                <button
                  key={g}
                  onClick={() => setSelectedGoal(g)}
                  className="flex items-center gap-2 py-2.5 px-3 rounded-2xl transition-all text-left border"
                  style={{
                    backgroundColor: isActive ? meta.bg : 'transparent',
                    borderColor: isActive ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <span className="text-lg">{meta.emoji}</span>
                  <div>
                    <p className="text-xs font-bold" style={{ color: isActive ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.5)' }}>
                      {meta.label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Camera Tabs */}
        <div className="flex gap-2 mt-4">
          {(['camera', 'upload'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold uppercase tracking-wide transition-all ${tab === t ? 'bg-primary text-black' : 'glass text-white/40'
                }`}
            >
              {t === 'camera' ? <Camera size={16} /> : <Upload size={16} />}
              {t === 'camera' ? 'Camera' : 'Upload'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!scanned ? (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-5">
              <div
                onClick={handleScan}
                className="glass rounded-3xl h-64 flex flex-col items-center justify-center cursor-pointer border border-white/5 hover:border-primary/30 relative overflow-hidden group transition-all duration-300"
              >
                {/* Athletic scanner target corners */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-primary" />
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-primary" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-primary" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-primary" />

                <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                  <Camera size={36} className="text-primary" />
                </div>
                <p className="text-white font-heading text-xl uppercase tracking-wider">Take a photo of your meal</p>
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Tap to simulate scan</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-4">

              {/* Meal Image */}
              <div className="relative rounded-3xl overflow-hidden h-52">
                <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex gap-2 mb-2">
                    <span className="text-[10px] bg-primary/20 text-primary rounded-full px-2 py-0.5 font-bold uppercase tracking-wide">
                      {meal.mealType}
                    </span>
                    {meal.goal.map((g) => (
                      <span
                        key={g}
                        className="text-[10px] rounded-full px-2 py-0.5 font-bold uppercase tracking-wide"
                        style={{ backgroundColor: GOAL_META[g].bg, color: GOAL_META[g].color }}
                      >
                        {GOAL_META[g].emoji} {GOAL_META[g].label}
                      </span>
                    ))}
                  </div>
                  <h2 className="font-heading text-3xl text-white">{meal.name}</h2>
                </div>
              </div>

              {/* Calorie Hero */}
              <div className="glass rounded-3xl p-5 flex items-center gap-5">
                <div>
                  <p className="font-heading text-5xl text-primary">{meal.totalCalories}</p>
                  <p className="text-xs text-white/40 uppercase tracking-widest">Total Calories</p>
                </div>
                <div className="flex-1 h-px bg-white/5" />
                <div className="text-right">
                  <p className="font-heading text-2xl text-white">
                    {meal.nutrition.find((n) => n.label === 'Protein')?.value}g
                  </p>
                  <p className="text-xs text-white/40 uppercase tracking-widest">Protein</p>
                </div>
              </div>

              {/* Ingredients */}
              <div className="glass rounded-3xl overflow-hidden border border-white/5">
                <button
                  onClick={() => setShowIngredients(!showIngredients)}
                  className="w-full flex items-center justify-between p-5"
                >
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-widest">Ingredients</p>
                    <p className="text-white font-heading text-xl">{meal.ingredients.length} items detected</p>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-white/30 transition-transform ${showIngredients ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {showIngredients && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-2">
                        {meal.ingredients.map((ing) => (
                          <div key={ing.name} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                            <span className="text-sm text-white">{ing.name}</span>
                            <span className="text-sm font-bold text-primary">{ing.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Nutrition Breakdown */}
              <div className="glass rounded-3xl p-5 space-y-3 border border-white/5">
                <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Nutrition Breakdown</p>
                {meal.nutrition.map((n) => (
                  <div key={n.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/50">{n.label}</span>
                      <span className="text-white font-bold">{n.value} <span className="text-white/30">{n.unit}</span></span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        style={{
                          opacity: n.label === 'Protein' || n.label === 'Calories' ? 1 : 0.5
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(n.value / n.max) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Goal-Based AI Suggestion */}
              <div
                className="rounded-3xl p-5 border"
                style={{
                  backgroundColor: GOAL_META[selectedGoal].bg,
                  borderColor: GOAL_META[selectedGoal].color + '33',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Target size={16} style={{ color: GOAL_META[selectedGoal].color }} />
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: GOAL_META[selectedGoal].color }}>
                    {GOAL_META[selectedGoal].label} Advice
                  </p>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">{meal.aiSuggestions[selectedGoal]}</p>
              </div>

              <Button
                onClick={() => setScanned(false)}
                variant="outline"
                className="w-full h-12 rounded-2xl border-white/10 text-white hover:bg-white/5 font-heading text-lg tracking-widest"
              >
                SCAN ANOTHER MEAL
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
};

export default MealScanner;
