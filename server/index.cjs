// server/index.cjs
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db.cjs');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Load environment variables (from .env file if it exists)
const envPath = path.join(__dirname, '.env');
let GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY\s*=\s*(.*)/);
    if (match && match[1]) {
        GEMINI_API_KEY = match[1].trim().replace(/['"]/g, '');
    }
}

// Middleware to mock authentication from token header
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.userEmail = 'alex@fitguru.ai';
        return next();
    }
    const token = authHeader.split(' ')[1];
    if (token.startsWith('mock-jwt-token-')) {
        req.userEmail = token.replace('mock-jwt-token-', '');
    } else {
        req.userEmail = 'alex@fitguru.ai';
    }
    next();
};

// -------------------- AUTH ROUTES --------------------

app.post('/api/auth/signup', (req, res) => {
    const { name, goal, email, password } = req.body;
    const userEmail = email || 'alex@fitguru.ai';
    
    let existingUser = db.users.findByEmail(userEmail);
    if (!existingUser) {
        existingUser = db.users.create({
            name: name || 'Alex',
            goal: goal || 'Build Muscle',
            email: userEmail,
            weight: 75,
            height: 178,
            age: 28
        });
    } else {
        existingUser = db.users.updateProfile(userEmail, { name, goal });
    }
    
    const token = `mock-jwt-token-${userEmail}`;
    res.json({ token, user: existingUser });
});

app.post('/api/auth/login', (req, res) => {
    const { email } = req.body;
    const userEmail = email || 'alex@fitguru.ai';
    
    let user = db.users.findByEmail(userEmail);
    if (!user) {
        user = db.users.create({
            name: 'Alex',
            goal: 'Build Muscle',
            email: userEmail,
            weight: 75,
            height: 178,
            age: 28
        });
    }
    
    const token = `mock-jwt-token-${userEmail}`;
    res.json({ token, user });
});

app.get('/api/auth/profile', authenticate, (req, res) => {
    let user = db.users.findByEmail(req.userEmail);
    if (!user) {
        user = db.users.create({
            name: 'Alex',
            goal: 'Build Muscle',
            email: req.userEmail,
            weight: 75,
            height: 178,
            age: 28
        });
    }
    res.json(user);
});

app.post('/api/auth/profile', authenticate, (req, res) => {
    const updated = db.users.updateProfile(req.userEmail, req.body);
    if (updated) {
        res.json(updated);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// -------------------- TRACKER ROUTES --------------------

app.get('/api/tracker/habits', authenticate, (req, res) => {
    const habits = db.habits.getForUser(req.userEmail);
    res.json(habits);
});

app.post('/api/tracker/habits', authenticate, (req, res) => {
    const habits = db.habits.saveForUser(req.userEmail, req.body);
    res.json(habits);
});

// -------------------- HOME / PROGRESS ROUTES --------------------

app.get('/api/home/progress', authenticate, (req, res) => {
    const progress = db.progress.getForUser(req.userEmail);
    res.json(progress);
});

app.post('/api/home/progress', authenticate, (req, res) => {
    const { id, value } = req.body;
    const progress = db.progress.getForUser(req.userEmail);
    
    const index = progress.findIndex(item => item.id === id);
    if (index !== -1) {
        progress[index].value = value;
        db.progress.saveForUser(req.userEmail, progress);
        res.json(progress[index]);
    } else {
        res.status(400).json({ error: 'Invalid metric ID' });
    }
});

app.get('/api/home/gyms', (req, res) => {
    res.json([
        { id: '1', name: 'Gold\'s Gym', offer: '50% OFF First Month', rating: 4.5, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80' },
        { id: '2', name: 'Anytime Fitness', offer: 'First Month Free', rating: 4.3, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80' },
        { id: '3', name: 'CrossFit Box', offer: '40% OFF', rating: 4.7, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80' },
    ]);
});

// -------------------- AI CHAT COACH ROUTE --------------------

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

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const lowerInput = message.toLowerCase();

    if (GEMINI_API_KEY) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are FitGuru AI, an encouraging and highly knowledgeable health coach. Reply concisely to: "${message}"`
                        }]
                    }]
                })
            });

            if (response.ok) {
                const data = await response.json();
                const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (aiText) {
                    return res.json({ role: 'ai', content: aiText.trim() });
                }
            }
        } catch (err) {
            console.error('Gemini API call failed, falling back to mock engine:', err);
        }
    }

    if (lowerInput.includes('cut') || lowerInput.includes('cutting') || lowerInput.includes('deficit')) {
        res.json({
            role: 'ai',
            content: "Got it! Since you are on a cutting phase, you should focus on a caloric deficit. Here is a precise 7-day cutting diet plan with gram quantities:",
            isTable: true,
            tableData: cuttingDietPlan
        });
    } else if (lowerInput.includes('bulk') || lowerInput.includes('bulking') || lowerInput.includes('surplus')) {
        res.json({
            role: 'ai',
            content: "Awesome! For building mass, you need a caloric surplus. I suggest eating 5-6 meals a day to get enough calories. Here is a precise 7-day bulking diet plan with gram quantities:",
            isTable: true,
            tableData: bulkingDietPlan
        });
    } else if (lowerInput.includes('hi') || lowerInput.includes('hello')) {
        res.json({
            role: 'ai',
            content: "Hi! I'm FitGuru AI — your personal health coach. I can help create custom nutrition guides, advice on posture, or compile custom diets. What is your health goal today? 💪"
        });
    } else if (lowerInput.includes('skip') || lowerInput.includes('tired')) {
        res.json({
            role: 'ai',
            content: "Listen to your body! Skipping a workout or feeling tired is completely normal. Ensure you focus on recovery, drink enough water, and try to get a short walk in if possible. Nutrition is 80% of the game!"
        });
    } else {
        res.json({
            role: 'ai',
            content: "Based on your fitness profile, I recommend prioritizing your daily protein intake, drinking plenty of water, and keeping your workouts consistent. Let me know if you would like me to compile a specific diet plan for 'cutting' or 'bulking'!"
        });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`FitGuru API Backend is running on port ${PORT}`);
});
