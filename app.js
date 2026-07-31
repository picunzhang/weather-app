'use strict';

/* ========================================
   配置常量
   ======================================== */
const REFRESH_INTERVAL = 60 * 60 * 1000; // 每小时更新一次
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

// 默认位置：上海
const DEFAULT_LOCATION = {
    lat: 31.2304,
    lon: 121.4737,
    city: '上海',
    country: 'China',
    region: 'Shanghai'
};

/* ========================================
   WMO 天气代码映射
   ======================================== */
const WMO_CODES = {
    0:  { label: '晴朗',       icon: '☀️',  theme: 'clear' },
    1:  { label: '主要晴朗',    icon: '🌤️', theme: 'clear' },
    2:  { label: '局部多云',    icon: '⛅',  theme: 'cloudy' },
    3:  { label: '阴天',       icon: '☁️',  theme: 'cloudy' },
    45: { label: '雾',         icon: '🌫️', theme: 'fog' },
    48: { label: '雾凇',       icon: '🌫️', theme: 'fog' },
    51: { label: '小毛毛雨',    icon: '🌦️', theme: 'rain' },
    53: { label: '中毛毛雨',    icon: '🌦️', theme: 'rain' },
    55: { label: '大毛毛雨',    icon: '🌧️', theme: 'rain' },
    56: { label: '冻毛毛雨',    icon: '🌧️', theme: 'rain' },
    57: { label: '冻毛毛雨',    icon: '🌧️', theme: 'rain' },
    61: { label: '小雨',       icon: '🌧️', theme: 'rain' },
    63: { label: '中雨',       icon: '🌧️', theme: 'rain' },
    65: { label: '大雨',       icon: '🌧️', theme: 'rain' },
    66: { label: '冻雨',       icon: '🌧️', theme: 'rain' },
    67: { label: '冻雨',       icon: '🌧️', theme: 'rain' },
    71: { label: '小雪',       icon: '🌨️', theme: 'snow' },
    73: { label: '中雪',       icon: '🌨️', theme: 'snow' },
    75: { label: '大雪',       icon: '❄️', theme: 'snow' },
    77: { label: '雪粒',       icon: '🌨️', theme: 'snow' },
    80: { label: '小阵雨',     icon: '🌦️', theme: 'rain' },
    81: { label: '中阵雨',     icon: '🌧️', theme: 'rain' },
    82: { label: '大阵雨',     icon: '⛈️', theme: 'rain' },
    85: { label: '小阵雪',     icon: '🌨️', theme: 'snow' },
    86: { label: '大阵雪',     icon: '❄️', theme: 'snow' },
    95: { label: '雷暴',       icon: '⛈️', theme: 'thunder' },
    96: { label: '雷暴伴冰雹',  icon: '⛈️', theme: 'thunder' },
    99: { label: '雷暴伴大冰雹', icon: '⛈️', theme: 'thunder' },
};

/* ========================================
   工具函数
   ======================================== */
function getWeatherInfo(code) {
    return WMO_CODES[code] || { label: '未知', icon: '❓', theme: 'cloudy' };
}

function windDirText(deg) {
    const dirs = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
    return dirs[Math.round(deg / 45) % 8];
}

function uvLevel(uv) {
    if (uv <= 2) return '低';
    if (uv <= 5) return '中等';
    if (uv <= 7) return '高';
    if (uv <= 10) return '很高';
    return '极高';
}

function formatTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatHour(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDay(dateStr, index) {
    if (index === 0) return '今天';
    const d = new Date(dateStr);
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return dayNames[d.getDay()];
}

function formatDateShort(dateStr) {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
}

function showToast(msg) {
    const toast = document.getElementById('errorToast');
    document.getElementById('errorText').textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 5000);
}

/* ========================================
   获取天气数据 (Open-Meteo)
   ======================================== */
async function getWeather(lat, lon) {
    const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure',
        hourly: 'temperature_2m,weather_code,precipitation_probability,wind_speed_10m',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,wind_speed_10m_max,uv_index_max',
        timezone: 'auto',
        forecast_days: '7'
    });

    const resp = await fetch(`${WEATHER_API}?${params}`);
    if (!resp.ok) throw new Error(`天气API请求失败: ${resp.status}`);
    return resp.json();
}

/* ========================================
   渲染：当前天气
   ======================================== */
function renderCurrent(data, location) {
    const c = data.current;
    const info = getWeatherInfo(c.weather_code);
    const isDay = c.is_day === 1;

    // 背景主题
    const themeName = isDay ? `${info.theme}-day` : `${info.theme}-night`;
    document.getElementById('bgLayer').className = `bg-layer theme-${themeName}`;

    // 位置
    document.getElementById('locationName').textContent = location.city;
    document.getElementById('locationMeta').textContent = `${location.region}, ${location.country}`;

    // 温度
    document.getElementById('currentTemp').textContent = Math.round(c.temperature_2m);
    document.getElementById('feelsLike').textContent = Math.round(c.apparent_temperature);
    document.getElementById('heroIcon').textContent = info.icon;
    document.getElementById('weatherLabel').textContent = info.label;

    // 详细数据
    document.getElementById('humidity').textContent = c.relative_humidity_2m + '%';
    document.getElementById('windSpeed').textContent = Math.round(c.wind_speed_10m);
    document.getElementById('windDir').textContent = windDirText(c.wind_direction_10m);
    document.getElementById('pressure').textContent = Math.round(c.surface_pressure);
    document.getElementById('precip').textContent = c.precipitation.toFixed(1);

    // UV 指数
    const todayUV = data.daily.uv_index_max?.[0];
    document.getElementById('uvIndex').textContent = todayUV ? `${todayUV.toFixed(1)} ${uvLevel(todayUV)}` : '—';

    // 日出日落
    const sunrise = data.daily.sunrise?.[0];
    const sunset = data.daily.sunset?.[0];
    document.getElementById('sunrise').textContent = sunrise ? formatTime(sunrise) : '--:--';
    document.getElementById('sunset').textContent = sunset ? formatTime(sunset) : '--:--';

    // 太阳位置弧线
    updateSunArc(sunrise, sunset);
}

/* ========================================
   渲染：逐小时预报
   ======================================== */
function renderHourly(data) {
    const track = document.getElementById('hourlyTrack');
    track.innerHTML = '';

    const now = new Date();
    const hourly = data.hourly;
    const times = hourly.time;
    const temps = hourly.temperature_2m;
    const codes = hourly.weather_code;
    const precipProb = hourly.precipitation_probability;

    let startIdx = 0;
    for (let i = 0; i < times.length; i++) {
        const t = new Date(times[i]);
        if (t >= now) {
            startIdx = i > 0 ? i - 1 : 0;
            break;
        }
    }

    const count = Math.min(24, times.length - startIdx);
    for (let i = 0; i < count; i++) {
        const idx = startIdx + i;
        const info = getWeatherInfo(codes[idx]);
        const card = document.createElement('div');
        card.className = 'hour-card' + (i === 0 ? ' now' : '');

        const timeLabel = i === 0 ? '现在' : formatHour(times[idx]);
        const precip = precipProb[idx] || 0;

        card.innerHTML = `
            <span class="hour-time">${timeLabel}</span>
            <span class="hour-icon">${info.icon}</span>
            <span class="hour-temp">${Math.round(temps[idx])}°</span>
            <span class="hour-precip ${precip < 10 ? 'zero' : ''}">${precip >= 10 ? precip + '%' : '0%'}</span>
        `;
        track.appendChild(card);
    }
}

/* ========================================
   渲染：七天预报
   ======================================== */
function renderDaily(data) {
    const grid = document.getElementById('dailyGrid');
    grid.innerHTML = '';

    const daily = data.daily;
    const times = daily.time;
    const maxTemps = daily.temperature_2m_max;
    const minTemps = daily.temperature_2m_min;
    const codes = daily.weather_code;
    const precipMax = daily.precipitation_probability_max || [];

    const weekMin = Math.min(...minTemps);
    const weekMax = Math.max(...maxTemps);
    const range = weekMax - weekMin || 1;

    for (let i = 0; i < times.length; i++) {
        const info = getWeatherInfo(codes[i]);
        const dayName = formatDay(times[i], i);
        const dateStr = formatDateShort(times[i]);
        const precip = precipMax[i] || 0;

        const minPct = ((minTemps[i] - weekMin) / range) * 100;
        const maxPct = ((maxTemps[i] - weekMin) / range) * 100;
        const barLeft = minPct;
        const barWidth = maxPct - minPct;

        const card = document.createElement('div');
        card.className = 'daily-card';
        card.innerHTML = `
            <div>
                <div class="daily-day">${dayName}</div>
                <div class="daily-day-sub">${dateStr}</div>
            </div>
            <div class="daily-icon">${info.icon}</div>
            <div class="daily-range">
                <span class="daily-min">${Math.round(minTemps[i])}°</span>
                <div class="daily-bar">
                    <div class="daily-bar-fill" style="left: ${barLeft}%; width: ${barWidth}%"></div>
                </div>
                <span class="daily-max">${Math.round(maxTemps[i])}°</span>
            </div>
            <div class="daily-precip ${precip < 10 ? 'zero' : ''}">${precip >= 10 ? precip + '%' : '—'}</div>
        `;
        grid.appendChild(card);
    }
}

/* ========================================
   太阳弧线位置（静态计算一次）
   ======================================== */
function updateSunArc(sunriseStr, sunsetStr) {
    const sunEl = document.getElementById('sunPosition');
    if (!sunriseStr || !sunsetStr) {
        sunEl.setAttribute('opacity', '0');
        return;
    }

    const sunrise = new Date(sunriseStr).getTime();
    const sunset = new Date(sunsetStr).getTime();
    const now = Date.now();

    if (now < sunrise || now > sunset) {
        sunEl.setAttribute('opacity', '0');
        return;
    }

    sunEl.setAttribute('opacity', '1');
    const progress = (now - sunrise) / (sunset - sunrise);

    const t = progress;
    const x = (1 - t) * (1 - t) * 20 + 2 * (1 - t) * t * 150 + t * t * 280;
    const y = (1 - t) * (1 - t) * 90 + 2 * (1 - t) * t * (-20) + t * t * 90;
    sunEl.setAttribute('cx', x.toFixed(1));
    sunEl.setAttribute('cy', y.toFixed(1));
}

/* ========================================
   时钟（静态显示加载时的时间）
   ======================================== */
function setClock() {
    const now = new Date();
    document.getElementById('clock').textContent = now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

/* ========================================
   主流程
   ======================================== */
let lastRefreshTime = 0;

async function init() {
    try {
        const location = DEFAULT_LOCATION;
        const weather = await getWeather(location.lat, location.lon);

        renderCurrent(weather, location);
        renderHourly(weather);
        renderDaily(weather);

        document.getElementById('loader').classList.add('hide');
        document.getElementById('container').style.display = '';

        setClock();
        lastRefreshTime = Date.now();
        updateLastRefresh();

    } catch (err) {
        console.error('初始化失败:', err);
        document.getElementById('loader').classList.add('hide');
        document.getElementById('container').style.display = '';
        setClock();
        showToast('获取天气数据失败: ' + err.message);
    }
}

async function refresh() {
    try {
        const location = DEFAULT_LOCATION;
        const weather = await getWeather(location.lat, location.lon);
        renderCurrent(weather, location);
        renderHourly(weather);
        renderDaily(weather);
        updateLastRefresh();
        lastRefreshTime = Date.now();
    } catch (err) {
        console.error('刷新失败:', err);
    }
}

function updateLastRefresh() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
    document.getElementById('lastUpdate').textContent = `已更新 ${timeStr}`;
}

/* ========================================
   启动 & 每小时刷新（无视觉动画）
   ======================================== */
// 天气数据每小时刷新一次（静默后台刷新，无动画）
setInterval(refresh, REFRESH_INTERVAL);

// 页面重新可见时检查是否需要刷新
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && lastRefreshTime > 0) {
        const elapsed = Date.now() - lastRefreshTime;
        if (elapsed >= REFRESH_INTERVAL) {
            refresh();
        }
    }
});

// 启动
init();
