import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BottomNav from '@/components/BottomNav';
import { api } from '@/lib/api';

interface Message {
  role: 'user' | 'ai';
  content: string;
  isTable?: boolean;
  tableData?: { day: string; meal: string; lunch: string; dinner: string }[];
}

const defaultDietPlan = [
  { day: 'Mon', meal: 'Eggs + Oats', lunch: 'Chicken Rice Bowl', dinner: 'Salmon + Veggies' },
  { day: 'Tue', meal: 'Protein Smoothie', lunch: 'Turkey Wrap', dinner: 'Lean Beef Stir-fry' },
  { day: 'Wed', meal: 'Greek Yogurt + Granola', lunch: 'Tuna Salad', dinner: 'Grilled Chicken' },
  { day: 'Thu', meal: 'Eggs + Toast', lunch: 'Paneer Rice', dinner: 'Fish Tacos' },
  { day: 'Fri', meal: 'Oatmeal + Banana', lunch: 'Chicken Pasta', dinner: 'Tofu Stir-fry' },
  { day: 'Sat', meal: 'Pancakes + Berries', lunch: 'Egg Fried Rice', dinner: 'Steak + Sweet Potato' },
  { day: 'Sun', meal: 'Protein Oats', lunch: 'Dal + Rice', dinner: 'Grilled Salmon' },
];

const cuttingDietPlan = [
  { day: 'Mon', meal: 'Oats (50g) + 3 Egg Whites (100g)', lunch: 'Chicken Breast (150g) + Broccoli (100g)', dinner: 'Grilled Fish (150g) + Salad (150g)' },
  { day: 'Tue', meal: 'Greek Yogurt (150g) + Berries (50g)', lunch: 'Tuna (100g) + Cucumber Salad (150g)', dinner: 'Lean Beef (150g) + Asparagus (100g)' },
  { day: 'Wed', meal: 'Protein Shake (1 scoop) + Apple', lunch: 'Grilled Chicken (150g) + Zucchini (150g)', dinner: 'Tofu (150g) + Spinach (100g)' },
  { day: 'Thu', meal: '4 Egg Whites (130g) + Toast', lunch: 'Paneer (100g) + Brown Rice (50g)', dinner: 'Chicken Salad (200g)' },
  { day: 'Fri', meal: 'Oats (50g) + Almonds (15g)', lunch: 'Chicken (150g) + Cauliflower Rice (150g)', dinner: 'Fish Tikka (150g) + Salad (150g)' },
  { day: 'Sat', meal: '4 Egg Whites (130g)', lunch: 'Soya Chunks (50g) + Veggies (150g)', dinner: 'Grilled Chicken (150g) + Soup' },
  { day: 'Sun', meal: 'Protein Smoothie (250ml)', lunch: 'Chicken Breast (150g) + Beans (100g)', dinner: 'Baked Salmon (150g) + Broccolli' },
];

const bulkingDietPlan = [
  { day: 'Mon', meal: 'Oats (100g) + 4 Whole Eggs + Peanut Butter (30g)', lunch: 'Chicken Breast (200g) + White Rice (200g)', dinner: 'Mutton (200g) + Sweet Potato (200g)' },
  { day: 'Tue', meal: '4 Eggs + 2 Banana + Milk (300ml)', lunch: 'Turkey (200g) + Pasta (150g)', dinner: 'Beef Steak (200g) + Mashed Potatoes' },
  { day: 'Wed', meal: 'Greek Yogurt (200g) + Granola (100g)', lunch: 'Tuna (200g) + Rice (250g)', dinner: 'Chicken Thighs (250g) + Quinoa (150g)' },
  { day: 'Thu', meal: 'Pancakes (3) + Maple Syrup + 4 Eggs', lunch: 'Paneer (200g) + Rice (200g)', dinner: 'Fish (250g) + Brown Rice (150g)' },
  { day: 'Fri', meal: 'Oatmeal (100g) + Whey + Peanut Butter (30g)', lunch: 'Chicken Pasta (300g)', dinner: 'Tofu (250g) + Veggies + Rice' },
  { day: 'Sat', meal: 'Bread (4 slices) + Peanut Butter + Milk', lunch: 'Egg Fried Rice (4 eggs + 200g rice)', dinner: 'Steak (250g) + Sweet Potato (250g)' },
  { day: 'Sun', meal: 'Protein Oats (100g) + 2 Bananas', lunch: 'Dal (2 bowls) + Rice (250g) + Ghee', dinner: 'Grilled Salmon (250g) + Rice (200g)' },
];

const quickChips = [
  'Diet for cutting',
  'Diet for bulking',
  'I skipped workout today',
  'I feel tired all day',
];

const initialMessages: Message[] = [
  { role: 'ai', content: "Hi! I'm FitGuru AI — your personal health coach. How can I help you today? 💪" },
  { role: 'user', content: 'Create my diet plan for building muscle' },
  {
    role: 'ai',
    content: "Awesome! For building mass, you need a caloric surplus. I suggest eating 5-6 meals a day to get enough calories. Here is a precise 7-day bulking diet plan with gram quantities:",
    isTable: true,
    tableData: bulkingDietPlan,
  },
  { role: 'ai', content: "This plan provides a caloric surplus. Adjust portions based on your training intensity. Want me to modify anything?" },
];

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');

    try {
      const reply = await api.chat.sendMessage(userMessage);
      setMessages((prev) => [...prev, reply]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: "Sorry, I am having trouble connecting to my cognitive cores right now. Please try again later! ⚡" }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-screen pb-16">
      {/* Header */}
      <div className="p-4 pt-8 glass border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-lg">🤖</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary border-2 border-background animate-pulse-glow" />
          </div>
          <div>
            <h1 className="font-heading text-lg text-foreground">FitGuru AI</h1>
            <p className="text-[10px] text-primary">Online • Your Personal Health Coach</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'glass rounded-bl-md'
                }`}
            >
              <p>{msg.content}</p>
              {msg.isTable && (
                <div className="mt-3 rounded-xl overflow-hidden border border-border">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-secondary">
                        <th className="p-2 text-left text-muted-foreground">Day</th>
                        <th className="p-2 text-left text-muted-foreground">Breakfast</th>
                        <th className="p-2 text-left text-muted-foreground">Lunch</th>
                        <th className="p-2 text-left text-muted-foreground">Dinner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(msg.tableData || defaultDietPlan).map((d) => (
                        <tr key={d.day} className="border-t border-border">
                          <td className="p-2 font-medium text-primary">{d.day}</td>
                          <td className="p-2 text-foreground">{d.meal}</td>
                          <td className="p-2 text-foreground">{d.lunch}</td>
                          <td className="p-2 text-foreground">{d.dinner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Chips */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
        {quickChips.map((c) => (
          <button
            key={c}
            onClick={() => { setInput(c); }}
            className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {c}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 glass border-t border-border flex gap-2">
        <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
          <Mic size={20} />
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask your AI coach..."
          className="flex-1 h-10 rounded-full bg-secondary border-0"
        />
        <Button onClick={sendMessage} size="icon" className="shrink-0 rounded-full">
          <Send size={18} />
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Chat;
