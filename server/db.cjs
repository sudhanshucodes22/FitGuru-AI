// server/db.cjs
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFilePath = (filename) => path.join(DATA_DIR, filename);

const readJSON = (filename, defaultVal = []) => {
    const filePath = getFilePath(filename);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2));
        return defaultVal;
    }
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (e) {
        console.error(`Error reading database file ${filename}:`, e);
        return defaultVal;
    }
};

const writeJSON = (filename, data) => {
    const filePath = getFilePath(filename);
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error(`Error writing database file ${filename}:`, e);
        return false;
    }
};

// Database interfaces
const db = {
    users: {
        all: () => readJSON('users.json', []),
        findByEmail: (email) => {
            const users = readJSON('users.json', []);
            return users.find(u => u.email === email);
        },
        create: (user) => {
            const users = readJSON('users.json', []);
            users.push(user);
            writeJSON('users.json', users);
            return user;
        },
        updateProfile: (email, profileData) => {
            const users = readJSON('users.json', []);
            const index = users.findIndex(u => u.email === email);
            if (index !== -1) {
                users[index] = { ...users[index], ...profileData };
                writeJSON('users.json', users);
                return users[index];
            }
            return null;
        }
    },
    habits: {
        getForUser: (email) => {
            const allHabits = readJSON('habits.json', {});
            // Default mock habits if none exist
            if (!allHabits[email]) {
                allHabits[email] = [
                    { id: '1', name: 'Drink 3L Water', category: 'Diet', color: '#C6FF00', completedDates: [], time: 'All Day' },
                    { id: '2', name: '10k Steps Walk', category: 'Fitness', color: '#00E5FF', completedDates: [], time: 'All Day' },
                    { id: '3', name: '8 Hours Sleep', category: 'Sleep', color: '#D400FF', completedDates: [], time: '10:00 PM' },
                ];
                writeJSON('habits.json', allHabits);
            }
            return allHabits[email];
        },
        saveForUser: (email, habits) => {
            const allHabits = readJSON('habits.json', {});
            allHabits[email] = habits;
            writeJSON('habits.json', allHabits);
            return habits;
        }
    },
    progress: {
        getForUser: (email) => {
            const allProgress = readJSON('progress.json', {});
            // Default mock progress values if none exist
            if (!allProgress[email]) {
                allProgress[email] = [
                    { id: 'calories', label: 'Calories', value: 1450, max: 2200 },
                    { id: 'protein', label: 'Protein', value: 85, max: 140 },
                    { id: 'water', label: 'Water', value: 5, max: 8 },
                    { id: 'steps', label: 'Steps', value: 6200, max: 10000 },
                ];
                writeJSON('progress.json', allProgress);
            }
            return allProgress[email];
        },
        saveForUser: (email, progress) => {
            const allProgress = readJSON('progress.json', {});
            allProgress[email] = progress;
            writeJSON('progress.json', allProgress);
            return progress;
        }
    }
};

module.exports = db;
