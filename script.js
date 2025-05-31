// script.js
let remainingSeconds = 0;
let intervalId = null;
let isRunning = false;
let templates = JSON.parse(localStorage.getItem('timerTemplates')) || [];

const display = document.getElementById('timer-display');
const hoursInput = document.getElementById('hours');
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');
const templateNameInput = document.getElementById('template-name');
const templatesDiv = document.getElementById('templates');

const formatTime = (sec) => {
  const h = String(Math.floor(sec / 3600)).padStart(2, '0');
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const updateDisplay = () => {
  display.textContent = formatTime(remainingSeconds);
};

const createAlarmSound = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

  oscillator.start();

  setTimeout(() => {
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, 500);
};

const startTimer = () => {
  if (!isRunning) {
    if (remainingSeconds === 0) {
      const h = parseInt(hoursInput.value) || 0;
      const m = parseInt(minutesInput.value) || 0;
      const s = parseInt(secondsInput.value) || 0;
      remainingSeconds = h * 3600 + m * 60 + s;
    }
    if (remainingSeconds > 0) {
      isRunning = true;
      intervalId = setInterval(() => {
        remainingSeconds--;
        updateDisplay();
        if (remainingSeconds <= 0) {
          clearInterval(intervalId);
          isRunning = false;
          createAlarmSound();
          alert('時間になりました！');
        }
      }, 1000);
    }
  }
};

const pauseTimer = () => {
  clearInterval(intervalId);
  isRunning = false;
};

const resetTimer = () => {
  clearInterval(intervalId);
  isRunning = false;
  remainingSeconds = 0;
  updateDisplay();
};

const saveTemplate = () => {
  const name = templateNameInput.value.trim();
  if (name === '') {
    alert('テンプレート名を入力してください');
    return;
  }
  const h = parseInt(hoursInput.value) || 0;
  const m = parseInt(minutesInput.value) || 0;
  const s = parseInt(secondsInput.value) || 0;
  const template = {
    id: Date.now(),
    name,
    hours: h,
    minutes: m,
    seconds: s
  };
  templates.push(template);
  saveTemplatesToLocalStorage();
  renderTemplates();
  templateNameInput.value = '';
  alert('テンプレートを保存しました');
};

const deleteTemplate = (id) => {
  templates = templates.filter(t => t.id !== id);
  saveTemplatesToLocalStorage();
  renderTemplates();
};

const saveTemplatesToLocalStorage = () => {
  localStorage.setItem('timerTemplates', JSON.stringify(templates));
};

const selectTemplate = (template) => {
  hoursInput.value = template.hours;
  minutesInput.value = template.minutes;
  secondsInput.value = template.seconds;
  resetTimer();
};

const renderTemplates = () => {
  templatesDiv.innerHTML = '';
  templates.forEach(template => {
    const div = document.createElement('div');
    div.className = 'template-item';
    div.innerHTML = `
      <strong>${template.name}</strong><br/>
      ${formatTime(template.hours * 3600 + template.minutes * 60 + template.seconds)}
      <span class="delete-btn" title="削除">🗑️</span>
    `;
    div.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTemplate(template.id);
    });
    div.addEventListener('click', () => selectTemplate(template));
    templatesDiv.appendChild(div);
  });
};

document.getElementById('start').addEventListener('click', startTimer);
document.getElementById('pause').addEventListener('click', pauseTimer);
document.getElementById('reset').addEventListener('click', resetTimer);
document.getElementById('save-template').addEventListener('click', saveTemplate);

updateDisplay();
renderTemplates();
