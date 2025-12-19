const SEMESTER_LABEL = 'Fall 2025';

function getOrCreateDeviceId() {
  let id = localStorage.getItem('egc_device_id');
  if (!id) {
    id = `dev-${crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)}`;
    localStorage.setItem('egc_device_id', id);
  }
  return id;
}

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

async function loadUidStatus() {
  const deviceId = getOrCreateDeviceId();
  const url = `/api/uid-entry?device_id=${encodeURIComponent(
    deviceId
  )}&semester=${encodeURIComponent(SEMESTER_LABEL)}`;

  try {
    const data = await fetchJson(url);
    const statusEl = document.getElementById('uid-status');
    const buttonEl = document.getElementById('uid-button');

    if (data.used_one_time_entry) {
      statusEl.textContent =
        'You have already marked your one-time UID entry as used this semester (demo).';
      buttonEl.disabled = true;
    } else {
      statusEl.textContent =
        'You have not marked your one-time UID entry as used yet (demo).';
      buttonEl.disabled = false;
    }

    document.getElementById('uid-message').textContent = '';
  } catch (err) {
    console.error(err);
    document.getElementById('uid-status').textContent =
      'Showing default UID entry status (demo).';
  }
}

async function markUidUsed() {
  const deviceId = getOrCreateDeviceId();
  const uidInput = document.getElementById('uid-input');
  const uidValue = uidInput.value.trim();

  if (!/^[0-9]+$/.test(uidValue)) {
    document.getElementById('uid-message').textContent =
      'Please enter your UID using numbers only (demo).';
    return;
  }

  try {
    await fetchJson('/api/uid-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_id: deviceId,
        semester: SEMESTER_LABEL,
        used_one_time_entry: true
      })
    });

    document.getElementById('uid-message').textContent =
      'Thanks (demo): your one-time UID entry is now marked as used for this semester.';
    await loadUidStatus();
  } catch (err) {
    console.error(err);
    document.getElementById('uid-message').textContent =
      'Could not save UID entry (demo).';
  }
}

async function saveSampleCrowd() {
  const now = new Date();
  const nyTimeString = now.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    hour12: false
  });
  const nyHour = parseInt(nyTimeString.split(', ')[1].split(':')[0], 10);
  const date = now.toISOString().slice(0, 10);
  const level = document.getElementById('crowd-level-select').value;

  try {
    await fetchJson('/api/crowd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, hour: nyHour, level })
    });

    document.getElementById('crowd-update-message').textContent =
      'Thanks for the feedback (demo): crowd level for this hour has been saved. Reload the home page to see it.';
  } catch (err) {
    console.error(err);
    document.getElementById('crowd-update-message').textContent =
      'Could not save crowd level (demo).';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadUidStatus();

  document.getElementById('uid-button').addEventListener('click', markUidUsed);
  document
    .getElementById('crowd-update-button')
    .addEventListener('click', saveSampleCrowd);
});
