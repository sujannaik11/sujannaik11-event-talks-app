document.addEventListener('DOMContentLoaded', () => {
    const scheduleContainer = document.getElementById('scheduleContainer');
    const categorySearchInput = document.getElementById('categorySearch');
    let allScheduleData = []; // To store the full schedule for filtering

    const fetchSchedule = async () => {
        try {
            const response = await fetch('/api/schedule');
            allScheduleData = await response.json();
            renderSchedule(allScheduleData);
        } catch (error) {
            console.error('Error fetching schedule:', error);
            scheduleContainer.innerHTML = '<p>Failed to load schedule. Please try again later.</p>';
        }
    };

    const renderSchedule = (data) => {
        scheduleContainer.innerHTML = ''; // Clear previous content

        data.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('schedule-item', item.type);

            if (item.type === 'talk') {
                itemElement.innerHTML = `
                    <p class="time">${item.startTime} - ${item.endTime}</p>
                    <h3>${item.title}</h3>
                    <p class="speakers">Speakers: <span>${item.speakers.join(', ')}</span></p>
                    <p>${item.description}</p>
                    <p class="categories">Categories: ${item.category.map(cat => `<span>${cat}</span>`).join('')}</p>
                `;
            } else if (item.type === 'break') {
                itemElement.innerHTML = `
                    <p class="time">${item.startTime} - ${item.endTime}</p>
                    <h3>${item.title}</h3>
                `;
            } else if (item.type === 'transition') {
                itemElement.innerHTML = `
                    <p class="time">${item.startTime} - ${item.endTime}</p>
                    <p>${item.description}</p>
                `;
            }
            scheduleContainer.appendChild(itemElement);
        });
    };

    categorySearchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        if (!searchTerm) {
            renderSchedule(allScheduleData); // Show all if search term is empty
            return;
        }

        const filteredSchedule = allScheduleData.filter(item => {
            if (item.type === 'talk' && item.category) {
                return item.category.some(cat => cat.toLowerCase().includes(searchTerm));
            }
            return false; // Don't filter breaks or transitions
        });
        renderSchedule(filteredSchedule);
    });


    // Initial fetch of the schedule
    fetchSchedule();
});
