// helper API functions (uses import.meta.env.VITE_...)
// Handles missing keys gracefully and provides fallbacks.

export async function geocodeCity(city) {
  if (!city) return null;
  const key = import.meta.env.VITE_OPENWEATHER_KEY;
  if (!key) return null;
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${key}`;
  try {
    const r = await fetch(url);
    const j = await r.json();
    if (Array.isArray(j) && j.length > 0) {
      return { lat: j[0].lat, lon: j[0].lon, name: j[0].name + (j[0].country ? ', ' + j[0].country : '') };
    }
    return null;
  } catch (e) { console.warn("geocode failed", e); return null; }
}

export async function fetchWeatherByCity(city) {
  try {
    const geo = await geocodeCity(city);
    if (!geo) return null;
    const key = import.meta.env.VITE_OPENWEATHER_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${geo.lat}&lon=${geo.lon}&units=metric&appid=${key}`;
    const r = await fetch(url);
    const j = await r.json();
    return { temp: j.main.temp, desc: j.weather[0].description, name: geo.name };
  } catch (e) { console.warn("weather fetch failed", e); return null; }
}

export async function fetchNewsHeadline() {
  const key = import.meta.env.VITE_NEWSAPI_KEY;
  if (!key) return null;
  try {
    const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=1&apiKey=${key}`;
    const r = await fetch(url);
    const j = await r.json();
    return (j.articles && j.articles[0] && j.articles[0].title) ? j.articles[0].title : null;
  } catch (e) { console.warn("news fetch failed", e); return null; }
}

const fallbackExercises = [
  "Stand and stretch your neck for 2 minutes",
  "Walk around for 2 minutes",
  "Do 10 squats",
  "Shoulder rolls for 1 minute",
  "Deep breathing for 1 minute"
];

export async function fetchExerciseSuggestion() {
  const rapidKey = import.meta.env.VITE_RAPIDAPI_KEY;
  if (!rapidKey) {
    // fallback to local list
    return fallbackExercises[Math.floor(Math.random() * fallbackExercises.length)];
  }
  try {
    const res = await fetch("https://exercisedb.p.rapidapi.com/exercises?limit=1", {
      headers: {
        "X-RapidAPI-Key": rapidKey,
        "X-RapidAPI-Host": "exercisedb.p.rapidapi.com"
      }
    });
    const j = await res.json();
    if (Array.isArray(j) && j.length > 0 && j[0].name) return j[0].name;
  } catch (e) {
    console.warn("exercise fetch failed", e);
  }
  return fallbackExercises[Math.floor(Math.random() * fallbackExercises.length)];
}
