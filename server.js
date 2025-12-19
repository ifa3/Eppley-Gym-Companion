import express from 'express';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase 
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());
app.use(express.static(__dirname));

let cachedCoords = null;

async function getCoords() {
  if (cachedCoords) return cachedCoords;

  const key = process.env.OPENCAGE_KEY;
  const query = encodeURIComponent('Eppley Recreation Center, College Park, MD');
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${key}&limit=1`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch coordinates from OpenCage');
  }
  const data = await res.json();
  const first = data.results[0];
  if (!first) {
    throw new Error('No geocoding results');
  }

  cachedCoords = {
    lat: first.geometry.lat,
    lng: first.geometry.lng
  };

  return cachedCoords;
}



app.get('/api/crowd', async (req, res) => {
  try {
    const { date, hour } = req.query;
    if (!date || hour === undefined) {
      return res.status(400).json({ error: 'date and hour required' });
    }

    const { data, error } = await supabase
      .from('crowd_levels')
      .select('*')
      .eq('date', date)
      .eq('hour', parseInt(hour, 10))
      .maybeSingle();

    if (error) throw error;

    const result = data || { date, hour: parseInt(hour, 10), level: 'Moderate' };
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load crowd level' });
  }
});

// Crowd
app.post('/api/crowd', async (req, res) => {
  try {
    const { date, hour, level } = req.body;
    if (!date || hour === undefined || !level) {
      return res.status(400).json({ error: 'date, hour, level required' });
    }

    const { data, error } = await supabase
      .from('crowd_levels')
      .upsert(
        { date, hour: parseInt(hour, 10), level },
        { onConflict: 'date,hour' }
      )
      .select()
      .maybeSingle();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save crowd level' });
  }
});

// UID entry
app.get('/api/uid-entry', async (req, res) => {
  try {
    const { device_id, semester } = req.query;
    if (!device_id || !semester) {
      return res.status(400).json({ error: 'device_id and semester required' });
    }

    const { data, error } = await supabase
      .from('uid_entries')
      .select('*')
      .eq('device_id', device_id)
      .eq('semester', semester)
      .maybeSingle();

    if (error) throw error;

    const result =
      data || {
        device_id,
        semester,
        used_one_time_entry: false
      };

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load UID entry' });
  }
});

app.post('/api/uid-entry', async (req, res) => {
  try {
    const { device_id, semester, used_one_time_entry } = req.body;
    if (!device_id || !semester || used_one_time_entry === undefined) {
      return res
        .status(400)
        .json({ error: 'device_id, semester, used_one_time_entry required' });
    }

    const { data, error } = await supabase
      .from('uid_entries')
      .upsert(
        {
          device_id,
          semester,
          used_one_time_entry,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'device_id,semester' }
      )
      .select()
      .maybeSingle();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save UID entry' });
  }
});

// Hours
app.get('/api/hours', async (_req, res) => {
  try {
    const sample = [
      { day_of_week: 'Monday–Thursday', open_time: '6:00 AM', close_time: '11:00 PM' },
      { day_of_week: 'Friday', open_time: '6:00 AM', close_time: '10:00 PM' },
      { day_of_week: 'Saturday', open_time: '8:00 AM', close_time: '10:00 PM' },
      { day_of_week: 'Sunday', open_time: '8:00 AM', close_time: '11:00 PM' }
    ];

    res.json(sample);
  } catch (err) {
    console.error('Hours error:', err);
    res.status(500).json({ error: 'Failed to load hours' });
  }
});

// Api for the weather
app.get('/api/weather', async (_req, res) => {
  try {
    const { lat, lng } = await getCoords();
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,apparent_temperature,weather_code`;

    const wRes = await fetch(url);
    if (!wRes.ok) {
      throw new Error('Failed to fetch weather from Open-Meteo');
    }

    const wData = await wRes.json();
    const current = wData.current || {};

    res.json({
      location: 'Eppley Recreation Center, College Park, MD',
      latitude: lat,
      longitude: lng,
      temperature: current.temperature_2m,
      apparent_temperature: current.apparent_temperature,
      weather_code: current.weather_code,
      time: current.time
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load weather' });
  }
});

// Root route for index.html
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
