async function fetchJson(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

// I tried to use the NewYork time
function getCrowdDescriptionForHour(hour) {
  if (hour >= 6 && hour < 9) return 'Nice and quiet (demo).';
  if (hour >= 9 && hour < 12) return 'Moderately busy (demo).';
  if (hour >= 12 && hour < 16) return 'Peak hours – expect crowds (demo).';
  if (hour >= 16 && hour < 19) return 'Still busy but easing off (demo).';
  if (hour >= 19 && hour < 22) return 'Moderate traffic (demo).';
  return 'Light traffic (demo).';
}

async function loadCrowd() {
  // and this is the time zome
  const now = new Date();
  const nyTimeString = now.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    hour12: false
  });
  const nyHour = parseInt(nyTimeString.split(', ')[1].split(':')[0], 10);

  const date = now.toISOString().slice(0, 10);
  const textEl = document.getElementById('crowd-text');
  const badgeEl = document.getElementById('crowd-badge');

  try {
    const data = await fetchJson(`/api/crowd?date=${date}&hour=${nyHour}`);
    const level = (data.level || 'Moderate').toLowerCase();
    const description = getCrowdDescriptionForHour(nyHour);

    textEl.textContent = `At ${nyHour
      .toString()
      .padStart(2, '0')}:00 (New York time), current crowd level (demo) is ${
      data.level || 'Moderate'
    }. ${description}`;

    badgeEl.innerHTML = '';
    const badge = document.createElement('span');
    badge.classList.add('badge');
    if (level === 'low') badge.classList.add('low');
    else if (level === 'high') badge.classList.add('high');
    else badge.classList.add('moderate');
    badge.textContent = (data.level || 'Moderate') + ' (demo)';
    badgeEl.appendChild(badge);
  } catch (err) {
    console.error(err);
    const description = getCrowdDescriptionForHour(nyHour);
    textEl.textContent = `At ${nyHour
      .toString()
      .padStart(2, '0')}:00 (New York time), current crowd level (demo) is Moderate. ${description}`;
    badgeEl.innerHTML = '';
    const badge = document.createElement('span');
    badge.classList.add('badge', 'moderate');
    badge.textContent = 'Moderate (demo)';
    badgeEl.appendChild(badge);
  }
}

async function loadHours() {
  try {
    const data = await fetchJson('/api/hours');
    const today = new Date().getDay(); 
    const container = document.getElementById('hours-today');

    let label = '';
    if (today >= 1 && today <= 4) label = 'Monday–Thursday';
    else if (today === 5) label = 'Friday';
    else if (today === 6) label = 'Saturday';
    else label = 'Sunday';

    const match =
      data.find((row) => row.day_of_week === label) || data[0];

    container.textContent = `${match.day_of_week}: ${match.open_time} – ${match.close_time} (sample)`;
  } catch (err) {
    console.error(err);
    document.getElementById('hours-today').textContent =
      '6:00 AM – 11:00 PM (sample).';
  }
}

async function loadWeather() {
  try {
    const data = await fetchJson('/api/weather');
    const container = document.getElementById('weather');
    container.textContent = `Location (demo): ${
      data.location
    }. Temperature: ${data.temperature}°C, feels like ${
      data.apparent_temperature
    }°C (code ${data.weather_code}).`;
  } catch (err) {
    console.error('Weather error:', err);
    document.getElementById('weather').textContent =
      'Could not load weather (demo).';
  }
}

function renderSampleChart() {
  const ctx = document.getElementById('crowdChart');
  const labels = ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'];
  const sample = [20, 40, 70, 85, 60, 35];

  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Sample crowd index (demo)',
          data: sample,
          borderColor: '#e21833',
          backgroundColor: 'rgba(226, 24, 51, 0.2)',
          tension: 0.3
        }
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 100
        }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadCrowd();
  loadHours();
  loadWeather();
  renderSampleChart();
});
