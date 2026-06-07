<template>
  <div class="container fade-in">
    <!-- Header with OBEC logo -->
    <header class="dashboard-header glass-panel" style="margin-bottom: 1.5rem; justify-content: space-between; flex-wrap: wrap;">
      <div class="header-logo-title">
        <img src="/obec_logo.png" alt="สพฐ Logo" class="obec-logo" style="height: 70px;" />
        <div class="header-main">
          <h1 class="gradient-text" style="font-size: 1.8rem; margin-bottom: 0.2rem;">
            <span style="display: inline-block;">แผงวิเคราะห์สรุปผล</span><span style="display: inline-block;">การนิเทศเรียลไทม์</span>
          </h1>
          <p class="subtitle" style="font-size: 0.9rem;">ข้อมูลสถิติประเมินความพร้อมและจุดเน้นภาพรวมระดับเขตพื้นที่การศึกษา</p>
        </div>
      </div>
      <div class="back-nav" style="margin-bottom: 0; display: flex; align-items: center; gap: 0.75rem;">
        <!-- Theme toggle button -->
        <button @click="toggleTheme" class="btn btn-secondary" style="padding: 0.5rem; border-radius: 12px; height: 38px; width: 38px; display: flex; align-items: center; justify-content: center;" title="สลับธีม สว่าง/มืด">
          <span v-if="isLightTheme" style="font-size: 1.2rem; line-height: 1;">☀️</span>
          <span v-else style="font-size: 1.2rem; line-height: 1;">🌙</span>
        </button>

        <NuxtLink to="/" class="btn btn-secondary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.2rem; height: 1.2rem;">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          กลับหน้าแรก Dashboard
        </NuxtLink>
      </div>
    </header>

    <!-- Filters Section -->
    <section class="filter-bar glass-panel" style="margin-bottom: 2rem;">
      <h3 style="font-size: 1.1rem; color: #a5b4fc; width: 100%; margin-bottom: 0.5rem;">🎯 กรองข้อมูลสถิติภาพรวม:</h3>
      <div class="filter-dropdowns" style="width: 100%; justify-content: flex-start;">
        <select v-model="selectedDistrict" class="select-input">
          <option value="">ทุกอำเภอ</option>
          <option v-for="d in uniqueDistricts" :key="d" :value="d">{{ d }}</option>
        </select>

        <select v-model="selectedGroup" class="select-input" :disabled="!selectedDistrict">
          <option value="">ทุกศูนย์เครือข่าย</option>
          <option v-for="g in uniqueGroups" :key="g" :value="g">{{ g }}</option>
        </select>

        <button @click="resetFilters" class="btn btn-secondary btn-icon-only" title="ล้างตัวกรอง">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.2rem; height: 1.2rem;">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>
    </section>

    <!-- Overview Stats Grid -->
    <div class="summary-top-stats">
      <div class="stat-box glass-panel">
        <span class="stat-lbl">โรงเรียนทั้งหมด</span>
        <span class="stat-val">{{ filteredSchools.length }}</span>
        <span class="stat-desc">โรงเรียนที่เข้าเกณฑ์การคัดกรอง</span>
      </div>
      <div class="stat-box glass-panel">
        <span class="stat-lbl">เริ่มนิเทศแล้วอย่างน้อย 1 เรื่อง</span>
        <span class="stat-val text-yellow">{{ activeSupervisionCount }}</span>
        <span class="stat-desc">คิดเป็น {{ getPercent(activeSupervisionCount, filteredSchools.length) }}% ของกลุ่มกรอง</span>
      </div>
      <div class="stat-box glass-panel">
        <span class="stat-lbl">นิเทศเสร็จสมบูรณ์ครบ 4 เรื่อง</span>
        <span class="stat-val text-green">{{ fullyCompletedCount }}</span>
        <span class="stat-desc">คิดเป็น {{ getPercent(fullyCompletedCount, filteredSchools.length) }}% ของกลุ่มกรอง</span>
      </div>
    </div>

    <!-- Main Analytics Content -->
    <main class="analytics-layout-grid">
      <!-- Left: Core Charts & Analysis Tables -->
      <div class="analytics-main-panel">
        <!-- Completion rate per form -->
        <section class="analysis-section glass-panel">
          <h2>📊 อัตราการประเมินเสร็จสิ้นแยกตามแบบนิเทศ</h2>
          <div class="bar-chart-container">
            <div class="chart-bar-row" v-for="(form, index) in formCompletionStats" :key="index">
              <span class="chart-label">{{ form.title }}</span>
              <div class="chart-bar-track">
                <div class="chart-bar-fill completed" :style="{ width: form.completedPct + '%' }" :title="'เสร็จสมบูรณ์ ' + form.completedPct + '%'"></div>
                <div class="chart-bar-fill draft" :style="{ width: form.draftPct + '%' }" :title="'บันทึกร่าง ' + form.draftPct + '%'"></div>
              </div>
              <span class="chart-value">
                <span class="text-green">{{ form.completed }}</span> /
                <span class="text-yellow">{{ form.draft }}</span> /
                <span class="text-muted">{{ filteredSchools.length }}</span>
              </span>
            </div>
            <div class="chart-legend">
              <span class="legend-item"><span class="dot bg-green"></span> เสร็จสมบูรณ์</span>
              <span class="legend-item"><span class="dot bg-yellow"></span> บันทึกแบบร่าง</span>
              <span class="legend-item"><span class="dot bg-slate"></span> ยังไม่ดำเนินการ</span>
            </div>
          </div>
        </section>

        <!-- Strong / Weak Items Analysis (วิเคราะห์จุดเด่น / จุดวิกฤต) -->
        <section class="analysis-section glass-panel">
          <h2>⚠️ วิเคราะห์จุดเด่น และจุดวิกฤตที่ต้องได้รับการยกระดับเร่งด่วน</h2>
          <p class="subtitle" style="margin-bottom: 1.5rem;">ประเมินจากข้อมูลดิบของทุกข้อคำถามย่อยในระบบแบบเรียลไทม์</p>

          <div class="weak-strong-grid">
            <!-- 5 Weakest Areas -->
            <div class="analysis-card weak-card">
              <h3>🚨 5 ประเด็นวิกฤตเร่งด่วน (มีปัญหา/ยังไม่ทำสูงสุด)</h3>
              <div class="priority-list" v-if="weakestItems.length > 0">
                <div class="priority-item" v-for="(item, i) in weakestItems" :key="i">
                  <div class="priority-rank">{{ i + 1 }}</div>
                  <div class="priority-details">
                    <span class="p-id">เรื่องที่ {{ item.formNo }} • ข้อ {{ item.id }}</span>
                    <p class="p-text">{{ item.text }}</p>
                    <span class="p-reason">ยังไม่เสร็จสิ้น/คะแนนต่ำ: <strong>{{ item.count }} โรงเรียน</strong></span>
                  </div>
                </div>
              </div>
              <p v-else class="text-muted text-center" style="padding: 2rem 0;">ยังไม่มีข้อมูลประเมินที่มีปัญหา</p>
            </div>

            <!-- 5 Strongest Areas -->
            <div class="analysis-card strong-card">
              <h3>🏆 5 จุดเด่นเชิงประจักษ์ (มีความพร้อม/เสร็จสมบูรณ์สูงสุด)</h3>
              <div class="priority-list" v-if="strongestItems.length > 0">
                <div class="priority-item" v-for="(item, i) in strongestItems" :key="i">
                  <div class="priority-rank">{{ i + 1 }}</div>
                  <div class="priority-details">
                    <span class="p-id">เรื่องที่ {{ item.formNo }} • ข้อ {{ item.id }}</span>
                    <p class="p-text">{{ item.text }}</p>
                    <span class="p-reason">ดำเนินการแล้วเสร็จ: <strong>{{ item.count }} โรงเรียน</strong></span>
                  </div>
                </div>
              </div>
              <p v-else class="text-muted text-center" style="padding: 2rem 0;">ยังไม่มีข้อมูลความพร้อมในระบบ</p>
            </div>
          </div>
        </section>

        <!-- Form 3 specific quality level average analysis -->
        <section class="analysis-section glass-panel">
          <h2>🛡️ วิเคราะห์คะแนนคุณภาพเฉลี่ย (งานประกันคุณภาพภายใน - 6 องค์ประกอบ)</h2>
          <div class="qa-average-grid">
            <div class="qa-stat-card" v-for="el in qaElementAverages" :key="el.id">
              <span class="qa-id">องค์ประกอบที่ {{ el.id }}</span>
              <div class="qa-radial-glow" :style="{ borderColor: getQaColor(el.avg) }">
                <span class="qa-avg-val">{{ el.avg }}</span>
                <span class="qa-total">/ 5.0</span>
              </div>
              <p class="qa-name">{{ el.title }}</p>
            </div>
          </div>
        </section>
      </div>

      <!-- Right: District completion summary -->
      <aside class="analytics-sidebar glass-panel">
        <h2>📍 รายงานความคืบหน้าแยกรายอำเภอ</h2>
        <div class="district-summary-list">
          <div class="district-row" v-for="d in districtCompletionList" :key="d.name">
            <div class="district-info">
              <strong>อำเภอ {{ d.name }}</strong>
              <span>ประเมินครบแล้ว {{ d.completed }} จาก {{ d.total }} โรงเรียน</span>
            </div>
            <div class="progress-bar-bg" style="height: 8px;">
              <div class="progress-bar-fill" :style="{ width: d.pct + '%', backgroundColor: '#10b981' }"></div>
            </div>
            <span class="pct-text">{{ d.pct }}%</span>
          </div>
        </div>

        <button @click="printReport" class="btn btn-secondary" style="width: 100%; margin-top: 1.5rem;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.2rem; height: 1.2rem;">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          พิมพ์หรือเซฟ PDF รายงาน
        </button>
      </aside>
    </main>

    <!-- Footer developer credit -->
    <footer style="margin-top: 3rem; margin-bottom: 1.5rem; text-align: center;">
      <p style="color: var(--text-muted); opacity: 0.35; font-size: 0.85rem; font-weight: 400; letter-spacing: 0.05em;">
        © Developer: Winai Nunkratok
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  form1Questions,
  form3Questions,
  form4Questions
} from '~/utils/questionsData'

const selectedDistrict = ref('')
const selectedGroup = ref('')
const selectedSchoolName = ref('')
const schoolsList = ref([])

// Fetch schools list from API
const { data: fetchRes } = await useFetch('/api/schools')
if (fetchRes.value && fetchRes.value.success) {
  schoolsList.value = fetchRes.value.schools
}

// Reset filters
const resetFilters = () => {
  selectedDistrict.value = ''
  selectedGroup.value = ''
}

// Filter calculations
const uniqueDistricts = computed(() => {
  return [...new Set(schoolsList.value.map(s => s.district))].sort()
})

const uniqueGroups = computed(() => {
  const list = selectedDistrict.value 
    ? schoolsList.value.filter(s => s.district === selectedDistrict.value) 
    : schoolsList.value
  return [...new Set(list.map(s => s.school_group))].sort()
})

// Filtered Schools mapping
const filteredSchools = computed(() => {
  return schoolsList.value.filter((school) => {
    const matchDistrict = selectedDistrict.value ? school.district === selectedDistrict.value : true
    const matchGroup = selectedGroup.value ? school.school_group === selectedGroup.value : true
    return matchDistrict && matchGroup
  })
})

const getPercent = (completed, total) => {
  if (!total) return 0
  return Math.round((completed / total) * 100)
}

// Global active evaluation and fully completed schools
const activeSupervisionCount = computed(() => {
  return filteredSchools.value.filter(s => 
    s.status_form_1 !== 'pending' || 
    s.status_form_2 !== 'pending' || 
    s.status_form_3 !== 'pending' || 
    s.status_form_4 !== 'pending'
  ).length
})

const fullyCompletedCount = computed(() => {
  return filteredSchools.value.filter(s => 
    s.status_form_1 === 'completed' && 
    s.status_form_2 === 'completed' && 
    s.status_form_3 === 'completed' && 
    s.status_form_4 === 'completed'
  ).length
})

// Form completions count
const formCompletionStats = computed(() => {
  const total = filteredSchools.value.length || 1
  
  const getStatsForForm = (statusKey, title) => {
    const completed = filteredSchools.value.filter(s => s[statusKey] === 'completed').length
    const draft = filteredSchools.value.filter(s => s[statusKey] === 'draft').length
    return {
      title,
      completed,
      draft,
      completedPct: (completed / total) * 100,
      draftPct: (draft / total) * 100
    }
  }

  return [
    getStatsForForm('status_form_1', '1. ความพร้อมเปิดเรียน'),
    getStatsForForm('status_form_2', '2. จุดเน้นเขตพื้นที่ฯ'),
    getStatsForForm('status_form_3', '3. การประกันภายใน'),
    getStatsForForm('status_form_4', '4. นโยบาย สพฐ.')
  ]
})

// Quantitative item analysis (Strongest / Weakest)
const itemAnalysis = computed(() => {
  const weakItems = {}
  const strongItems = {}

  // 1. Scan Form 1 items
  filteredSchools.value.forEach(school => {
    const data1 = school.data_form_1
    if (data1 && data1.items) {
      Object.keys(data1.items).forEach(itemId => {
        const val = data1.items[itemId]
        if (val && val.status === 'not_done') {
          weakItems['f1-' + itemId] = (weakItems['f1-' + itemId] || 0) + 1
        }
        if (val && val.status === 'done') {
          strongItems['f1-' + itemId] = (strongItems['f1-' + itemId] || 0) + 1
        }
      })
    }

    // 2. Scan Form 4 items
    const data4 = school.data_form_4
    if (data4 && data4.items) {
      Object.keys(data4.items).forEach(itemId => {
        const val = data4.items[itemId]
        if (val && val.status === 'not_done') {
          weakItems['f4-' + itemId] = (weakItems['f4-' + itemId] || 0) + 1
        }
        if (val && val.status === 'done') {
          strongItems['f4-' + itemId] = (strongItems['f4-' + itemId] || 0) + 1
        }
      })
    }
  })

  // Helper mapping function to get full text of items
  const getItemText = (key) => {
    const parts = key.split('-')
    const formType = parts[0]
    const itemId = parts[1]

    if (formType === 'f1') {
      for (const sec of form1Questions) {
        const item = sec.items.find(i => i.id === itemId)
        if (item) return item.text
      }
    } else if (formType === 'f4') {
      for (const issue of form4Questions) {
        const item = issue.items.find(i => i.id === itemId)
        if (item) return item.text
      }
    }
    return ''
  }

  // Sort and pick Top 5 weakest
  const sortedWeakest = Object.keys(weakItems)
    .map(key => ({
      key,
      formNo: key.startsWith('f1') ? '1' : '4',
      id: key.split('-')[1],
      count: weakItems[key],
      text: getItemText(key)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Sort and pick Top 5 strongest
  const sortedStrongest = Object.keys(strongItems)
    .map(key => ({
      key,
      formNo: key.startsWith('f1') ? '1' : '4',
      id: key.split('-')[1],
      count: strongItems[key],
      text: getItemText(key)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    weakest: sortedWeakest,
    strongest: sortedStrongest
  }
})

const weakestItems = computed(() => itemAnalysis.value.weakest)
const strongestItems = computed(() => itemAnalysis.value.strongest)

// Quality Element Averages (Form 3)
const qaElementAverages = computed(() => {
  const sumScores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  const countSchools = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }

  filteredSchools.value.forEach(school => {
    const data3 = school.data_form_3
    if (data3 && data3.items) {
      Object.keys(data3.items).forEach(itemId => {
        const val = data3.items[itemId]
        if (val && val.score !== null) {
          // Identify elements by the first char of ID (e.g. 1.1 -> Element 1)
          const elId = itemId.split('.')[0]
          sumScores[elId] += val.score
          countSchools[elId]++
        }
      })
    }
  })

  return form3Questions.map(el => {
    const totalCount = countSchools[el.id] || 1
    const avg = totalCount > 0 ? (sumScores[el.id] / totalCount).toFixed(1) : '0.0'
    return {
      id: el.id,
      title: el.title,
      avg: Number(avg)
    }
  })
})

const getQaColor = (avg) => {
  if (avg >= 4.0) return '#10b981' // Green
  if (avg >= 2.5) return '#f59e0b' // Gold
  return '#ef4444' // Red
}

// District-wise statistics
const districtCompletionList = computed(() => {
  const districts = [...new Set(schoolsList.value.map(s => s.district))].sort()
  return districts.map(dName => {
    const schoolsInDistrict = schoolsList.value.filter(s => s.district === dName)
    const completed = schoolsInDistrict.filter(s => 
      s.status_form_1 === 'completed' && 
      s.status_form_2 === 'completed' && 
      s.status_form_3 === 'completed' && 
      s.status_form_4 === 'completed'
    ).length

    return {
      name: dName,
      completed,
      total: schoolsInDistrict.length,
      pct: Math.round((completed / schoolsInDistrict.length) * 100)
    }
  }).sort((a,b) => b.pct - a.pct)
})

const isLightTheme = ref(false)

const toggleTheme = () => {
  isLightTheme.value = !isLightTheme.value
  localStorage.setItem('school_app_theme', isLightTheme.value ? 'light' : 'dark')
  if (isLightTheme.value) {
    document.body.classList.add('light-theme')
  } else {
    document.body.classList.remove('light-theme')
  }
}

const printReport = () => {
  window.print()
}

onMounted(() => {
  // Load Theme
  isLightTheme.value = localStorage.getItem('school_app_theme') === 'light'
  if (isLightTheme.value) {
    document.body.classList.add('light-theme')
  } else {
    document.body.classList.remove('light-theme')
  }
})
</script>

<style scoped>
.dashboard-header {
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-logo-title {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.obec-logo {
  height: 85px;
  width: auto;
  object-fit: contain;
}

.header-main h1 {
  font-size: 2.1rem;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: var(--text-muted);
  font-size: 1rem;
}

.back-nav {
  margin-bottom: 0;
}

.summary-top-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-box {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.stat-lbl {
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 500;
}

.stat-val {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--text-main);
}

.stat-val.text-yellow { color: var(--color-warning); }
.stat-val.text-green { color: var(--color-success); }

.stat-desc {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
}

/* Layout columns */
.analytics-layout-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: start;
}

@media (min-width: 1024px) {
  .analytics-layout-grid {
    grid-template-columns: 3fr 1.2fr;
  }
}

.analytics-main-panel {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.analysis-section {
  padding: 2.5rem;
}

.analysis-section h2 {
  font-size: 1.4rem;
  color: #a5b4fc;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 0.5rem;
}

/* Completion bar chart styling */
.bar-chart-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.chart-bar-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.chart-label {
  font-size: 0.95rem;
  width: 160px;
  font-weight: 500;
  color: var(--text-main);
}

.chart-bar-track {
  flex-grow: 1;
  height: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  display: flex;
  overflow: hidden;
  border: 1px solid var(--border-light);
}

.chart-bar-fill {
  height: 100%;
  transition: width 0.6s ease-out;
}

.chart-bar-fill.completed {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.chart-bar-fill.draft {
  background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
}

.chart-value {
  font-size: 0.9rem;
  width: 100px;
  text-align: right;
  font-weight: 600;
}

.chart-legend {
  display: flex;
  gap: 1.5rem;
  font-size: 0.85rem;
  justify-content: flex-end;
  color: var(--text-muted);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-item .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot.bg-green { background-color: var(--color-success); }
.dot.bg-yellow { background-color: var(--color-warning); }
.dot.bg-slate { background-color: var(--color-pending); }

/* Weak & Strong items analysis cards */
.weak-strong-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .weak-strong-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.analysis-card {
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-light);
  min-height: 350px;
}

.weak-card {
  background: rgba(239, 68, 68, 0.02);
  border-left: 4px solid #ef4444;
}

.strong-card {
  background: rgba(16, 185, 129, 0.02);
  border-left: 4px solid #10b981;
}

.analysis-card h3 {
  font-size: 1.05rem;
  margin-bottom: 1.25rem;
  color: var(--text-main);
}

.priority-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.priority-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.priority-rank {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-light);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: #a5b4fc;
}

.priority-details {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex-grow: 1;
}

.priority-details .p-id {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
}

.priority-details .p-text {
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.4;
  color: var(--text-main);
}

.priority-details .p-reason {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.priority-details .p-reason strong {
  color: var(--text-main);
}

/* Quality Elements average styling */
.qa-average-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 1rem;
}

.qa-stat-card {
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid var(--border-light);
  background: rgba(255, 255, 255, 0.01);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
}

.qa-id {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
}

.qa-radial-glow {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
}

.qa-avg-val {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
}

.qa-total {
  font-size: 0.65rem;
  color: var(--text-muted);
  margin-top: -2px;
}

.qa-name {
  font-size: 0.75rem;
  line-height: 1.3;
  color: var(--text-muted);
  height: 48px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* Sidebar summary list */
.analytics-sidebar {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.analytics-sidebar h2 {
  font-size: 1.15rem;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 0.5rem;
}

.district-summary-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.district-row {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.district-info {
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
}

.district-info strong {
  color: var(--text-main);
}

.district-info span {
  color: var(--text-muted);
}

.pct-text {
  font-size: 0.8rem;
  align-self: flex-end;
  font-weight: 600;
  color: var(--color-success);
}

@media print {
  body {
    background: white !important;
    color: black !important;
  }
  
  .container {
    padding: 0;
  }

  .back-nav, .filter-bar, .analytics-sidebar button {
    display: none !important;
  }

  .analytics-layout-grid {
    grid-template-columns: 1fr !important;
  }

  .glass-panel {
    background: transparent !important;
    backdrop-filter: none !important;
    border: none !important;
    box-shadow: none !important;
  }

  .analysis-section {
    padding: 0;
    margin-bottom: 3rem;
  }

  .analysis-section h2 {
    color: black !important;
    border-bottom: 1.5px solid black !important;
  }

  .priority-rank {
    border-color: black !important;
    color: black !important;
  }

  .qa-radial-glow {
    border-color: black !important;
    background: transparent !important;
  }

  .qa-avg-val, .qa-total, .qa-name {
    color: black !important;
  }
}
</style>
