<template>
  <div class="container fade-in">
    <!-- Header -->
    <header class="dashboard-header glass-panel">
      <div class="header-logo-title">
        <img src="/obec_logo.png" alt="สพฐ Logo" class="obec-logo" />
        <div class="header-main">
          <h1 class="gradient-text">
            <span style="display: inline-block;">ระบบนิเทศและติดตาม</span><span style="display: inline-block;">ความพร้อมโรงเรียน</span>
          </h1>
          <p class="subtitle">สำนักงานเขตพื้นที่การศึกษาประถมศึกษานครราชสีมา เขต 2</p>
        </div>
      </div>
      
      <!-- Theme & Admin Switcher Group -->
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <!-- Theme toggle button -->
        <button @click="toggleTheme" class="btn btn-secondary" style="padding: 0.5rem; border-radius: 12px; height: 38px; width: 38px; display: flex; align-items: center; justify-content: center;" title="สลับธีม สว่าง/มืด">
          <span v-if="isLightTheme" style="font-size: 1.2rem; line-height: 1;">☀️</span>
          <span v-else style="font-size: 1.2rem; line-height: 1;">🌙</span>
        </button>

        <!-- Admin Mode Switcher -->
        <div class="admin-badge-switch" :class="{ 'admin-active': isAdminMode }" style="padding: 0.4rem 0.8rem;">
          <label class="switch-label">
            <input type="checkbox" v-model="isAdminMode" />
            <span class="switch-custom">
              <span class="switch-icon" v-if="isAdminMode">🔓 Admin Mode (เปิด)</span>
              <span class="switch-icon" v-else>🔒 ผู้ดูแลระบบ/จัดการข้อมูล</span>
            </span>
          </label>
        </div>
      </div>
    </header>

    <!-- Stats Summary Section -->
    <section class="stats-grid">
      <div class="stat-card glass-panel" v-for="(stat, i) in statCards" :key="i">
        <div class="stat-icon-wrapper" :style="{ color: stat.color }">
          <component :is="stat.icon" class="stat-icon" />
        </div>
        <div class="stat-details">
          <h3>{{ stat.title }}</h3>
          <p class="stat-number">{{ stat.completed }}/{{ totalSchools }}</p>
          <p class="stat-meta">โรงเรียนทำเสร็จสิ้นแล้ว</p>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" :style="{ width: stat.pct + '%', backgroundColor: stat.color }"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Filters and Search -->
    <section class="filter-bar glass-panel">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input type="text" v-model="searchQuery" placeholder="ค้นหาชื่อโรงเรียน หรือ รหัส DMC..." class="input-text" />
      </div>

      <div class="filter-dropdowns">
        <!-- District dropdown -->
        <select v-model="selectedDistrict" class="select-input">
          <option value="">ทุกอำเภอ</option>
          <option v-for="d in uniqueDistricts" :key="d" :value="d">{{ d }}</option>
        </select>

        <!-- Dynamic School Group dropdown (Linked to District) -->
        <select v-model="selectedGroup" class="select-input" :disabled="!selectedDistrict">
          <option value="">ทุกศูนย์เครือข่าย</option>
          <option v-for="g in uniqueGroups" :key="g" :value="g">{{ g }}</option>
        </select>

        <!-- Dynamic School Name dropdown (Linked to Group) -->
        <select v-model="selectedSchoolName" class="select-input" :disabled="!selectedGroup">
          <option value="">เลือกโรงเรียน...</option>
          <option v-for="name in uniqueSchoolNames" :key="name" :value="name">{{ name }}</option>
        </select>
        
        <button @click="resetFilters" class="btn btn-secondary btn-icon-only" title="ล้างตัวกรอง">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.2rem; height: 1.2rem;">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>
    </section>

    <!-- School List -->
    <main class="school-list-section glass-panel">
      <div class="table-header">
        <h2>รายชื่อโรงเรียนและสถานะการประเมิน ({{ filteredSchools.length }} โรงเรียน)</h2>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <button v-if="isAdminMode" @click="exportDataMenu" class="btn btn-secondary" style="border-color: #10b981; color: #34d399; background: rgba(16, 185, 129, 0.05); display: flex; align-items: center; gap: 0.25rem;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.2rem; height: 1.2rem;">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            ส่งออกข้อมูล Excel (.csv)
          </button>
          
          <NuxtLink to="/ai-summary" class="btn btn-primary" style="display: flex; align-items: center; gap: 0.25rem;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.2rem; height: 1.2rem;">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            แดชบอร์ดสรุปผลเชิงลึกเรียลไทม์
          </NuxtLink>
        </div>
      </div>

      <!-- Desktop view table -->
      <div class="table-container">
        <table class="schools-table">
          <thead>
            <tr>
              <th v-if="isAdminMode" class="text-center" style="width: 50px;">จัดการ</th>
              <th>รหัส DMC</th>
              <th>ชื่อโรงเรียน</th>
              <th>อำเภอ</th>
              <th>ศูนย์เครือข่าย</th>
              <th class="text-center">1. ความพร้อมเปิดเรียน</th>
              <th class="text-center">2. จุดเน้นเขตพื้นที่ฯ</th>
              <th class="text-center">3. การประกันภายใน</th>
              <th class="text-center">4. นโยบาย สพฐ.</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="school in filteredSchools" :key="school.dmc_code">
              <!-- Admin Reset/Delete Column -->
              <td v-if="isAdminMode" class="text-center">
                <button @click="deleteSchoolEvaluation(school)" class="delete-btn" title="ลบข้อมูลการประเมินโรงเรียนนี้ทั้งหมด">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.1rem; height: 1.1rem;">
                    <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </td>
              <td><strong>{{ school.dmc_code }}</strong></td>
              <td>{{ school.name }}</td>
              <td>{{ school.district }}</td>
              <td>{{ school.school_group }}</td>
              
              <!-- Form 1 Status Button & Info -->
              <td class="text-center">
                <div class="status-cell">
                  <div style="display: flex; align-items: center; gap: 0.35rem;">
                    <div class="btn-lock-wrapper">
                      <button 
                        @click="openAssessment(school, 'form_1')" 
                        class="status-btn"
                        :class="getStatusClass(school.status_form_1)"
                        title="ความพร้อมการเปิดภาคเรียน (ตอนที่ 2)"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:1.2rem; height:1.2rem;">
                          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                      </button>
                      <!-- Admin Lock Toggle -->
                      <button 
                        v-if="isAdminMode && school.status_form_1 !== 'pending'"
                        @click="toggleFormLock(school, 'form_1')"
                        class="admin-lock-toggle"
                        :class="{ unlocked: school.unlocked_form_1 }"
                        :title="school.unlocked_form_1 ? 'ปลดล็อกอยู่ (นิเทศก์แก้ไขได้)' : 'ล็อกอยู่ (ไม่อนุญาตให้นิเทศก์แก้ไข)'"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 0.8rem; height: 0.8rem;" v-if="!school.unlocked_form_1">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 0.8rem; height: 0.8rem;" v-else>
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                        </svg>
                      </button>
                    </div>
                    <!-- Print Button -->
                    <button 
                      v-if="isAdminMode && school.status_form_1 !== 'pending'"
                      @click="printFormReport(school.dmc_code, 'form_1')"
                      class="print-report-btn"
                      title="พิมพ์รายงาน PDF หัวข้อนี้"
                    >
                      🖨️
                    </button>
                  </div>
                  <span class="progress-lbl">{{ getForm1Progress(school) }}</span>
                  <span class="assessor-lbl" v-if="school.assessor_form_1" :title="school.assessor_form_1">{{ school.assessor_form_1 }}</span>
                </div>
              </td>

              <!-- Form 2 Status Button & Info -->
              <td class="text-center">
                <div class="status-cell">
                  <div style="display: flex; align-items: center; gap: 0.35rem;">
                    <div class="btn-lock-wrapper">
                      <button 
                        @click="openAssessment(school, 'form_2')" 
                        class="status-btn"
                        :class="getStatusClass(school.status_form_2)"
                        title="จุดเน้นเขตพื้นที่ฯ อ่าน-เขียน-คิดเลข-คุณธรรม (ตอนที่ 3)"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:1.2rem; height:1.2rem;">
                          <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                        </svg>
                      </button>
                      <!-- Admin Lock Toggle -->
                      <button 
                        v-if="isAdminMode && school.status_form_2 !== 'pending'"
                        @click="toggleFormLock(school, 'form_2')"
                        class="admin-lock-toggle"
                        :class="{ unlocked: school.unlocked_form_2 }"
                        :title="school.unlocked_form_2 ? 'ปลดล็อกอยู่' : 'ล็อกอยู่'"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 0.8rem; height: 0.8rem;" v-if="!school.unlocked_form_2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 0.8rem; height: 0.8rem;" v-else>
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                        </svg>
                      </button>
                    </div>
                    <!-- Print Button -->
                    <button 
                      v-if="isAdminMode && school.status_form_2 !== 'pending'"
                      @click="printFormReport(school.dmc_code, 'form_2')"
                      class="print-report-btn"
                      title="พิมพ์รายงาน PDF หัวข้อนี้"
                    >
                      🖨️
                    </button>
                  </div>
                  <span class="progress-lbl">{{ getForm2Progress(school) }}</span>
                  <span class="assessor-lbl" v-if="school.assessor_form_2" :title="school.assessor_form_2">{{ school.assessor_form_2 }}</span>
                </div>
              </td>

              <!-- Form 3 Status Button & Info -->
              <td class="text-center">
                <div class="status-cell">
                  <div style="display: flex; align-items: center; gap: 0.35rem;">
                    <div class="btn-lock-wrapper">
                      <button 
                        @click="openAssessment(school, 'form_3')" 
                        class="status-btn"
                        :class="getStatusClass(school.status_form_3)"
                        title="การประกันคุณภาพการศึกษาภายใน (ตอนที่ 4)"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:1.2rem; height:1.2rem;">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                      </button>
                      <!-- Admin Lock Toggle -->
                      <button 
                        v-if="isAdminMode && school.status_form_3 !== 'pending'"
                        @click="toggleFormLock(school, 'form_3')"
                        class="admin-lock-toggle"
                        :class="{ unlocked: school.unlocked_form_3 }"
                        :title="school.unlocked_form_3 ? 'ปลดล็อกอยู่' : 'ล็อกอยู่'"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 0.8rem; height: 0.8rem;" v-if="!school.unlocked_form_3">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 0.8rem; height: 0.8rem;" v-else>
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                        </svg>
                      </button>
                    </div>
                    <!-- Print Button -->
                    <button 
                      v-if="isAdminMode && school.status_form_3 !== 'pending'"
                      @click="printFormReport(school.dmc_code, 'form_3')"
                      class="print-report-btn"
                      title="พิมพ์รายงาน PDF หัวข้อนี้"
                    >
                      🖨️
                    </button>
                  </div>
                  <span class="progress-lbl">{{ getForm3Progress(school) }}</span>
                  <span class="assessor-lbl" v-if="school.assessor_form_3" :title="school.assessor_form_3">{{ school.assessor_form_3 }}</span>
                </div>
              </td>

              <!-- Form 4 Status Button & Info -->
              <td class="text-center">
                <div class="status-cell">
                  <div style="display: flex; align-items: center; gap: 0.35rem;">
                    <div class="btn-lock-wrapper">
                      <button 
                        @click="openAssessment(school, 'form_4')" 
                        class="status-btn"
                        :class="getStatusClass(school.status_form_4)"
                        title="การดำเนินงานนโยบาย สพฐ. (ตอนที่ 5)"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:1.2rem; height:1.2rem;">
                          <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                        </svg>
                      </button>
                      <!-- Admin Lock Toggle -->
                      <button 
                        v-if="isAdminMode && school.status_form_4 !== 'pending'"
                        @click="toggleFormLock(school, 'form_4')"
                        class="admin-lock-toggle"
                        :class="{ unlocked: school.unlocked_form_4 }"
                        :title="school.unlocked_form_4 ? 'ปลดล็อกอยู่' : 'ล็อกอยู่'"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 0.8rem; height: 0.8rem;" v-if="!school.unlocked_form_4">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 0.8rem; height: 0.8rem;" v-else>
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                        </svg>
                      </button>
                    </div>
                    <!-- Print Button -->
                    <button 
                      v-if="isAdminMode && school.status_form_4 !== 'pending'"
                      @click="printFormReport(school.dmc_code, 'form_4')"
                      class="print-report-btn"
                      title="พิมพ์รายงาน PDF หัวข้อนี้"
                    >
                      🖨️
                    </button>
                  </div>
                  <span class="progress-lbl">{{ getForm4Progress(school) }}</span>
                  <span class="assessor-lbl" v-if="school.assessor_form_4" :title="school.assessor_form_4">{{ school.assessor_form_4 }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile cards view -->
      <div class="mobile-school-cards">
        <div v-for="school in filteredSchools" :key="'mob-' + school.dmc_code" class="mobile-card glass-card">
          <div class="school-card-info" style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <span class="dmc-badge">{{ school.dmc_code }}</span>
              <h3>{{ school.name }}</h3>
              <p>{{ school.district }} • {{ school.school_group }}</p>
            </div>
            <!-- Mobile Admin Delete Button -->
            <button v-if="isAdminMode" @click="deleteSchoolEvaluation(school)" class="delete-btn" style="background:rgba(239,68,68,0.1); border-color:#ef4444; color:#ef4444; padding:0.5rem; border-radius:8px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.1rem; height: 1.1rem;">
                <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
          <div class="form-actions-grid">
            <div class="action-item" @click="openAssessment(school, 'form_1')">
              <span class="label">1. ความพร้อมเปิดเรียน ({{ getForm1Progress(school) }})</span>
              <span class="mobile-assessor-tag" v-if="school.assessor_form_1">โดย {{ school.assessor_form_1 }}</span>
              <!-- Mobile Lock indicator -->
              <span v-if="school.status_form_1 === 'completed'" class="lock-indicator-mob">{{ school.unlocked_form_1 ? '🔓' : '🔒' }}</span>
              <!-- Mobile Print Button -->
              <button 
                v-if="isAdminMode && school.status_form_1 !== 'pending'"
                @click.stop="printFormReport(school.dmc_code, 'form_1')"
                class="print-report-btn-mob"
                title="พิมพ์รายงาน PDF"
              >
                🖨️
              </button>
              <span class="status-indicator-dot" :class="getStatusClass(school.status_form_1)"></span>
            </div>
            <div class="action-item" @click="openAssessment(school, 'form_2')">
              <span class="label">2. จุดเน้นเขตพื้นที่ฯ ({{ getForm2Progress(school) }})</span>
              <span class="mobile-assessor-tag" v-if="school.assessor_form_2">โดย {{ school.assessor_form_2 }}</span>
              <span v-if="school.status_form_2 === 'completed'" class="lock-indicator-mob">{{ school.unlocked_form_2 ? '🔓' : '🔒' }}</span>
              <!-- Mobile Print Button -->
              <button 
                v-if="isAdminMode && school.status_form_2 !== 'pending'"
                @click.stop="printFormReport(school.dmc_code, 'form_2')"
                class="print-report-btn-mob"
                title="พิมพ์รายงาน PDF"
              >
                🖨️
              </button>
              <span class="status-indicator-dot" :class="getStatusClass(school.status_form_2)"></span>
            </div>
            <div class="action-item" @click="openAssessment(school, 'form_3')">
              <span class="label">3. การประกันภายใน ({{ getForm3Progress(school) }})</span>
              <span class="mobile-assessor-tag" v-if="school.assessor_form_3">โดย {{ school.assessor_form_3 }}</span>
              <span v-if="school.status_form_3 === 'completed'" class="lock-indicator-mob">{{ school.unlocked_form_3 ? '🔓' : '🔒' }}</span>
              <!-- Mobile Print Button -->
              <button 
                v-if="isAdminMode && school.status_form_3 !== 'pending'"
                @click.stop="printFormReport(school.dmc_code, 'form_3')"
                class="print-report-btn-mob"
                title="พิมพ์รายงาน PDF"
              >
                🖨️
              </button>
              <span class="status-indicator-dot" :class="getStatusClass(school.status_form_3)"></span>
            </div>
            <div class="action-item" @click="openAssessment(school, 'form_4')">
              <span class="label">4. นโยบาย สพฐ. ({{ getForm4Progress(school) }})</span>
              <span class="mobile-assessor-tag" v-if="school.assessor_form_4">โดย {{ school.assessor_form_4 }}</span>
              <span v-if="school.status_form_4 === 'completed'" class="lock-indicator-mob">{{ school.unlocked_form_4 ? '🔓' : '🔒' }}</span>
              <!-- Mobile Print Button -->
              <button 
                v-if="isAdminMode && school.status_form_4 !== 'pending'"
                @click.stop="printFormReport(school.dmc_code, 'form_4')"
                class="print-report-btn-mob"
                title="พิมพ์รายงาน PDF"
              >
                🖨️
              </button>
              <span class="status-indicator-dot" :class="getStatusClass(school.status_form_4)"></span>
            </div>
          </div>
        </div>
      </div>
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
import { ref, computed, watch, onMounted } from 'vue'

const isAdminMode = ref(false)
const isLightTheme = ref(false)
const isInitializing = ref(true)

const searchQuery = ref('')
const selectedDistrict = ref('')
const selectedGroup = ref('')
const selectedSchoolName = ref('')
const schoolsList = ref([])

// Theme toggle function
const toggleTheme = () => {
  isLightTheme.value = !isLightTheme.value
  localStorage.setItem('school_app_theme', isLightTheme.value ? 'light' : 'dark')
  if (isLightTheme.value) {
    document.body.classList.add('light-theme')
  } else {
    document.body.classList.remove('light-theme')
  }
}

// Helper mixin for dark-themed SweetAlert2
const getSwal = async () => {
  const Swal = (await import('sweetalert2')).default
  return Swal.mixin({
    background: '#12192c',
    color: '#f8fafc',
    confirmButtonColor: '#6366f1',
    cancelButtonColor: '#475569',
    customClass: {
      popup: 'glass-panel',
      confirmButton: 'btn btn-primary',
      cancelButton: 'btn btn-secondary'
    }
  })
}

// Linked Filter Watchers: Reset dependent dropdowns
watch(selectedDistrict, () => {
  selectedGroup.value = ''
  selectedSchoolName.value = ''
})

watch(selectedGroup, () => {
  selectedSchoolName.value = ''
})

// Fetch schools list from API
const loadSchools = async () => {
  const res = await $fetch('/api/schools')
  if (res && res.success) {
    schoolsList.value = res.schools
  }
}

onMounted(() => {
  // Load Admin Mode
  isAdminMode.value = localStorage.getItem('school_admin_mode') === 'true'
  
  // Load Theme
  isLightTheme.value = localStorage.getItem('school_app_theme') === 'light'
  if (isLightTheme.value) {
    document.body.classList.add('light-theme')
  } else {
    document.body.classList.remove('light-theme')
  }

  loadSchools()

  // End initialization block to prevent triggering passcode check on load
  setTimeout(() => {
    isInitializing.value = false
  }, 100)
})

// Watch Admin Mode changes with passcode protection
watch(isAdminMode, async (newVal, oldVal) => {
  if (isInitializing.value) return

  if (newVal && !oldVal) {
    const Swal = await getSwal()
    const { value: password } = await Swal.fire({
      title: '🔐 กรุณากรอกรหัสผ่านผู้ดูแลระบบ',
      input: 'password',
      inputPlaceholder: 'กรอกรหัสผ่านที่นี่...',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    })

    if (password === 'korat2.go.th') {
      localStorage.setItem('school_admin_mode', 'true')
      Swal.fire({
        icon: 'success',
        title: '🔓 เข้าสู่โหมดผู้ดูแลระบบสำเร็จ',
        timer: 1500,
        showConfirmButton: false
      })
    } else {
      isAdminMode.value = false
      localStorage.setItem('school_admin_mode', 'false')
      if (password !== undefined) {
        Swal.fire({
          icon: 'error',
          title: '❌ รหัสผ่านไม่ถูกต้อง',
          text: 'กรุณาลองใหม่อีกครั้งครับ'
        })
      }
    }
  } else if (!newVal) {
    localStorage.setItem('school_admin_mode', 'false')
  }
})

const totalSchools = computed(() => schoolsList.value.length)

// Get unique values for filters
const uniqueDistricts = computed(() => {
  return [...new Set(schoolsList.value.map(s => s.district))].sort()
})

const uniqueGroups = computed(() => {
  const list = selectedDistrict.value 
    ? schoolsList.value.filter(s => s.district === selectedDistrict.value) 
    : schoolsList.value
  return [...new Set(list.map(s => s.school_group))].sort()
})

const uniqueSchoolNames = computed(() => {
  let list = schoolsList.value
  if (selectedDistrict.value) {
    list = list.filter(s => s.district === selectedDistrict.value)
  }
  if (selectedGroup.value) {
    list = list.filter(s => s.school_group === selectedGroup.value)
  }
  return [...new Set(list.map(s => s.name))].sort()
})

// Reset filters
const resetFilters = () => {
  searchQuery.value = ''
  selectedDistrict.value = ''
  selectedGroup.value = ''
  selectedSchoolName.value = ''
}

// Get status styling class
const getStatusClass = (status) => {
  if (status === 'completed') return 'status-completed'
  if (status === 'draft') return 'status-draft'
  return 'status-pending'
}

// Router routing
const router = useRouter()
const openAssessment = async (school, formType) => {
  const statusKey = 'status_' + formType
  const unlockKey = 'unlocked_' + formType
  
  // Rule: If completed, only editable if unlocked is true OR if Admin Mode is active
  if (school[statusKey] === 'completed' && !school[unlockKey] && !isAdminMode.value) {
    // Show locked info box using SweetAlert2
    const Swal = await getSwal()
    Swal.fire({
      icon: 'info',
      title: 'แบบประเมินถูกล็อกการแก้ไข',
      text: 'ข้อมูลนี้ได้รับการยืนยันส่งเรียบร้อยแล้ว ไม่สามารถแก้ไขได้อีก หากต้องการแก้ไขกรุณาติดต่อผู้ดูแลระบบ (Admin) เพื่อขออนุมัติปลดล็อก',
      confirmButtonText: 'เข้าชมรายงานแบบอ่านอย่างเดียว'
    }).then((result) => {
      if (result.isConfirmed) {
        router.push(`/assessment/${school.dmc_code}?form=${formType}&readOnly=true`)
      }
    })
  } else {
    router.push(`/assessment/${school.dmc_code}?form=${formType}`)
  }
}

// Admin Reset/Delete Evaluation Action
const deleteSchoolEvaluation = async (school) => {
  const Swal = await getSwal()
  const result = await Swal.fire({
    title: '⚠️ ยืนยันการลบข้อมูลทั้งหมด?',
    text: `คุณต้องการลบข้อมูลการประเมินและการบันทึกร่างทั้งหมดของโรงเรียน "${school.name}" ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ใช่, ลบทั้งหมด',
    cancelButtonText: 'ยกเลิก'
  })

  if (result.isConfirmed) {
    try {
      const res = await $fetch('/api/admin', {
        method: 'POST',
        body: {
          action: 'delete',
          dmc_code: school.dmc_code
        }
      })
      if (res.success) {
        Swal.fire('สำเร็จ!', res.message, 'success')
        await loadSchools() // Reload lists
      }
    } catch (err) {
      Swal.fire('ข้อผิดพลาด!', 'ไม่สามารถลบข้อมูลได้: ' + (err.statusMessage || err.message), 'error')
    }
  }
}

// Admin Lock Toggle Action
const toggleFormLock = async (school, formType) => {
  const Swal = await getSwal()
  const unlockKey = 'unlocked_' + formType
  const currentLockState = school[unlockKey]
  const newLockState = !currentLockState

  try {
    const res = await $fetch('/api/admin', {
      method: 'POST',
      body: {
        action: 'toggle-lock',
        dmc_code: school.dmc_code,
        form_type: formType,
        unlocked: newLockState
      }
    })
    if (res.success) {
      school[unlockKey] = newLockState
      Swal.fire({
        icon: 'success',
        title: newLockState ? '🔓 ปลดล็อกการแก้ไขแล้ว' : '🔒 ล็อกการแก้ไขแล้ว',
        text: newLockState ? 'ศึกษานิเทศก์สามารถเข้าไปแก้ไขและบันทึกข้อมูลฟอร์มนี้ใหม่ได้' : 'แบบนิเทศนี้ถูกปิดกั้นการแก้ไขแล้ว',
        timer: 2000,
        showConfirmButton: false
      })
    }
  } catch (err) {
    Swal.fire('ข้อผิดพลาด!', 'ไม่สามารถเปลี่ยนสถานะล็อกได้: ' + (err.statusMessage || err.message), 'error')
  }
}

// Open report in print view
const printFormReport = (dmcCode, formType) => {
  window.open(`/report-${dmcCode}-${formType}`, '_blank')
}

// Filtered schools logic
const filteredSchools = computed(() => {
  return schoolsList.value.filter((school) => {
    const matchQuery = 
      school.name.includes(searchQuery.value) || 
      school.dmc_code.includes(searchQuery.value)
      
    const matchDistrict = selectedDistrict.value ? school.district === selectedDistrict.value : true
    const matchGroup = selectedGroup.value ? school.school_group === selectedGroup.value : true
    const matchSchoolName = selectedSchoolName.value ? school.name === selectedSchoolName.value : true

    return matchQuery && matchDistrict && matchGroup && matchSchoolName
  })
})

// Stat computations for progress bars
const countFormStatus = (formKey, status) => {
  return schoolsList.value.filter(s => s[formKey] === status).length
}

const statCards = computed(() => {
  const form1Done = countFormStatus('status_form_1', 'completed')
  const form2Done = countFormStatus('status_form_2', 'completed')
  const form3Done = countFormStatus('status_form_3', 'completed')
  const form4Done = countFormStatus('status_form_4', 'completed')
  const total = totalSchools.value || 1

  return [
    {
      title: '1. ความพร้อมเปิดเรียน',
      completed: form1Done,
      pct: (form1Done / total) * 100,
      color: '#10b981', // Emerald
      icon: 'svg-school'
    },
    {
      title: '2. จุดเน้นเขตพื้นที่ฯ',
      completed: form2Done,
      pct: (form2Done / total) * 100,
      color: '#6366f1', // Indigo
      icon: 'svg-brain'
    },
    {
      title: '3. การประกันภายใน',
      completed: form3Done,
      pct: (form3Done / total) * 100,
      color: '#f59e0b', // Amber
      icon: 'svg-shield'
    },
    {
      title: '4. นโยบาย สพฐ.',
      completed: form4Done,
      pct: (form4Done / total) * 100,
      color: '#ec4899', // Hot Pink
      icon: 'svg-target'
    }
  ]
})

// Client-side completed question counts
const getForm1Progress = (school) => {
  const data = school.data_form_1
  if (!data || !data.items) return '0/44'
  let answered = 0
  Object.values(data.items).forEach(val => {
    if (val && val.status && val.status !== 'pending') answered++
  })
  return `${answered}/44`
}

const getForm2Progress = (school) => {
  const data = school.data_form_2
  if (!data) return '0/38'
  let answered = 0
  if (data.reading_writing) {
    Object.values(data.reading_writing).forEach(val => {
      if (val && val.has_data !== undefined && val.has_data !== null) answered++
    })
  }
  if (data.math_calculation) {
    Object.values(data.math_calculation).forEach(val => {
      if (val && val.has_data !== undefined && val.has_data !== null) answered++
    })
  }
  if (data.citizenship) {
    if (data.citizenship.indicators) {
      Object.values(data.citizenship.indicators).forEach(val => {
        if (val && val.score !== null) answered++
      })
    }
    if (data.citizenship.attributes) {
      Object.values(data.citizenship.attributes).forEach(val => {
        if (val && val.score !== null) answered++
      })
    }
  }
  return `${answered}/38`
}

const getForm3Progress = (school) => {
  const data = school.data_form_3
  if (!data || !data.items) return '0/19'
  let answered = 0
  Object.values(data.items).forEach(val => {
    if (val && val.score !== null) answered++
  })
  return `${answered}/19`
}

const getForm4Progress = (school) => {
  const data = school.data_form_4
  if (!data || !data.items) return '0/56'
  let answered = 0
  Object.values(data.items).forEach(val => {
    if (val && val.status && val.status !== 'pending') answered++
  })
  return `${answered}/56`
}

// Admin Export Data to CSV
const exportDataMenu = async () => {
  const Swal = await getSwal()
  const { value: formId } = await Swal.fire({
    title: '📥 ส่งออกข้อมูล Excel (.csv)',
    text: 'กรุณาเลือกแบบติดตามที่ต้องการส่งออกข้อมูลสำหรับนำไปวิเคราะห์ต่อใน Excel:',
    input: 'select',
    inputOptions: {
      'form_1': '1. แบบติดตามความพร้อมเปิดเรียน',
      'form_2': '2. แบบติดตามจุดเน้นเขตพื้นที่ฯ',
      'form_3': '3. แบบติดตามการประกันภายใน',
      'form_4': '4. แบบติดตามนโยบาย สพฐ.'
    },
    inputPlaceholder: '--- เลือกแบบติดตาม ---',
    showCancelButton: true,
    confirmButtonText: 'ดาวน์โหลดไฟล์ Excel',
    cancelButtonText: 'ยกเลิก',
    inputValidator: (value) => {
      return new Promise((resolve) => {
        if (value) {
          resolve()
        } else {
          resolve('กรุณาเลือกแบบติดตามด้วยครับ')
        }
      })
    }
  })

  if (formId) {
    runExport(formId)
  }
}

const runExport = (formId) => {
  const BOM = '\ufeff';
  let headers = [];
  let rows = [];

  // Helper to escape values for CSV
  const esc = (v) => {
    if (v === null || v === undefined) return '""';
    return '"' + String(v).replace(/"/g, '""') + '"';
  };

  if (formId === 'form_1') {
    headers = [
      'DMC Code', 'ชื่อโรงเรียน', 'อำเภอ', 'ศูนย์เครือข่าย', 
      'สถานะการประเมิน', 'ผู้ประเมิน', 'ระดับที่เปิดสอน', 
      'ชื่อผู้ให้ข้อมูล', 'ตำแหน่งผู้ให้ข้อมูล', 'วันที่ให้ข้อมูล',
      'ประเภทผู้บริหาร', 'ชื่อผู้บริหาร', 'เบอร์โทรผู้บริหาร', 'รายชื่อรองผู้บริหาร'
    ];

    // Add question headers
    form1Questions.forEach(sec => {
      sec.items.forEach(item => {
        headers.push(`ข้อ ${item.id} - ${item.text} (สถานะ)`);
        headers.push(`ข้อ ${item.id} - ${item.text} (หลักฐาน)`);
        if (item.id === '1.8') {
          headers.push('ข้อ 1.8 ความครบถ้วน (ครบ/ไม่ครบ)');
          headers.push('ข้อ 1.8 เหตุผลที่ไม่ครบ');
          headers.push('ข้อ 1.8 คาดว่าจะครบวันที่');
        } else if (item.id === '4.1.10') {
          headers.push('ข้อ 4.1.10 มีเครื่องเล่นปลอดภัย (มี/ไม่มี)');
          headers.push('ข้อ 4.1.10 มีแนวรั้วกั้น (มี/ไม่มี)');
        } else if (item.id === '4.2.4') {
          headers.push('ข้อ 4.2.4 มีระบบกล้องวงจรปิด (มี/ไม่มี)');
          headers.push('ข้อ 4.2.4 จำนวนกล้อง (ตัว)');
        } else if (item.id === '4.3.8') {
          headers.push('ข้อ 4.3.8 มีอาหารเสริม (นมกล่อง)');
          headers.push('ข้อ 4.3.8 มีอาหารเสริม (นมถุง)');
        }
      });
    });

    headers.push('ตอนที่ 3: จุดเด่น/ข้อสังเกต', 'ตอนที่ 3: จุดที่ควรพัฒนา', 'ตอนที่ 3: ความต้องการช่วยเหลือ');

    filteredSchools.value.forEach(school => {
      const db = school.data_form_1 || {};
      const items = db.items || {};
      const feedback = db.feedback || {};
      const basic = db.basic_info || {};

      let statusLabel = '';
      if (school.status_form_1 === 'completed') statusLabel = 'เสร็จสมบูรณ์';
      else if (school.status_form_1 === 'draft') statusLabel = 'บันทึกแบบร่าง';
      else statusLabel = 'ยังไม่เริ่มประเมิน';

      const level = `${basic.level_from || ''} - ${basic.level_to || ''}`.trim() || '-';
      const directorName = `${basic.director_name || ''} ${basic.director_lastname || ''}`.trim() || '-';
      const deputiesStr = (basic.deputies || []).map(d => `${d.name || ''} ${d.lastname || ''} (${d.phone || ''})`).join(', ') || '-';

      const row = [
        school.dmc_code,
        school.name,
        school.district,
        school.school_group,
        statusLabel,
        school.assessor_form_1 || '-',
        level,
        basic.informer_name || '-',
        basic.informer_position || '-',
        basic.informer_date || '-',
        basic.director_type || '-',
        directorName,
        basic.director_phone || '-',
        deputiesStr
      ];

      // Add question data
      form1Questions.forEach(sec => {
        sec.items.forEach(item => {
          const val = items[item.id] || {};
          let statusText = 'ยังไม่ดำเนินการ';
          if (val.status === 'done') statusText = 'ดำเนินการแล้ว';
          else if (val.status === 'in_progress') statusText = 'อยู่ระหว่างดำเนินการ';

          row.push(statusText);
          row.push(val.evidence || '');

          if (item.id === '1.8') {
            row.push(val.completeness === 'yes' ? 'ครบ' : (val.completeness === 'no' ? 'ไม่ครบ' : '-'));
            row.push(val.reason || '');
            row.push(val.expected_date || '');
          } else if (item.id === '4.1.10') {
            row.push(val.has_safe_playground ? 'มี' : 'ไม่มี');
            row.push(val.has_fence ? 'มี' : 'ไม่มี');
          } else if (item.id === '4.2.4') {
            row.push(val.has_cctv === 'yes' ? 'มี' : (val.has_cctv === 'no' ? 'ไม่มี' : '-'));
            row.push(val.camera_count || '');
          } else if (item.id === '4.3.8') {
            row.push(val.milk_box ? 'มี' : 'ไม่มี');
            row.push(val.milk_bag ? 'มี' : 'ไม่มี');
          }
        });
      });

      row.push(feedback.strengths || '');
      row.push(feedback.improvements || '');
      row.push(feedback.needs || '');

      rows.push(row.map(esc).join(','));
    });

  } else if (formId === 'form_2') {
    headers = [
      'DMC Code', 'ชื่อโรงเรียน', 'อำเภอ', 'ศูนย์เครือข่าย', 
      'สถานะการประเมิน', 'ผู้ประเมิน',
      'ผู้ให้ข้อมูล (อ่านเขียน)', 'ตำแหน่ง (อ่านเขียน)', 'วันที่ (อ่านเขียน)',
      'ผู้ให้ข้อมูล (คิดเลข)', 'ตำแหน่ง (คิดเลข)', 'วันที่ (คิดเลข)',
      'ผู้ให้ข้อมูล (คุณธรรม)', 'ตำแหน่ง (คุณธรรม)', 'วันที่ (คุณธรรม)'
    ];

    // Core reading_writing
    const rwSection = form2Questions.core.find(c => c.key === 'reading_writing');
    rwSection.items.forEach(item => {
      headers.push(`2.1 ข้อ ${item.id} - ${item.text} (ผลการจัด)`);
      headers.push(`2.1 ข้อ ${item.id} - ${item.text} (แหล่งข้อมูล)`);
    });

    // Core math_calculation
    const mathSection = form2Questions.core.find(c => c.key === 'math_calculation');
    mathSection.items.forEach(item => {
      headers.push(`2.2 ข้อ ${item.id} - ${item.text} (ผลการจัด)`);
      headers.push(`2.2 ข้อ ${item.id} - ${item.text} (แหล่งข้อมูล)`);
    });

    // Citizenship indicators
    form2Questions.citizenship.indicators.forEach(item => {
      headers.push(`2.3.1 ข้อ ${item.id} - ${item.text} (ระดับคะแนน 1-4)`);
      headers.push(`2.3.1 ข้อ ${item.id} - ${item.text} (ร่องรอยหลักฐาน)`);
    });

    // Desired attributes
    form2Questions.citizenship.attributes.forEach(item => {
      headers.push(`2.3.2 ข้อ ${item.id} - ${item.text} (ระดับคะแนน 1-4)`);
      headers.push(`2.3.2 ข้อ ${item.id} - ${item.text} (ร่องรอยหลักฐาน)`);
    });

    headers.push(
      'จุดเด่น (การอ่านเขียน)', 'จุดที่ควรพัฒนา (การอ่านเขียน)', 'ข้อเสนอแนะ (การอ่านเขียน)',
      'จุดเด่น (การคิดเลข)', 'จุดที่ควรพัฒนา (การคิดเลข)', 'ข้อเสนอแนะ (การคิดเลข)',
      'จุดเด่น (ความเป็นพลเมือง)', 'จุดที่ควรพัฒนา (ความเป็นพลเมือง)', 'ข้อเสนอแนะ (ความเป็นพลเมือง)'
    );

    filteredSchools.value.forEach(school => {
      const db = school.data_form_2 || {};
      const rw = db.reading_writing || {};
      const rwInfo = db.reading_writing_info || {};
      const math = db.math_calculation || {};
      const mathInfo = db.math_calculation_info || {};
      const citizen = db.citizenship || {};
      const citizenInfo = db.citizenship_info || {};
      const indicators = citizen.indicators || {};
      const attributes = citizen.attributes || {};
      const feedback = db.feedback || {};

      let statusLabel = '';
      if (school.status_form_2 === 'completed') statusLabel = 'เสร็จสมบูรณ์';
      else if (school.status_form_2 === 'draft') statusLabel = 'บันทึกแบบร่าง';
      else statusLabel = 'ยังไม่เริ่มประเมิน';

      const row = [
        school.dmc_code,
        school.name,
        school.district,
        school.school_group,
        statusLabel,
        school.assessor_form_2 || '-',
        rwInfo.responder_name || '-',
        rwInfo.responder_position || '-',
        rwInfo.responder_date || '-',
        mathInfo.responder_name || '-',
        mathInfo.responder_position || '-',
        mathInfo.responder_date || '-',
        citizenInfo.responder_name || '-',
        citizenInfo.responder_position || '-',
        citizenInfo.responder_date || '-'
      ];

      // RW items
      rwSection.items.forEach(item => {
        const val = rw[item.id] || {};
        row.push(val.has_data === true ? 'มี' : (val.has_data === false ? 'ไม่มี' : '-'));
        row.push(val.source || '');
      });

      // Math items
      mathSection.items.forEach(item => {
        const val = math[item.id] || {};
        row.push(val.has_data === true ? 'มี' : (val.has_data === false ? 'ไม่มี' : '-'));
        row.push(val.source || '');
      });

      // Citizenship indicators
      form2Questions.citizenship.indicators.forEach(item => {
        const val = indicators[item.id] || {};
        row.push(val.score || '-');
        row.push(val.evidence || '');
      });

      // Desired attributes
      form2Questions.citizenship.attributes.forEach(item => {
        const val = attributes[item.id] || {};
        row.push(val.score || '-');
        row.push(val.evidence || '');
      });

      // Feedback
      const f_rw = feedback.reading_writing || {};
      const f_math = feedback.math_calculation || {};
      const f_citizen = feedback.citizenship || {};

      row.push(f_rw.strengths || '');
      row.push(f_rw.improvements || '');
      row.push(f_rw.recommendations || '');
      row.push(f_math.strengths || '');
      row.push(f_math.improvements || '');
      row.push(f_math.recommendations || '');
      row.push(f_citizen.strengths || '');
      row.push(f_citizen.improvements || '');
      row.push(f_citizen.recommendations || '');

      rows.push(row.map(esc).join(','));
    });

  } else if (formId === 'form_3') {
    headers = [
      'DMC Code', 'ชื่อโรงเรียน', 'อำเภอ', 'ศูนย์เครือข่าย', 
      'สถานะการประเมิน', 'ผู้ประเมิน',
      'ที่ตั้ง', 'โทรศัพท์', 'โทรสาร', 'E-mail',
      'ชื่อผู้อำนวยการโรงเรียน', 'ชื่อผู้รักษาการแทน',
      'เปิดสอนระดับ', 'ขนาดโรงเรียน',
      'จำนวนบุคลากร (คน)', 'นักเรียนระดับปฐมวัย (คน)',
      'นักเรียนระดับประถมศึกษา (คน)', 'นักเรียนระดับมัธยมศึกษาตอนต้น (คน)',
      'จำนวนนักเรียนรวมทั้งหมด (คน)'
    ];

    const getSchoolSizeText = (s) => {
      if (s === 'small') return 'ขนาดเล็ก';
      if (s === 'medium') return 'ขนาดกลาง';
      if (s === 'large') return 'ขนาดใหญ่';
      if (s === 'extra_large') return 'ขนาดใหญ่พิเศษ';
      return '-';
    };

    // Add question headers
    form3Questions.forEach(el => {
      el.items.forEach(item => {
        headers.push(`องค์ประกอบที่ ${el.id} ข้อ ${item.id} - ${item.text} (ระดับคุณภาพ 1-5)`);
        headers.push(`องค์ประกอบที่ ${el.id} ข้อ ${item.id} - ${item.text} (เอกสารอ้างอิง)`);
      });
    });

    // Add feedback headers
    form3Questions.forEach(el => {
      headers.push(`องค์ประกอบที่ ${el.id} - จุดเด่น`);
      headers.push(`องค์ประกอบที่ ${el.id} - จุดที่ควรพัฒนา`);
    });

    filteredSchools.value.forEach(school => {
      const db = school.data_form_3 || {};
      const items = db.items || {};
      const basic = db.basic_info || {};
      const feedback = db.feedback || {};

      let statusLabel = '';
      if (school.status_form_3 === 'completed') statusLabel = 'เสร็จสมบูรณ์';
      else if (school.status_form_3 === 'draft') statusLabel = 'บันทึกแบบร่าง';
      else statusLabel = 'ยังไม่เริ่มประเมิน';

      const level = `${basic.level_from || ''} - ${basic.level_to || ''}`.trim() || '-';

      const row = [
        school.dmc_code,
        school.name,
        school.district,
        school.school_group,
        statusLabel,
        school.assessor_form_3 || '-',
        basic.address || '-',
        basic.phone || '-',
        basic.fax || '-',
        basic.email || school.email || '-',
        basic.director_name || '-',
        basic.acting_director_name || '-',
        level,
        getSchoolSizeText(basic.school_size),
        basic.staff_total ?? '-',
        basic.students_kindergarten ?? '-',
        basic.students_primary ?? '-',
        basic.students_junior_high ?? '-',
        basic.students_total ?? '-'
      ];

      // Add question data
      form3Questions.forEach(el => {
        el.items.forEach(item => {
          const val = items[item.id] || {};
          row.push(val.score || '-');
          row.push(val.evidence || '');
        });
      });

      // Add feedback comments
      form3Questions.forEach(el => {
        const fb = feedback[el.id] || {};
        row.push(fb.strengths || '');
        row.push(fb.improvements || '');
      });

      rows.push(row.map(esc).join(','));
    });

  } else if (formId === 'form_4') {
    headers = [
      'DMC Code', 'ชื่อโรงเรียน', 'อำเภอ', 'ศูนย์เครือข่าย', 
      'สถานะการประเมิน', 'ผู้ประเมิน'
    ];

    form4Questions.forEach(issue => {
      issue.items.forEach(item => {
        headers.push(`ประเด็นที่ ${issue.id} ข้อ ${item.id} - ${item.text} (สถานะ)`);
        headers.push(`ประเด็นที่ ${issue.id} ข้อ ${item.id} - ${item.text} (หลักฐาน)`);
      });
    });

    filteredSchools.value.forEach(school => {
      const db = school.data_form_4 || {};
      const items = db.items || {};

      let statusLabel = '';
      if (school.status_form_4 === 'completed') statusLabel = 'เสร็จสมบูรณ์';
      else if (school.status_form_4 === 'draft') statusLabel = 'บันทึกแบบร่าง';
      else statusLabel = 'ยังไม่เริ่มประเมิน';

      const row = [
        school.dmc_code,
        school.name,
        school.district,
        school.school_group,
        statusLabel,
        school.assessor_form_4 || '-'
      ];

      // Add question data
      form4Questions.forEach(issue => {
        issue.items.forEach(item => {
          const val = items[item.id] || {};
          let statusText = 'ยังไม่ดำเนินการ';
          if (val.status === 'done') statusText = 'ดำเนินการแล้ว';
          else if (val.status === 'in_progress') statusText = 'อยู่ระหว่างดำเนินการ';

          row.push(statusText);
          row.push(val.evidence || '');
        });
      });

      rows.push(row.map(esc).join(','));
    });
  }

  // Combine CSV content
  const csvContent = BOM + [headers.map(esc).join(','), ...rows].join('\n');
  
  // Create download link and trigger it
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  
  // File name formatting
  const fileNames = {
    'form_1': 'แบบติดตามความพร้อมเปิดเรียน',
    'form_2': 'แบบติดตามจุดเน้นเขตพื้นที่',
    'form_3': 'แบบติดตามการประกันคุณภาพภายใน',
    'form_4': 'แบบติดตามนโยบายสพฐ'
  };
  const currentDate = new Date().toLocaleDateString('th-TH').replace(/\//g, '-');
  link.setAttribute('download', `สรุป_${fileNames[formId]}_${currentDate}.csv`);
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<script>
import { h } from 'vue'

export default {
  components: {
    SvgSchool: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'm3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }),
      h('polyline', { points: '9 22 9 12 15 12 15 22' })
    ]),
    SvgBrain: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M12 20h9' }),
      h('path', { d: 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z' })
    ]),
    SvgShield: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' })
    ]),
    SvgTarget: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('circle', { cx: 12, cy: 12, r: 10 }),
      h('circle', { cx: 12, cy: 12, r: 6 }),
      h('circle', { cx: 12, cy: 12, r: 2 })
    ])
  }
}
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

/* Admin Switch Styling */
.admin-badge-switch {
  padding: 0.5rem 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-light);
  transition: var(--transition-smooth);
}

.admin-badge-switch.admin-active {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.04);
}

.switch-label {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.switch-label input {
  display: none;
}

.switch-custom {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-muted);
}

.admin-active .switch-custom {
  color: #f87171; /* red-400 */
}

/* Stats Cards Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
}

.stat-icon-wrapper {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon {
  width: 2rem;
  height: 2rem;
}

.stat-details {
  flex-grow: 1;
}

.stat-details h3 {
  font-size: 1rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.1rem;
}

.stat-meta {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 0.75rem;
}

.progress-bar-bg {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease-out;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  padding: 1.25rem;
  margin-bottom: 2rem;
  gap: 1.25rem;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex-grow: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.2rem;
  height: 1.2rem;
  color: var(--text-muted);
}

.search-box .input-text {
  padding-left: 2.5rem;
}

.filter-dropdowns {
  display: flex;
  gap: 0.85rem;
  align-items: center;
  flex-wrap: wrap;
}

@media (min-width: 901px) {
  .filter-dropdowns {
    flex-wrap: nowrap;
  }
}

.filter-dropdowns select {
  min-width: 150px;
  max-width: 220px;
}

.btn-icon-only {
  width: 42px;
  height: 42px;
  padding: 0;
}

/* School List Section */
.school-list-section {
  padding: 2rem;
  margin-bottom: 3rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.table-header h2 {
  font-size: 1.4rem;
}

.text-center {
  text-align: center;
}

.delete-btn {
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #f87171;
  padding: 0.4rem;
  border-radius: 6px;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
  transform: scale(1.1);
}

/* Lock/Unlock elements */
.btn-lock-wrapper {
  position: relative;
  display: inline-block;
}

.admin-lock-toggle {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid var(--border-light);
  background: #ef4444;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-smooth);
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.admin-lock-toggle.unlocked {
  background: #10b981;
}

.admin-lock-toggle:hover {
  transform: scale(1.2);
}

.status-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.progress-lbl {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
}

.assessor-lbl {
  font-size: 0.7rem;
  color: #a5b4fc;
  font-weight: 600;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Mobile view card grid */
.mobile-card {
  padding: 1.5rem;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.school-card-info h3 {
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
}

.school-card-info p {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.dmc-badge {
  display: inline-block;
  background: var(--color-primary-glow);
  color: #a5b4fc;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-actions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  border-top: 1px solid var(--border-light);
  padding-top: 1rem;
}

.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-light);
  padding: 0.75rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  position: relative;
}

.action-item .label {
  font-size: 0.9rem;
}

.mobile-assessor-tag {
  font-size: 0.75rem;
  color: #a5b4fc;
  margin-right: 0.5rem;
}

.lock-indicator-mob {
  font-size: 0.8rem;
  margin-right: 0.4rem;
}

.status-indicator-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: 0 0 8px currentColor;
}

.status-indicator-dot.status-pending { background-color: var(--color-pending); color: var(--color-pending); }
.status-indicator-dot.status-draft { background-color: var(--color-warning); color: var(--color-warning); }
.status-indicator-dot.status-completed { background-color: var(--color-success); color: var(--color-success); }

@media (max-width: 900px) {
  .dashboard-header {
    padding: 1.25rem;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
  }
  
  .header-logo-title {
    flex-direction: column;
    gap: 1rem;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: 100%;
  }

  .filter-dropdowns {
    width: 100%;
  }

  .filter-dropdowns select {
    flex-grow: 1;
    max-width: 100%;
  }
}
/* Print PDF report buttons */
.print-report-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-light);
  color: #a5b4fc;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-smooth);
  font-size: 0.85rem;
}

.print-report-btn:hover {
  background: var(--color-primary-glow);
  border-color: var(--color-primary);
  color: white;
  transform: scale(1.15);
}

.print-report-btn-mob {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-light);
  color: #a5b4fc;
  padding: 0.2rem 0.45rem;
  border-radius: 6px;
  font-size: 0.8rem;
  margin-right: 0.5rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-smooth);
}

.print-report-btn-mob:hover {
  background: var(--color-primary-glow);
  border-color: var(--color-primary);
  color: white;
}
</style>
