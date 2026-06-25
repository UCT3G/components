<template>
  <div class="calendar-page-wrapper" :class="[`calendar-size-${size}`, { 'no-sidebar': !showSidebar, 'no-weekly-view': !showWeeklyView }]" :style="{ height }">
    <!-- SECCIÓN IZQUIERDA: CALENDARIO SELECTOR -->
    <aside v-if="showSidebar" class="calendar-sidebar">
      <div class="sidebar-header">
        <slot name="sidebar-header">
          <h3>
            <span class="sidebar-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" class="calendar-icon-svg"><path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM1 3.857C1 3.229 1.744 3 2.75 3h10.5c1.006 0 1.75.229 1.75.857v10.286c0 .628-.744.857-1.75.857H2.75C1.744 15 1 14.771 1 14.143V3.857z"/><path d="M2 7h12V6H2v1zm0 3h12V9H2v1zm0 3h12v-1H2v1z"/></svg>
            </span>
            Agenda
          </h3>
          <p>Navega el mes para ver el cronograma</p>
        </slot>
      </div>

      <header class="mini-calendar-header">
        <div class="calendar-nav-controls">
          <button class="nav-btn month-prev" @click="changeMonth(-1)" title="Mes anterior">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>
          </button>
          
          <div class="current-selection">
            <span class="month-name">{{ currentMonthName }}</span>
            <div class="year-selector">
              <button class="year-nav" @click="changeYear(-1)" title="Año anterior">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16"><path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"/></svg>
              </button>
              <span class="year-val">{{ currentYear }}</span>
              <button class="year-nav" @click="changeYear(1)" title="Siguiente año">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16"><path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg>
              </button>
            </div>
          </div>

          <button class="nav-btn month-next" @click="changeMonth(1)" title="Siguiente mes">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>
          </button>
        </div>
      </header>

      <div class="mini-calendar-grid">
        <div v-for="day in weekDaysShort" :key="day" class="weekday">{{ day }}</div>
        <div v-for="blank in blankDays" :key="'blank-'+blank" class="day empty"></div>
        <div v-for="date in daysInMonth" :key="date.dateString" class="day" :class="{ 'today': date.isToday, 'selected': isSelected(date), 'in-selected-week': isInSelectedWeek(date), 'has-content': date.events.length > 0 }" @click="selectDate(date)">
          <span class="day-num">{{ date.dayNumber }}</span>
          <div v-if="date.events.length > 0" class="content-indicator"><span class="dot"></span></div>
        </div>
      </div>

      <button v-if="showTodayButton" class="btn-today" @click="goToToday">Ir a Hoy</button>
      <div class="sidebar-bottom-slot"><slot name="sidebar-bottom"></slot></div>
    </aside>

    <!-- SECCIÓN DERECHA: CRONOGRAMA POR COLUMNAS -->
    <main v-if="showWeeklyView" class="calendar-content">
      <header class="content-header">
        <div class="selected-date-info">
          <h4>{{ weekRangeLabel }}</h4>
          <p>{{ postsForSelectedWeek.length }} evento(s) para esta semana</p>
        </div>
        <div v-if="showSearch" class="search-mini">
          <span class="search-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>
          </span>
          <input type="text" v-model="searchQuery" placeholder="Filtrar en esta semana...">
        </div>
      </header>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Sincronizando agenda...</p>
      </div>

      <div v-else class="weekly-schedule-grid">
        <!-- COLUMNAS PARA CADA DÍA DE LA SEMANA -->
        <div v-for="day in fullWeekDays" :key="day.dayIndex" class="day-column" :class="{ 'is-today': day.isToday, 'is-selected-day': isSameDate(day.dateObj, selectedDay) }" :ref="el => setDayRef(el, day.dayIndex)">
          <div class="day-column-header">
            <span class="day-name">{{ day.name }}</span>
            <span class="day-number">{{ day.number }}</span>
          </div>

          <div class="day-column-content">
            <div v-if="day.posts.length === 0" class="no-posts-small">
              <slot name="no-events-day" :day="day">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16" class="no-events-svg"><path d="M6.146 7.146a.5.5 0 0 1 .708 0L8 8.293l1.146-1.147a.5.5 0 1 1 .708.708L8.707 9l1.147 1.146a.5.5 0 0 1-.708.708L8 9.707l-1.146 1.147a.5.5 0 0 1-.708-.708L7.293 9 6.146 7.854a.5.5 0 0 1 0-.708z"/><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/></svg>
              </slot>
            </div>

            <div v-for="post in day.posts" :key="getEventId(post)" class="schedule-card" :class="[getEventTypeClass(post)]" @click="handleCardClick(post)">
              <slot name="event-card" :event="post" :getImageUrl="getImageUrl" :formatTime="formatTime" :truncateText="truncateText" :title="getEventTitle(post)" :description="getEventDescription(post)" :category="getEventCategory(post)" :image="getEventImage(post)" :status="getEventStatus(post)">
                <div class="card-mini-img" v-if="getEventImage(post)">
                  <img :src="getImageUrl(getEventImage(post))" :alt="getEventTitle(post)">
                  <div class="mini-status" :class="'st-' + getEventStatus(post)"></div>
                </div>
                <div class="card-mini-body">
                  <span class="card-time">{{ formatTime(getEventDate(post)) }}</span>
                  <h6 :title="getEventTitle(post)">{{ truncateText(getEventTitle(post), 35) }}</h6>
                  <span class="card-cat">{{ getEventCategory(post) }}</span>
                </div>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import axiosInstance from '@/../axios-config.js';

const props = defineProps({
  height: { type: String, default: 'calc(100vh - 140px)' },
  events: { type: Array, default: null },
  loading: { type: Boolean, default: false },
  loadDataOnInit: { type: Boolean, default: false },
  showSidebar: { type: Boolean, default: true },
  showWeeklyView: { type: Boolean, default: true },
  showSearch: { type: Boolean, default: true },
  showTodayButton: { type: Boolean, default: true },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  weekStart: { type: String, default: 'sunday', validator: (v) => ['sunday', 'monday'].includes(v) },
  selectedDate: { type: [Date, String], default: null },
  titleKey: { type: String, default: 'titulo' },
  descriptionKey: { type: String, default: 'descripcion' },
  dateKey: { type: String, default: 'fecha' },
  imageKey: { type: String, default: 'ruta_imagen' },
  statusKey: { type: String, default: 'estado' },
  typeKey: { type: String, default: 'id_tipo_comunicados_fk' },
  categoryKey: { type: String, default: 'tipo_titulo' },
  baseUrl: { type: String, default: '' }
});

const emit = defineEmits(['select-date', 'change-month', 'change-year', 'click-event', 'go-to-today']);

let store = null;
try { store = useStore(); } catch (e) {}

const currentDate = ref(props.selectedDate ? new Date(props.selectedDate) : new Date());
const selectedDay = ref(props.selectedDate ? new Date(props.selectedDate) : new Date());
const searchQuery = ref('');
const internalLoading = ref(false);
const dayColumnRefs = ref({});

const setDayRef = (el, index) => { if (el) dayColumnRefs.value[index] = el; };

watch(selectedDay, (newVal) => {
  let dayOfWeek = newVal.getDay();
  if (props.weekStart === 'monday') dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  setTimeout(() => {
    const el = dayColumnRefs.value[dayOfWeek];
    if (el && window.innerWidth <= 1100) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, 100);
});

watch(() => props.selectedDate, (newVal) => {
  if (newVal) {
    const d = new Date(newVal);
    selectedDay.value = d;
    currentDate.value = d;
  }
});

const isLoading = computed(() => props.loading || internalLoading.value);

const getEventDate = (ev) => ev ? new Date(ev[props.dateKey] || ev.fecha_programada || ev.fecha_publicacion || ev.fecha) : null;
const getEventTitle = (ev) => ev ? (ev[props.titleKey] || ev.titulo || '') : '';
const getEventDescription = (ev) => ev ? (ev[props.descriptionKey] || ev.descripcion || '') : '';
const getEventImage = (ev) => ev ? (ev[props.imageKey] || ev.ruta_imagen || '') : '';
const getEventStatus = (ev) => ev ? (ev[props.statusKey] || ev.estado || 1) : 1;
const getEventType = (ev) => ev ? (ev[props.typeKey] || ev.id_tipo_comunicados_fk || '') : '';
const getEventCategory = (ev) => ev ? (ev[props.categoryKey] || ev.tipo_titulo || '') : '';
const getEventId = (ev) => ev ? (ev.id_comunicado || ev.id || Math.random().toString(36).substring(2, 9)) : '';

const posts = computed(() => {
  if (props.events !== null) return props.events;
  if (store?.state?.PanelComunicacionADM) return store.state.PanelComunicacionADM.calendarPosts || [];
  return [];
});

const weekDaysShort = computed(() => props.weekStart === 'monday' ? ['L', 'M', 'X', 'J', 'V', 'S', 'D'] : ['D', 'L', 'M', 'X', 'J', 'V', 'S']);
const weekDayNames = computed(() => props.weekStart === 'monday' ? ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] : ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']);
const currentMonthName = computed(() => currentDate.value.toLocaleString('es-ES', { month: 'long' }));
const currentYear = computed(() => currentDate.value.getFullYear());

const daysInMonth = computed(() => {
  const y = currentDate.value.getFullYear(), m = currentDate.value.getMonth();
  return Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => {
    const d = new Date(y, m, i + 1);
    return {
      dayNumber: i + 1,
      dateObj: d,
      dateString: d.toISOString().split('T')[0],
      isToday: isSameDate(d, new Date()),
      events: posts.value.filter(p => isSameDate(getEventDate(p), d))
    };
  });
});

const blankDays = computed(() => {
  const y = currentDate.value.getFullYear(), m = currentDate.value.getMonth();
  const firstDay = new Date(y, m, 1).getDay();
  return props.weekStart === 'monday' ? (firstDay === 0 ? 6 : firstDay - 1) : firstDay;
});

const weekRange = computed(() => {
  const d = new Date(selectedDay.value);
  let offset = d.getDay();
  if (props.weekStart === 'monday') offset = offset === 0 ? 6 : offset - 1;
  const start = new Date(d.setDate(d.getDate() - offset));
  start.setHours(0,0,0,0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23,59,59,999);
  return { start, end };
});

const weekRangeLabel = computed(() => {
  const { start, end } = weekRange.value;
  const options = { day: 'numeric', month: 'long' };
  return `Semana del ${start.toLocaleDateString('es-ES', options)} al ${end.toLocaleDateString('es-ES', { ...options, year: 'numeric' })}`;
});

const postsForSelectedWeek = computed(() => {
  const { start, end } = weekRange.value;
  let result = posts.value.filter(post => {
    const evDate = getEventDate(post);
    return evDate && evDate >= start && evDate <= end;
  });
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(p => getEventTitle(p).toLowerCase().includes(q) || getEventDescription(p).toLowerCase().includes(q));
  }
  return result;
});

const fullWeekDays = computed(() => {
  const { start } = weekRange.value;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return createDayObject(d, i);
  });
});

const createDayObject = (date, index) => {
  const dayPosts = postsForSelectedWeek.value.filter(p => isSameDate(getEventDate(p), date));
  dayPosts.sort((a, b) => (getEventDate(a) || 0) - (getEventDate(b) || 0));
  return {
    name: weekDayNames.value[index],
    number: date.getDate(),
    dateObj: date,
    isToday: isSameDate(date, new Date()),
    posts: dayPosts,
    dayIndex: index
  };
};

const changeMonth = (dir) => {
  currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() + dir));
  emit('change-month', { date: currentDate.value, direction: dir });
};

const changeYear = (dir) => {
  currentDate.value = new Date(currentDate.value.setFullYear(currentDate.value.getFullYear() + dir));
  emit('change-year', { date: currentDate.value, direction: dir });
};

const goToToday = () => {
  const d = new Date();
  currentDate.value = d;
  selectedDay.value = d;
  emit('select-date', d);
  emit('go-to-today', d);
};

const selectDate = (date) => {
  selectedDay.value = date.dateObj;
  emit('select-date', date.dateObj);
};

const isSelected = (date) => isSameDate(date.dateObj, selectedDay.value);
const isInSelectedWeek = (date) => { const { start, end } = weekRange.value; return date.dateObj >= start && date.dateObj <= end; };
const isSameDate = (d1, d2) => d1 && d2 && d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

const getImageUrl = (path) => {
  if (!path) return 'https://placehold.co/400x300?text=Sin+Imagen';
  if (path.startsWith('http') || path.startsWith('data:image')) return path;
  let cleanPath = path.replace(/\\/g, '/');
  if (cleanPath.startsWith('data/')) {
    const base = props.baseUrl || axiosInstance.defaults.baseURL || '';
    return `${base.replace('/api/v1', '')}/media/${cleanPath.substring(5)}`;
  }
  return path;
};

const formatTime = (date) => date ? new Date(date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';
const truncateText = (txt, len) => txt && txt.length > len ? txt.substring(0, len) + '...' : txt;
const getEventTypeClass = (post) => (post.id_area_etiqueta_fk || post.area_id) ? 'type-border-area' : `type-border-${getEventType(post)}`;
const handleCardClick = (post) => emit('click-event', post);

onMounted(async () => {
  if (props.loadDataOnInit && store?.dispatch) {
    internalLoading.value = true;
    try { await store.dispatch('PanelComunicacionADM/obtenerPostsCalendario'); }
    catch (e) { console.error(e); }
    finally { internalLoading.value = false; }
  }
});
</script>

<style scoped>
.calendar-page-wrapper {
  --cal-sidebar-width: 285px;
  --cal-padding: 20px;
  --cal-gap: 25px;
  --cal-font-title: 18px;
  --cal-font-sub: 11px;
  --cal-font-month: 16px;
  --cal-font-day: 11px;
  --cal-btn-size: 42px;
  --cal-card-img-height: 75px;
  --cal-col-width: 145px;
  --cal-radius: 28px;
  --cal-sidebar-radius: 24px;
  --cal-search-width: 240px;
  --cal-grid-gap: 15px;
  display: flex;
  gap: var(--cal-gap);
  height: 100%;
  background: var(--babyBlue, #f8faff);
  padding: var(--cal-padding);
  border-radius: var(--cal-radius);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.03);
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow: hidden;
}
.calendar-page-wrapper.no-weekly-view .calendar-sidebar { width: 100%; max-width: 450px; margin: 0 auto; }
.calendar-page-wrapper.no-sidebar .calendar-content { flex: 1; }

/* SIZES OVERRIDES */
.calendar-size-sm {
  --cal-sidebar-width: 220px;
  --cal-padding: 10px;
  --cal-gap: 15px;
  --cal-font-title: 14px;
  --cal-font-sub: 10px;
  --cal-font-month: 13px;
  --cal-font-day: 10px;
  --cal-btn-size: 32px;
  --cal-card-img-height: 50px;
  --cal-col-width: 100px;
  --cal-radius: 16px;
  --cal-sidebar-radius: 16px;
  --cal-search-width: 180px;
  --cal-grid-gap: 8px;
}
.calendar-size-lg {
  --cal-sidebar-width: 350px;
  --cal-padding: 30px;
  --cal-gap: 35px;
  --cal-font-title: 22px;
  --cal-font-sub: 13px;
  --cal-font-month: 20px;
  --cal-font-day: 13px;
  --cal-btn-size: 50px;
  --cal-card-img-height: 100px;
  --cal-col-width: 180px;
  --cal-radius: 36px;
  --cal-sidebar-radius: 30px;
  --cal-search-width: 300px;
  --cal-grid-gap: 20px;
}

/* SIDEBAR STYLES */
.calendar-sidebar {
  width: var(--cal-sidebar-width);
  flex-shrink: 0;
  background: linear-gradient(180deg, var(--blueBerryPastel, #edf2ff) 0%, var(--bg-table, #ffffff) 100%);
  padding: var(--cal-padding);
  border-radius: var(--cal-sidebar-radius);
  display: flex;
  flex-direction: column;
  border: 3.5px solid var(--blueBerryGlass, rgba(99, 102, 241, 0.2));
  box-shadow: inset 0 0 40px rgba(255, 255, 255, 0.8), 0 10px 30px rgba(0,0,0,0.02);
}
.sidebar-header { margin-bottom: var(--cal-gap); }
.sidebar-header h3 {
  font-family: 'Outfit', sans-serif;
  font-size: var(--cal-font-title);
  font-weight: 700;
  color: var(--txttitulo, #1e293b);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.sidebar-icon-wrapper { display: inline-flex; align-items: center; color: var(--purple-sb, #6366f1); }
.calendar-icon-svg { fill: currentColor; }
.sidebar-header p { font-size: var(--cal-font-sub); color: var(--txt-secundary, #64748b); font-weight: 500; }

.mini-calendar-header {
  margin-bottom: 20px;
  background: linear-gradient(135deg, var(--bg-table, #ffffff) 0%, var(--babyBlue, #fdfcff) 100%);
  padding: 12px;
  border-radius: 20px;
  box-shadow: 0 10px 25px var(--blueBerryGlass, rgba(99, 102, 241, 0.08));
  border: 1px solid var(--blueBerryGlass, rgba(99, 102, 241, 0.1));
}
.calendar-nav-controls { display: flex; justify-content: space-between; align-items: center; gap: 15px; }
.current-selection { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
.month-name {
  font-family: 'Outfit', sans-serif;
  font-size: var(--cal-font-month);
  font-weight: 800;
  color: var(--txttitulo, #1e293b);
  text-transform: capitalize;
  letter-spacing: -0.3px;
}
.year-selector { display: flex; align-items: center; gap: 8px; background: var(--blueBerryGlass, rgba(99, 102, 241, 0.05)); padding: 2px 10px; border-radius: 20px; }
.year-val { font-size: 12px; font-weight: 700; color: var(--purple-sb, #6366f1); }
.year-nav { border: none; background: none; padding: 0; color: var(--txt-secundary, #94a3b8); cursor: pointer; font-size: 10px; display: flex; align-items: center; transition: all 0.2s; }
.year-nav:hover { color: var(--purple-sb, #6366f1); transform: scale(1.2); }

.nav-btn {
  width: var(--cal-btn-size);
  height: var(--cal-btn-size);
  border-radius: 14px;
  border: none;
  background: var(--bg-table, #ffffff);
  color: var(--purple-sb, #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px var(--blueBerryGlass, rgba(99, 102, 241, 0.1));
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  padding: 0;
}
.nav-btn svg { width: 18px; height: 18px; transition: transform 0.3s ease; }
.nav-btn:hover { background: var(--babyBlue, #f8faff); transform: translateY(-2px) scale(1.05); box-shadow: 0 8px 18px var(--blueBerryGlass, rgba(99, 102, 241, 0.18)); }
.nav-btn:hover svg { transform: scale(1.1); }
.nav-btn:active { transform: scale(0.95); }

.mini-calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 20px;
  padding: 6px;
  background: var(--bg-table, white);
  border-radius: 18px;
  border: 2.5px solid var(--blueBerryGlass, rgba(99, 102, 241, 0.1));
}
.weekday { text-align: center; font-size: 10px; font-weight: 700; color: var(--txt-secundary, #cbd5e1); padding: 10px 0; }
.day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: var(--cal-font-day);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  color: var(--txt-table, #475569);
}
.day:hover:not(.empty) { background: var(--babyBlue, #f1f5f9); color: var(--txttitulo, #1e293b); transform: scale(1.1); }
.day.today { color: var(--purple-sb, #6366f1); font-weight: 800; }
.day.in-selected-week { background: var(--blueBerryGlass, rgba(99, 102, 241, 0.06)); border-radius: 0; }
.day.in-selected-week:nth-child(7n+1) { border-top-left-radius: 10px; border-bottom-left-radius: 10px; }
.day.in-selected-week:nth-child(7n) { border-top-right-radius: 10px; border-bottom-right-radius: 10px; }
.day.selected {
  background: linear-gradient(135deg, var(--purple-sb, #6366f1) 0%, var(--bluelight-sb, #8b5cf6) 100%) !important;
  color: var(--txtlvl, white) !important;
  box-shadow: 0 6px 15px var(--blueBerryGlass, rgba(99, 102, 241, 0.35));
  border-radius: 10px !important;
  z-index: 2;
  transform: scale(1.1);
}
.day.has-content .content-indicator { position: absolute; bottom: 4px; width: 4px; height: 4px; background: var(--purple-tag, #10b981); border-radius: 50%; }
.day.selected.has-content .content-indicator { background: var(--txtlvl, white); }

.btn-today {
  width: 100%; 
  padding: 12px; 
  border-radius: 14px; 
  border: 1px solid var(--blueBerryGlass, #eef2ff);
  background: var(--bg-table, white); 
  color: var(--purple-sb, #4338ca); 
  font-weight: 800; 
  font-size: 12px; 
  cursor: pointer; 
  transition: all 0.25s;
  margin-top: auto;
  box-shadow: 0 4px 12px var(--blueBerryGlass, rgba(67, 56, 202, 0.05));
}
.btn-today:hover { background: var(--purple-sb, #6366f1); color: var(--txtlvl, white); border-color: var(--purple-sb, #6366f1); transform: translateY(-2px); box-shadow: 0 8px 20px var(--blueBerryGlass, rgba(67, 56, 202, 0.2)); }

/* CONTENT STYLES */
.calendar-content { flex: 1; display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding: 0 10px; }
.selected-date-info h4 {
  font-family: 'Outfit', sans-serif; 
  font-size: 22px; 
  font-weight: 800; 
  background: linear-gradient(90deg, var(--txttitulo, #1e293b) 0%, var(--txt-secundary, #475569) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-transform: capitalize; 
  margin: 0;
}
.selected-date-info p { font-size: 13px; color: var(--txt-secundary, #94a3b8); font-weight: 500; margin-top: 4px; }
.search-mini { position: relative; width: var(--cal-search-width); }
.search-icon-wrapper { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--txt-secundary, #94a3b8); font-size: 14px; display: flex; align-items: center; }
.search-mini input {
  width: 100%; padding: 11px 12px 11px 40px; border-radius: 16px; border: 1px solid var(--input, #f1f5f9); font-size: 12px; background: var(--input-bg, #f8fafc); outline: none; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); color: var(--input-txt, #1e293b); font-weight: 500;
}
.search-mini input:focus { border-color: var(--purple-sb, #6366f1); background: var(--bg-table, white); box-shadow: 0 4px 20px var(--blueBerryGlass, rgba(99, 102, 241, 0.08)); }

/* WEEKLY GRID COLUMNS */
.weekly-schedule-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: var(--cal-grid-gap); flex: 1; overflow-x: auto; overflow-y: hidden; padding: 15px 5px 15px; min-height: 0; }
.day-column { box-sizing: border-box; background: var(--bg-table, white); border-radius: 22px; display: flex; flex-direction: column; min-width: var(--cal-col-width); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid var(--input, #f1f5f9); box-shadow: 0 4px 15px rgba(0,0,0,0.01); height: 100%; overflow: hidden; }

.day-column:nth-child(1), .day-column:nth-child(7) { background: linear-gradient(180deg, var(--bg-table, #fdfaff) 0%, var(--blueBerryGlass, #f3ebff) 100%); border-color: var(--blueBerryGlass, #e9d5ff); border-width: 3.5px; }
.day-column:nth-child(n+2):nth-child(-n+6) { background: linear-gradient(180deg, var(--bg-table, #f4f9ff) 0%, var(--babyBlue_7, #e8f2ff) 100%); border-color: var(--babyBlue_7, #dbeafe); border-width: 4.5px; }

.day-column.is-today { background: linear-gradient(180deg, var(--babyBlue, #eef5ff) 0%, var(--babyBlue_7, #dbeafe) 100%) !important; border-color: var(--purple-sb, #6366f1) !important; border-width: 5px !important; box-shadow: 0 15px 35px var(--blueBerryGlass, rgba(99, 102, 241, 0.12)); transform: translateY(-10px); z-index: 5; }

.day-column-header { padding: 18px 10px; text-align: center; border-bottom: 1px solid var(--blueBerryGlass, rgba(99, 102, 241, 0.05)); display: flex; flex-direction: column; gap: 4px; }
.day-name { font-size: 11px; font-weight: 800; color: var(--txt-secundary, #94a3b8); text-transform: uppercase; letter-spacing: 0.8px; }
.day-number { font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 800; color: var(--txttitulo, #1e293b); }
.day-column.is-today .day-name { color: var(--purple-sb, #6366f1); }
.day-column.is-today .day-number { background: linear-gradient(135deg, var(--bluelight-sb, #4338ca) 0%, var(--purple-sb, #6366f1) 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }

.day-column-content { padding: 15px 10px; flex: 1; display: flex; flex-direction: column; gap: 15px; overflow-y: auto; }
.day-column-content::-webkit-scrollbar { width: 4px; }
.day-column-content::-webkit-scrollbar-track { background: transparent; }
.day-column-content::-webkit-scrollbar-thumb { background: var(--purple-sb-70, rgba(99, 102, 241, 0.3)); border-radius: 4px; }

.no-posts-small { display: flex; align-items: center; justify-content: center; height: 120px; color: var(--txt-secundary, #cbd5e1); opacity: 0.4; }

/* CARDS IN COLUMN */
.schedule-card { background: var(--bg-table, white); border-radius: 18px; padding: 10px; box-shadow: 0 10px 20px rgba(0,0,0,0.03); border: 3.5px solid var(--input, #f1f5f9); border-left: 12px solid var(--gris, #e2e8f0); transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); cursor: pointer; position: relative; overflow: hidden; }
.schedule-card:hover { transform: scale(1.04) translateY(-4px); box-shadow: 0 15px 30px rgba(0,0,0,0.1); border-color: var(--bg-table, white); z-index: 10; }

.type-border-1 { border-left-color: var(--purple-sb, #6366f1); }
.type-border-2 { border-left-color: var(--close, #f43f5e); }
.type-border-3 { border-left-color: var(--durazno, #f59e0b); }
.type-border-4 { border-left-color: var(--bluePerry, #10b981); }
.type-border-area { border-left-color: var(--blueBerry, #A49EEE); }

.card-mini-img { height: var(--cal-card-img-height); border-radius: 12px; overflow: hidden; position: relative; margin-bottom: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.card-mini-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
.schedule-card:hover .card-mini-img img { transform: scale(1.15); }

.mini-status { position: absolute; top: 8px; right: 8px; width: 12px; height: 12px; border-radius: 50%; border: 2.5px solid var(--bg-table, white); box-shadow: 0 2px 5px rgba(0,0,0,0.25); }
.st-1 { background: #10b981; }
.st-2 { background: #f59e0b; }

.card-mini-body { display: flex; flex-direction: column; gap: 4px; }
.card-mini-body h6 { font-size: 12px; font-weight: 700; color: var(--txttitulo, #1e293b); margin: 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card-time { font-size: 10.5px; font-weight: 700; color: var(--purple-sb, #6366f1); display: flex; align-items: center; gap: 6px; }
.card-time::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: currentColor; opacity: 0.6; }
.card-cat { font-size: 9px; font-weight: 800; color: var(--txt-secundary, #94a3b8); text-transform: uppercase; letter-spacing: 0.6px; margin-top: 2px; }

.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 150px 0; flex: 1; color: var(--txt-secundary, #94a3b8); }
.spinner { width: 35px; height: 35px; border: 4px solid var(--input, #f1f5f9); border-top-color: var(--purple-sb, #6366f1); border-radius: 50%; animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite; margin-bottom: 20px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* RESPONSIVE & HORIZONTAL SWIPING */
.day-column.is-selected-day { border-color: var(--purple-sb, #6366f1) !important; border-width: 3.5px !important; box-shadow: 0 10px 25px var(--blueBerryGlass, rgba(99, 102, 241, 0.08)); }
.weekly-schedule-grid::-webkit-scrollbar { height: 6px; }
.weekly-schedule-grid::-webkit-scrollbar-track { background: var(--babyBlue_7, rgba(0,0,0,0.05)); border-radius: 10px; }
.weekly-schedule-grid::-webkit-scrollbar-thumb { background: var(--purple-sb, #6366f1); border-radius: 10px; }

@media (max-width: 1400px) { .day-column { min-width: 130px; } }

@media (max-width: 1100px) {
  .calendar-page-wrapper { flex-direction: column; height: auto; padding: 15px; background: var(--bg-table, white); }
  .calendar-sidebar { width: 100%; max-width: 100%; border: none; background: var(--babyBlue, #f8faff); padding: 25px; margin-bottom: 20px; align-items: center; }
  .mini-calendar-header, .mini-calendar-grid, .btn-today { width: 100%; max-width: 340px; margin-left: auto; margin-right: auto; }
  .weekly-schedule-grid { display: flex; overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; gap: 15px; padding: 15px 5px 20px; -webkit-overflow-scrolling: touch; min-height: 0; }
  .day-column { flex: 0 0 280px; min-width: 280px; scroll-snap-align: start; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03); }
  .day-column.is-today { transform: none; }
}
@media (max-width: 768px) {
  .calendar-page-wrapper { padding: 10px; border-radius: 16px; }
  .content-header { flex-direction: column; align-items: stretch; gap: 15px; padding: 0; }
  .search-mini { width: 100%; }
  .selected-date-info { text-align: center; }
}
</style>