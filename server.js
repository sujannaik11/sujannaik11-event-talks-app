const express = require('express');
const path = require('path');
const talks = require('./data'); // Import talk data

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to calculate the schedule
const calculateSchedule = () => {
    const eventStartHour = 10; // 10:00 AM
    let currentMoment = new Date();
    currentMoment.setHours(eventStartHour, 0, 0, 0); // Set to 10:00:00.000

    const schedule = [];
    let talkIndex = 0;

    while (talkIndex < talks.length) {
        // Add talk
        const talk = talks[talkIndex];
        const talkStartTime = new Date(currentMoment);
        currentMoment.setMinutes(currentMoment.getMinutes() + talk.duration);
        const talkEndTime = new Date(currentMoment);

        schedule.push({
            type: 'talk',
            ...talk,
            startTime: talkStartTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            endTime: talkEndTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
        });

        talkIndex++;

        // Add transition time
        if (talkIndex < talks.length) {
            currentMoment.setMinutes(currentMoment.getMinutes() + 10); // 10 minute transition
            schedule.push({
                type: 'transition',
                description: 'Transition',
                startTime: talkEndTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                endTime: currentMoment.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
            });
        }

        // Add lunch break after 3rd talk (assuming 6 talks, 3 before and 3 after lunch)
        if (talkIndex === 3) {
            const lunchStartTime = new Date(currentMoment);
            currentMoment.setMinutes(currentMoment.getMinutes() + 60); // 1 hour lunch
            const lunchEndTime = new Date(currentMoment);
            schedule.push({
                type: 'break',
                title: 'Lunch Break',
                duration: 60,
                startTime: lunchStartTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                endTime: lunchEndTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
            });
        }
    }
    return schedule;
};


// API endpoint for the full event schedule
app.get('/api/schedule', (req, res) => {
    res.json(calculateSchedule());
});

// API endpoint for talks, with category filtering
app.get('/api/talks', (req, res) => {
    const category = req.query.category;
    if (category) {
        const filteredTalks = talks.filter(talk =>
            talk.category.some(cat => cat.toLowerCase().includes(category.toLowerCase()))
        );
        res.json(filteredTalks);
    } else {
        res.json(talks);
    }
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
