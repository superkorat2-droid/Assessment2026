<template>
  <div class="container fade-in">
    <!-- Header with OBEC logo -->
    <header class="dashboard-header glass-panel" style="margin-bottom: 1.5rem; justify-content: space-between; flex-wrap: wrap;">
      <div class="header-logo-title">
        <img src="/obec_logo.png" alt="สพฐ Logo" class="obec-logo" style="height: 70px;" />
        <div class="header-main">
          <h1 class="gradient-text" style="font-size: 1.8rem; margin-bottom: 0.2rem;">
            <span style="display: inline-block;">นิเทศและติดตาม</span><span style="display: inline-block;">ความพร้อมโรงเรียน</span>
          </h1>
          <p class="subtitle" style="font-size: 0.9rem;">สำนักงานเขตพื้นที่การศึกษาประถมศึกษานครราชสีมา เขต 2</p>
        </div>
      </div>
      <div class="back-nav" style="margin-bottom: 0; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
        <!-- Theme & Admin Switcher Group -->
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <!-- Theme toggle button -->
          <button @click="toggleTheme" class="btn btn-secondary" style="padding: 0.5rem; border-radius: 12px; height: 38px; width: 38px; display: flex; align-items: center; justify-content: center;" title="สลับธีม สว่าง/มืด">
            <span v-if="isLightTheme" style="font-size: 1.2rem; line-height: 1;">☀️</span>
            <span v-else style="font-size: 1.2rem; line-height: 1;">🌙</span>
          </button>

          <!-- Admin Mode Switcher -->
          <div class="admin-badge-switch" :class="{ 'admin-active': isAdminMode }" style="padding: 0.4rem 0.8rem; margin: 0;">
            <label class="switch-label">
              <input type="checkbox" v-model="isAdminMode" />
              <span class="switch-custom" style="font-size: 0.85rem;">
                <span class="switch-icon" v-if="isAdminMode">🔓 Admin Mode (เปิด)</span>
                <span class="switch-icon" v-else>🔒 ผู้ดูแลระบบ/จัดการข้อมูล</span>
              </span>
            </label>
          </div>
        </div>

        <NuxtLink to="/" class="btn btn-secondary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.2rem; height: 1.2rem;">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          กลับหน้าแรก Dashboard
        </NuxtLink>
      </div>
    </header>

    <!-- School Header Card -->
    <section class="school-header-card glass-panel" v-if="schoolInfo">
      <div class="school-metadata">
        <span class="dmc-tag">DMC: {{ schoolInfo.dmc_code }}</span>
        <h2>{{ schoolInfo.name }}</h2>
        <div class="meta-row">
          <span><strong>อำเภอ:</strong> {{ schoolInfo.district }}</span>
          <span><strong>ตำบล:</strong> {{ schoolInfo.subdistrict }}</span>
          <span><strong>ศูนย์เครือข่าย:</strong> {{ schoolInfo.school_group }}</span>
        </div>
      </div>
      <div class="assessor-section">
        <label for="assessor">ศึกษานิเทศก์ผู้กรอกแบบนิเทศนี้:</label>
        <input 
          type="text" 
          id="assessor" 
          v-model="assessorName" 
          placeholder="ระบุชื่อผู้ประเมิน..." 
          class="input-text"
          :disabled="isReadOnly"
        />
      </div>
    </section>

    <!-- Peer Supervisor Collaboration Tracker -->
    <section class="peer-status-panel glass-panel" v-if="schoolInfo">
      <h4>👥 สถานะการประเมินแยกตามแบบนิเทศ (คณะศึกษานิเทศก์ร่วมตรวจ)</h4>
      <div class="peer-grid">
        <div class="peer-item" v-for="t in tabs" :key="t.id" :class="{ active: activeForm === t.id }">
          <span class="peer-title">{{ t.title }}</span>
          <div class="peer-meta">
            <span class="status-badge-inline" :class="getStatusClass(assessmentState['status_' + t.id])">
              {{ getStatusLabel(assessmentState['status_' + t.id]) }}
            </span>
            <span class="peer-assessor" v-if="assessmentState['assessor_' + t.id]" :title="assessmentState['assessor_' + t.id]">
              โดย: {{ assessmentState['assessor_' + t.id] }}
            </span>
            <span class="peer-assessor empty" v-else>(ยังไม่มีผู้ทำ)</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Form Navigation Tabs -->
    <nav class="form-tabs-container glass-panel">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-btn" 
        :class="{ active: activeForm === tab.id }"
        @click="switchForm(tab.id)"
      >
        <component :is="tab.icon" class="tab-icon" />
        <span class="tab-title">{{ tab.title }}</span>
        <span class="tab-status-dot" :class="getStatusClass(assessmentState['status_' + tab.id])"></span>
      </button>
    </nav>

    <!-- Active Assessment Form -->
    <main class="assessment-form-main glass-panel" v-if="schoolInfo">
      <div class="form-header">
        <h2>{{ activeFormTitle }}</h2>
        <span class="status-badge" :class="getStatusClass(assessmentState['status_' + activeForm])">
          สถานะ: {{ getStatusLabel(assessmentState['status_' + activeForm]) }}
        </span>
      </div>

      <!-- Admin Control Panel inside [dmc].vue -->
      <div v-if="isAdminMode" class="admin-control-bar glass-card" style="border: 1px dashed rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.04); padding: 1.25rem 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 1.5rem;">🔧</span>
            <div>
              <h4 style="color: #f87171; margin: 0 0 0.15rem; font-size: 1.1rem; font-weight: 600;">แผงควบคุมระบบสำหรับผู้ดูแลระบบ (Admin)</h4>
              <p style="color: var(--text-muted); margin: 0; font-size: 0.85rem;">จัดการสถานะล็อกและข้อมูลการประเมินของแบบนิเทศหัวข้อนี้</p>
            </div>
          </div>
          <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
            <!-- Toggle lock/unlock -->
            <button 
              @click="toggleFormLockOnPage" 
              class="btn" 
              :class="assessmentState['unlocked_' + activeForm] ? 'btn-secondary' : 'btn-primary'"
              style="padding: 0.5rem 1rem; font-size: 0.9rem;"
            >
              <span v-if="assessmentState['unlocked_' + activeForm]">🔒 ล็อกการแก้ไขฟอร์มนี้</span>
              <span v-else>🔓 ปลดล็อกให้แก้ไขฟอร์มนี้</span>
            </button>
            <!-- Reset/Delete form -->
            <button 
              @click="resetFormOnPage" 
              class="btn" 
              style="background: rgba(239, 68, 68, 0.2); border-color: #ef4444; color: #f87171; padding: 0.5rem 1rem; font-size: 0.9rem;"
            >
              🗑️ รีเซ็ตเฉพาะฟอร์มนี้
            </button>
            <!-- Print PDF report button -->
            <button 
              v-if="assessmentState['status_' + activeForm] !== 'pending'"
              @click="printCurrentFormReport"
              class="btn"
              style="background: rgba(59, 130, 246, 0.2); border-color: #3b82f6; color: #60a5fa; padding: 0.5rem 1rem; font-size: 0.9rem;"
            >
              🖨️ พิมพ์รายงาน PDF
            </button>
          </div>
        </div>
      </div>

      <!-- Locked Warning Banner -->
      <div v-if="isReadOnly" class="instruction-guide glass-card" style="border-left-color: #ef4444; background: rgba(239,68,68,0.04); margin-bottom: 2rem;">
        <h4 style="color: #f87171;">🔒 แบบประเมินนี้อยู่ในสถานะล็อกการแก้ไข (อ่านเท่านั้น)</h4>
        <p>คุณส่งผลประเมินฉบับสมบูรณ์แล้ว หากต้องการแก้ไขข้อมูลใดๆ กรุณาติดต่อผู้ดูแลระบบ (Admin) เพื่อขออนุมัติปลดล็อก</p>
      </div>

      <!-- FORM 1: ความพร้อมเปิดภาคเรียน (ตอนที่ 2) -->
      <div v-if="activeForm === 'form_1'" class="form-content">
        <div class="instruction-guide glass-card">
          <h4>💡 คำชี้แจงสำหรับแบบประเมินความพร้อม</h4>
          <p>ให้พิจารณาตามรายการ และตรวจสอบการปฏิบัติงานตามหลักฐาน/เอกสาร/ร่องรอย จากการบันทึกวิธีการดำเนินการ ที่มาของหลักฐาน แล้วทำการเลือกสถานะการปฏิบัติงาน พร้อมกรอกระบุร่องรอย/หลักฐานอ้างอิง</p>
        </div>

        <!-- ข้อมูลทั่วไป & ข้อมูลผู้บริหาร (๑.๑ & ๑.๒) -->
        <div class="form-section glass-card" style="padding: 2rem; margin-bottom: 2rem; border-left: 4px solid var(--color-secondary);">
          <h3 style="color: #a5b4fc; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 1.25rem;">
            <span>📝</span> ตอนที่ 1: ข้อมูลพื้นฐานสถานศึกษา
          </h3>
          
          <h4 style="color: var(--text-main); font-size: 1.1rem; margin-bottom: 1rem; font-weight: 600;">๑.๑ ข้อมูลทั่วไป</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
            <div class="evidence-input">
              <label>ชื่อสถานศึกษา:</label>
              <input type="text" :value="schoolInfo?.name" class="input-text" disabled style="background: rgba(255, 255, 255, 0.05); color: var(--text-muted);" />
            </div>
            <div class="evidence-input">
              <label>ศูนย์เครือข่าย/อำเภอ:</label>
              <input type="text" :value="`${schoolInfo?.school_group} / อ.${schoolInfo?.district}`" class="input-text" disabled style="background: rgba(255, 255, 255, 0.05); color: var(--text-muted);" />
            </div>
            <div class="evidence-input">
              <label>เปิดสอนระดับ:</label>
              <input type="text" v-model="formData.form_1_basic_info.level_from" placeholder="เช่น อนุบาล 2..." class="input-text" :disabled="isReadOnly" />
            </div>
            <div class="evidence-input">
              <label>ถึงระดับ:</label>
              <input type="text" v-model="formData.form_1_basic_info.level_to" placeholder="เช่น ประถมศึกษาปีที่ 6..." class="input-text" :disabled="isReadOnly" />
            </div>
            <div class="evidence-input">
              <label>ชื่อ-สกุล ผู้ให้ข้อมูล:</label>
              <input type="text" v-model="formData.form_1_basic_info.informer_name" placeholder="ระบุชื่อผู้ให้ข้อมูล..." class="input-text" :disabled="isReadOnly" />
            </div>
            <div class="evidence-input">
              <label>ตำแหน่ง:</label>
              <input type="text" v-model="formData.form_1_basic_info.informer_position" placeholder="ระบุตำแหน่ง..." class="input-text" :disabled="isReadOnly" />
            </div>
            <div class="evidence-input">
              <label>วันที่ให้ข้อมูล:</label>
              <input type="date" v-model="formData.form_1_basic_info.informer_date" class="input-text" :disabled="isReadOnly" />
            </div>
          </div>

          <h4 style="color: var(--text-main); font-size: 1.1rem; margin-bottom: 1rem; font-weight: 600; border-top: 1px solid var(--border-light); padding-top: 1.5rem;">๑.๒ ข้อมูลผู้บริหารสถานศึกษา</h4>
          
          <!-- Director Section -->
          <div style="background: rgba(255, 255, 255, 0.01); border: 1px solid var(--border-light); padding: 1.25rem; border-radius: 10px; margin-bottom: 1.5rem;">
            <div style="display: flex; gap: 1.5rem; margin-bottom: 1rem; align-items: center; flex-wrap: wrap;">
              <label class="radio-label" style="flex-grow: 0; min-width: auto;">
                <input type="radio" value="ผอ.รร." v-model="formData.form_1_basic_info.director_type" :disabled="isReadOnly" />
                <span class="radio-custom done" style="padding: 0.35rem 0.75rem; border-radius: 20px;">ผอ.รร.</span>
              </label>
              <label class="radio-label" style="flex-grow: 0; min-width: auto;">
                <input type="radio" value="รก.ผอ.รร." v-model="formData.form_1_basic_info.director_type" :disabled="isReadOnly" />
                <span class="radio-custom done" style="padding: 0.35rem 0.75rem; border-radius: 20px;">รก.ผอ.รร.</span>
              </label>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
              <div class="evidence-input">
                <label>ชื่อ:</label>
                <input type="text" v-model="formData.form_1_basic_info.director_name" placeholder="ระบุชื่อจริง..." class="input-text" :disabled="isReadOnly" />
              </div>
              <div class="evidence-input">
                <label>นามสกุล:</label>
                <input type="text" v-model="formData.form_1_basic_info.director_lastname" placeholder="ระบุนามสกุล..." class="input-text" :disabled="isReadOnly" />
              </div>
              <div class="evidence-input">
                <label>เบอร์มือถือ:</label>
                <input type="text" v-model="formData.form_1_basic_info.director_phone" placeholder="ระบุเบอร์โทรศัพท์..." class="input-text" :disabled="isReadOnly" />
              </div>
            </div>
          </div>

          <!-- Deputy Section -->
          <div style="border: 1px dashed var(--border-light); padding: 1.25rem; border-radius: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h5 style="margin: 0; color: #a5b4fc; font-weight: 500;">รองผู้อำนวยการโรงเรียน (ถ้ามี)</h5>
              <button 
                type="button" 
                @click="addDeputy" 
                class="btn btn-secondary" 
                style="padding: 0.35rem 0.75rem; font-size: 0.85rem; height: auto;" 
                :disabled="isReadOnly"
              >
                ➕ เพิ่มรอง ผอ.
              </button>
            </div>

            <div v-if="formData.form_1_basic_info.deputies && formData.form_1_basic_info.deputies.length > 0" style="display: flex; flex-direction: column; gap: 1rem;">
              <div 
                v-for="(deputy, index) in formData.form_1_basic_info.deputies" 
                :key="index"
                style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) 45px; gap: 1rem; align-items: flex-end; background: rgba(255, 255, 255, 0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-light);"
              >
                <div class="evidence-input">
                  <label>ชื่อรอง ผอ. (คนที่ {{ index + 1 }}):</label>
                  <input type="text" v-model="deputy.name" placeholder="ระบุชื่อจริง..." class="input-text" :disabled="isReadOnly" />
                </div>
                <div class="evidence-input">
                  <label>นามสกุล:</label>
                  <input type="text" v-model="deputy.lastname" placeholder="ระบุนามสกุล..." class="input-text" :disabled="isReadOnly" />
                </div>
                <div class="evidence-input">
                  <label>เบอร์มือถือ:</label>
                  <input type="text" v-model="deputy.phone" placeholder="ระบุเบอร์โทรศัพท์..." class="input-text" :disabled="isReadOnly" />
                </div>
                <button 
                  type="button" 
                  @click="removeDeputy(index)" 
                  class="btn" 
                  style="background: rgba(239, 68, 68, 0.2); border-color: #ef4444; color: #f87171; height: 38px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 8px;"
                  title="ลบรองผู้อำนวยการท่านนี้"
                  :disabled="isReadOnly"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div v-else style="text-align: center; padding: 1rem; color: var(--text-muted); font-size: 0.9rem; font-style: italic;">
              ไม่มีข้อมูลรองผู้อำนวยการโรงเรียน (คลิกปุ่มด้านบนเพื่อเพิ่มหากมี)
            </div>
          </div>
        </div>

        <div v-for="section in form1Structure" :key="section.title" class="form-section">
          <h3 class="section-title">{{ section.title }}</h3>
          
          <div class="questions-list">
            <div v-for="item in section.items" :key="item.id" class="question-card glass-card">
              <div class="q-header">
                <span class="q-id">{{ item.id }}</span>
                <p class="q-text">{{ item.text }}</p>
              </div>
              
              <!-- Standard Evaluation options for all questions -->
              <div class="evaluation-options">
                <label class="radio-label">
                  <input type="radio" :name="'f1-' + item.id" value="done" v-model="formData.form_1[item.id].status" :disabled="isReadOnly" />
                  <span class="radio-custom done">ดำเนินการแล้ว</span>
                </label>
                <label class="radio-label">
                  <input type="radio" :name="'f1-' + item.id" value="in_progress" v-model="formData.form_1[item.id].status" :disabled="isReadOnly" />
                  <span class="radio-custom in-progress">อยู่ระหว่างดำเนินการ</span>
                </label>
                <label class="radio-label">
                  <input type="radio" :name="'f1-' + item.id" value="not_done" v-model="formData.form_1[item.id].status" :disabled="isReadOnly" />
                  <span class="radio-custom pending">ยังไม่ดำเนินการ</span>
                </label>
              </div>

              <!-- Custom Input Widget for 1.8 -->
              <div v-if="item.id === '1.8'" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-light); width: 100%;">
                <div style="display: flex; gap: 0.75rem; align-items: center;">
                  <label class="radio-label" style="flex: none;">
                    <input type="radio" :name="'f1-completeness-' + item.id" value="yes" v-model="formData.form_1[item.id].completeness" @change="update18Status" :disabled="isReadOnly" />
                    <span class="radio-custom done" style="padding: 0.35rem 1rem; font-size: 0.9rem; min-width: 80px; justify-content: center;">ครบ</span>
                  </label>
                  <label class="radio-label" style="flex: none;">
                    <input type="radio" :name="'f1-completeness-' + item.id" value="no" v-model="formData.form_1[item.id].completeness" @change="update18Status" :disabled="isReadOnly" />
                    <span class="radio-custom pending" style="padding: 0.35rem 1rem; font-size: 0.9rem; min-width: 80px; justify-content: center;">ไม่ครบ</span>
                  </label>
                </div>
                
                <div v-if="formData.form_1[item.id].completeness === 'no'" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-top: 0.5rem; width: 100%;">
                  <div class="evidence-input" style="margin-top: 0;">
                    <label style="font-size: 0.85rem;">เนื่องจาก (เหตุผลที่ไม่ครบ):</label>
                    <input type="text" v-model="formData.form_1[item.id].reason" placeholder="ระบุเหตุผล..." class="input-text" :disabled="isReadOnly" style="padding: 0.4rem 0.8rem; font-size: 0.9rem;" />
                  </div>
                  <div class="evidence-input" style="margin-top: 0;">
                    <label style="font-size: 0.85rem;">คาดว่าจะครบวันที่:</label>
                    <input type="text" v-model="formData.form_1[item.id].expected_date" placeholder="เช่น 15 มิ.ย. 2569..." class="input-text" :disabled="isReadOnly" style="padding: 0.4rem 0.8rem; font-size: 0.9rem;" />
                  </div>
                </div>
              </div>

              <!-- Custom Input Widget for 4.1.10 -->
              <div v-else-if="item.id === '4.1.10'" style="margin-top: 1rem; display: flex; gap: 1rem; flex-wrap: wrap; width: 100%;">
                <label class="checkbox-label" style="flex-grow: 1; flex-basis: 0; min-width: 140px; cursor: pointer;">
                  <input type="checkbox" v-model="formData.form_1[item.id].has_safe_playground" @change="update4110Status" style="display: none;" :disabled="isReadOnly" />
                  <span class="radio-custom done" :style="formData.form_1[item.id].has_safe_playground ? 'background-color: var(--color-success-bg); border-color: var(--color-success); color: var(--color-success); box-shadow: 0 0 10px rgba(16, 185, 129, 0.2); font-size: 0.9rem; padding: 0.4rem 0.8rem;' : 'font-size: 0.9rem; padding: 0.4rem 0.8rem;'">
                    {{ formData.form_1[item.id].has_safe_playground ? '✓ มีเครื่องเล่นปลอดภัย' : 'มีเครื่องเล่นปลอดภัย' }}
                  </span>
                </label>
                <label class="checkbox-label" style="flex-grow: 1; flex-basis: 0; min-width: 140px; cursor: pointer;">
                  <input type="checkbox" v-model="formData.form_1[item.id].has_fence" @change="update4110Status" style="display: none;" :disabled="isReadOnly" />
                  <span class="radio-custom done" :style="formData.form_1[item.id].has_fence ? 'background-color: var(--color-success-bg); border-color: var(--color-success); color: var(--color-success); box-shadow: 0 0 10px rgba(16, 185, 129, 0.2); font-size: 0.9rem; padding: 0.4rem 0.8rem;' : 'font-size: 0.9rem; padding: 0.4rem 0.8rem;'">
                    {{ formData.form_1[item.id].has_fence ? '✓ มีแนวรั้วกั้นสนามเด็กเล่น' : 'มีแนวรั้วกั้นสนามเด็กเล่น' }}
                  </span>
                </label>
              </div>

              <!-- Custom Input Widget for 4.2.4 -->
              <div v-else-if="item.id === '4.2.4'" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; width: 100%;">
                <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
                  <label class="radio-label" style="flex: none;">
                    <input type="radio" :name="'f1-has-cctv-' + item.id" value="yes" v-model="formData.form_1[item.id].has_cctv" @change="update424Status" :disabled="isReadOnly" />
                    <span class="radio-custom done" style="padding: 0.35rem 1rem; font-size: 0.9rem; min-width: 140px; justify-content: center;">มีกล้องวงจรปิด</span>
                  </label>
                  <label class="radio-label" style="flex: none;">
                    <input type="radio" :name="'f1-has-cctv-' + item.id" value="no" v-model="formData.form_1[item.id].has_cctv" @change="update424Status" :disabled="isReadOnly" />
                    <span class="radio-custom pending" style="padding: 0.35rem 1rem; font-size: 0.9rem; min-width: 140px; justify-content: center;">ไม่มีกล้องวงจรปิด</span>
                  </label>
                </div>
                
                <div v-if="formData.form_1[item.id].has_cctv === 'yes'" style="display: flex; align-items: center; gap: 0.75rem; margin-top: 0.5rem; background: rgba(255,255,255,0.02); padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid var(--border-light); max-width: 320px;">
                  <span style="font-size: 0.9rem; color: var(--text-muted);">จำนวนกล้องที่พร้อมใช้งาน:</span>
                  <input type="number" v-model="formData.form_1[item.id].camera_count" @input="update424Status" placeholder="ระบุ..." class="input-text text-center" style="width: 80px; padding: 0.3rem;" :disabled="isReadOnly" />
                  <span style="font-size: 0.9rem; color: var(--text-muted);">ตัว</span>
                </div>
              </div>

              <!-- Custom Input Widget for 4.3.8 -->
              <div v-else-if="item.id === '4.3.8'" style="margin-top: 1rem; display: flex; gap: 1rem; flex-wrap: wrap; width: 100%;">
                <label class="checkbox-label" style="flex-grow: 1; flex-basis: 0; min-width: 140px; cursor: pointer;">
                  <input type="checkbox" v-model="formData.form_1[item.id].milk_box" @change="update438Status" style="display: none;" :disabled="isReadOnly" />
                  <span class="radio-custom done" :style="formData.form_1[item.id].milk_box ? 'background-color: var(--color-success-bg); border-color: var(--color-success); color: var(--color-success); box-shadow: 0 0 10px rgba(16, 185, 129, 0.2); font-size: 0.9rem; padding: 0.4rem 0.8rem;' : 'font-size: 0.9rem; padding: 0.4rem 0.8rem;'">
                    {{ formData.form_1[item.id].milk_box ? '✓ นมกล่อง' : 'นมกล่อง' }}
                  </span>
                </label>
                <label class="checkbox-label" style="flex-grow: 1; flex-basis: 0; min-width: 140px; cursor: pointer;">
                  <input type="checkbox" v-model="formData.form_1[item.id].milk_bag" @change="update438Status" style="display: none;" :disabled="isReadOnly" />
                  <span class="radio-custom done" :style="formData.form_1[item.id].milk_bag ? 'background-color: var(--color-success-bg); border-color: var(--color-success); color: var(--color-success); box-shadow: 0 0 10px rgba(16, 185, 129, 0.2); font-size: 0.9rem; padding: 0.4rem 0.8rem;' : 'font-size: 0.9rem; padding: 0.4rem 0.8rem;'">
                    {{ formData.form_1[item.id].milk_bag ? '✓ นมถุง' : 'นมถุง' }}
                  </span>
                </label>
              </div>

              <!-- Evidence Text input -->
              <div class="evidence-input">
                <label>ร่องรอย / หลักฐานอ้างอิง:</label>
                <input type="text" v-model="formData.form_1[item.id].evidence" placeholder="ระบุหลักฐาน..." class="input-text" :disabled="isReadOnly" />
              </div>
            </div>
          </div>
        </div>

        <!-- Section summary comment fields -->
        <div class="form-section feedback-section">
          <h3 class="section-title">สรุปผลเพิ่มเติมท้ายแบบประเมินความพร้อม</h3>
          <div class="feedback-grid">
            <div class="feedback-field">
              <label>จุดเด่นของโรงเรียน:</label>
              <textarea v-model="formData.form_1_feedback.strengths" placeholder="พิมพ์จุดเด่น..." class="input-text textarea-input" :disabled="isReadOnly"></textarea>
            </div>
            <div class="feedback-field">
              <label>จุดที่ควรพัฒนาของโรงเรียน:</label>
              <textarea v-model="formData.form_1_feedback.improvements" placeholder="พิมพ์จุดที่ควรพัฒนา..." class="input-text textarea-input" :disabled="isReadOnly"></textarea>
            </div>
            <div class="feedback-field">
              <label>สิ่งที่โรงเรียนมีความต้องการพัฒนาหรือแก้ปัญหา:</label>
              <textarea v-model="formData.form_1_feedback.needs" placeholder="ระบุความต้องการความช่วยเหลือ..." class="input-text textarea-input" :disabled="isReadOnly"></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- FORM 2: จุดเน้นเขตพื้นที่ฯ (ตอนที่ 3) -->
      <div v-else-if="activeForm === 'form_2'" class="form-content">
        <!-- Section 2.1 & 2.2: Reading & Writing / Calculation -->
        <div v-for="section in form2CoreStructure" :key="section.key" class="form-section">
          <h3 class="section-title">{{ section.title }}</h3>

          <!-- Basic Info block for 2.1 or 2.2 -->
          <div class="glass-card" style="padding: 1.25rem; border-radius: 12px; margin-bottom: 1.5rem; border: 1px solid var(--border-light); background: rgba(255, 255, 255, 0.01);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
              <h5 style="margin: 0; color: #a5b4fc; font-weight: 500; font-size: 0.95rem;">ข้อมูลผู้ให้ข้อมูล / ผู้รับการนิเทศ</h5>
              <!-- Copy button for 2.2 -->
              <button 
                v-if="section.key === 'math_calculation'"
                type="button" 
                @click="copyFromReadingWriting('math')" 
                class="btn btn-secondary" 
                style="padding: 0.25rem 0.6rem; font-size: 0.8rem; height: auto;" 
                :disabled="isReadOnly"
              >
                📋 ดึงข้อมูลจาก 2.1 (ถ้าเป็นคนเดียวกัน)
              </button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
              <div class="evidence-input">
                <label>ชื่อสถานศึกษา:</label>
                <input type="text" :value="schoolInfo?.name" class="input-text" disabled style="background: rgba(255, 255, 255, 0.05); color: var(--text-muted);" />
              </div>
              <div class="evidence-input">
                <label>ผู้รับการนิเทศ:</label>
                <input 
                  type="text" 
                  v-model="formData.form_2[section.key + '_info'].responder_name" 
                  placeholder="ระบุชื่อผู้รับการนิเทศ..." 
                  class="input-text" 
                  :disabled="isReadOnly" 
                />
              </div>
              <div class="evidence-input">
                <label>ตำแหน่ง:</label>
                <input 
                  type="text" 
                  v-model="formData.form_2[section.key + '_info'].responder_position" 
                  placeholder="ระบุตำแหน่ง..." 
                  class="input-text" 
                  :disabled="isReadOnly" 
                />
              </div>
              <div class="evidence-input">
                <label>วัน/เดือน/ปี:</label>
                <input 
                  type="date" 
                  v-model="formData.form_2[section.key + '_info'].responder_date" 
                  class="input-text" 
                  :disabled="isReadOnly" 
                />
              </div>
            </div>
          </div>

          <div class="questions-list">
            <div v-for="item in section.items" :key="section.key + '-' + item.id" class="question-card glass-card">
              <div class="q-header">
                <span class="q-id">{{ item.id }}</span>
                <p class="q-text">{{ item.text }}</p>
              </div>

              <!-- Options -->
              <div class="evaluation-options">
                <label class="radio-label">
                  <input type="radio" :name="'f2-' + section.key + '-' + item.id" :value="true" v-model="formData.form_2[section.key][item.id].has_data" :disabled="isReadOnly" />
                  <span class="radio-custom done">มี</span>
                </label>
                <label class="radio-label">
                  <input type="radio" :name="'f2-' + section.key + '-' + item.id" :value="false" v-model="formData.form_2[section.key][item.id].has_data" :disabled="isReadOnly" />
                  <span class="radio-custom pending">ไม่มี</span>
                </label>
              </div>

              <!-- Source -->
              <div class="evidence-input">
                <label>แหล่งข้อมูล / เอกสารหลักฐาน:</label>
                <input type="text" v-model="formData.form_2[section.key][item.id].source" :placeholder="item.sourcePlaceholder" class="input-text" :disabled="isReadOnly" />
              </div>
            </div>
          </div>

          <!-- Section feedback feedback -->
          <div class="feedback-grid" style="margin-top: 1.5rem;">
            <div class="feedback-field">
              <label>จุดเด่น / ข้อสังเกต:</label>
              <textarea v-model="formData.form_2_feedback[section.key].strengths" placeholder="พิมพ์จุดเด่น..." class="input-text textarea-input" :disabled="isReadOnly"></textarea>
            </div>
            <div class="feedback-field">
              <label>จุดที่ควรพัฒนา:</label>
              <textarea v-model="formData.form_2_feedback[section.key].improvements" placeholder="พิมพ์จุดที่ควรพัฒนา..." class="input-text textarea-input" :disabled="isReadOnly"></textarea>
            </div>
            <div class="feedback-field">
              <label>ข้อเสนอแนะเพิ่มเติม / แนวทางติดตามครั้งต่อไป:</label>
              <textarea v-model="formData.form_2_feedback[section.key].recommendations" placeholder="พิมพ์ข้อเสนอแนะ..." class="input-text textarea-input" :disabled="isReadOnly"></textarea>
            </div>
          </div>
        </div>

        <!-- Section 2.3: Citizenship Indicators and Attributes -->
        <div class="form-section">
          <h3 class="section-title">การดำเนินงานส่งเสริมคุณลักษณะอันพึงประสงค์ 8 ประการ (ด้านความเป็นพลเมืองดี)</h3>
          
          <!-- Basic Info block for 2.3 -->
          <div class="glass-card" style="padding: 1.25rem; border-radius: 12px; margin-bottom: 1.5rem; border: 1px solid var(--border-light); background: rgba(255, 255, 255, 0.01);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
              <h5 style="margin: 0; color: #a5b4fc; font-weight: 500; font-size: 0.95rem;">ข้อมูลผู้ให้ข้อมูล / ผู้รับการนิเทศ</h5>
              <!-- Copy button for 2.3 -->
              <button 
                type="button" 
                @click="copyFromReadingWriting('citizenship')" 
                class="btn btn-secondary" 
                style="padding: 0.25rem 0.6rem; font-size: 0.8rem; height: auto;" 
                :disabled="isReadOnly"
              >
                📋 ดึงข้อมูลจาก 2.1 (ถ้าเป็นคนเดียวกัน)
              </button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
              <div class="evidence-input">
                <label>ชื่อสถานศึกษา:</label>
                <input type="text" :value="schoolInfo?.name" class="input-text" disabled style="background: rgba(255, 255, 255, 0.05); color: var(--text-muted);" />
              </div>
              <div class="evidence-input">
                <label>ผู้รับการนิเทศ:</label>
                <input 
                  type="text" 
                  v-model="formData.form_2.citizenship_info.responder_name" 
                  placeholder="ระบุชื่อผู้รับการนิเทศ..." 
                  class="input-text" 
                  :disabled="isReadOnly" 
                />
              </div>
              <div class="evidence-input">
                <label>ตำแหน่ง:</label>
                <input 
                  type="text" 
                  v-model="formData.form_2.citizenship_info.responder_position" 
                  placeholder="ระบุตำแหน่ง..." 
                  class="input-text" 
                  :disabled="isReadOnly" 
                />
              </div>
              <div class="evidence-input">
                <label>วัน/เดือน/ปี:</label>
                <input 
                  type="date" 
                  v-model="formData.form_2.citizenship_info.responder_date" 
                  class="input-text" 
                  :disabled="isReadOnly" 
                />
              </div>
            </div>
          </div>

          <!-- Instruction Guide with quality criteria rubric -->
          <div class="instruction-guide glass-card" style="margin-bottom: 2rem;">
            <h4>💡 คำชี้แจงสำหรับการประเมินคุณลักษณะอันพึงประสงค์ 8 ประการ</h4>
            <p style="margin-bottom: 0.75rem;">ประเมินการดำเนินงานของผู้สอน/สถานศึกษาในการส่งเสริมคุณลักษณะอันพึงประสงค์ ๘ ประการ โดยพิจารณาจากสภาพจริง เอกสารหลักฐาน และการสังเกต</p>
            <div style="border-top: 1px solid var(--border-light); padding-top: 0.75rem; margin-top: 0.75rem;">
              <strong style="color: #a5b4fc; font-size: 0.9rem; display: block; margin-bottom: 0.5rem;">📊 เกณฑ์ระดับคุณภาพ:</strong>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem; font-size: 0.85rem; color: var(--text-muted);">
                <div><strong style="color: #34d399;">๔ = ดีเยี่ยม</strong> (ดำเนินการเป็นระบบ เห็นผลชัดเจน)</div>
                <div><strong style="color: #60a5fa;">๓ = ดี</strong> (ดำเนินการต่อเนื่อง เห็นผล)</div>
                <div><strong style="color: #fbbf24;">๒ = พอใช้</strong> (ดำเนินการบางส่วน)</div>
                <div><strong style="color: #f87171;">๑ = ควรพัฒนา</strong> (ยังไม่ชัดเจน)</div>
              </div>
            </div>
          </div>

          <!-- Indicators -->
          <h4 style="margin: 1.5rem 0 0.75rem; color: #a5b4fc;">2.3.1 ตัวชี้วัดการดำเนินงาน (10 ข้อ)</h4>
          <div class="questions-list">
            <div v-for="item in form2CitizenshipStructure.indicators" :key="'indicator-' + item.id" class="question-card glass-card">
              <div class="q-header">
                <span class="q-id">{{ item.id }}</span>
                <p class="q-text">{{ item.text }}</p>
              </div>

              <!-- Options 4 3 2 1 -->
              <div class="score-selection-row">
                <label v-for="score in [4,3,2,1]" :key="score" class="score-btn-label">
                  <input type="radio" :name="'f2-citizen-ind-' + item.id" :value="score" v-model="formData.form_2.citizenship.indicators[item.id].score" :disabled="isReadOnly" />
                  <span class="score-btn" :class="'score-' + score">{{ score }}</span>
                </label>
              </div>

              <div class="evidence-input">
                <label>ร่องรอย / หลักฐานอ้างอิง:</label>
                <input type="text" v-model="formData.form_2.citizenship.indicators[item.id].evidence" :placeholder="item.evidencePlaceholder" class="input-text" :disabled="isReadOnly" />
              </div>
            </div>
          </div>

          <!-- Attributes (8 Desired Attributes) -->
          <h4 style="margin: 2rem 0 0.75rem; color: #a5b4fc;">2.3.2 คุณลักษณะอันพึงประสงค์ 8 ประการ</h4>
          <div class="questions-list">
            <div v-for="item in form2CitizenshipStructure.attributes" :key="'attribute-' + item.id" class="question-card glass-card">
              <div class="q-header">
                <span class="q-id">{{ item.id }}</span>
                <p class="q-text"><strong>คุณลักษณะ:</strong> {{ item.text }}</p>
              </div>
              <p class="q-subtext" style="font-size:0.85rem; color:var(--text-muted); margin-bottom: 0.5rem;"><strong>การดำเนินงาน:</strong> {{ item.desc }}</p>

              <!-- Options 4 3 2 1 -->
              <div class="score-selection-row">
                <label v-for="score in [4,3,2,1]" :key="score" class="score-btn-label">
                  <input type="radio" :name="'f2-citizen-attr-' + item.id" :value="score" v-model="formData.form_2.citizenship.attributes[item.id].score" :disabled="isReadOnly" />
                  <span class="score-btn" :class="'score-' + score">{{ score }}</span>
                </label>
              </div>

              <div class="evidence-input">
                <label>ร่องรอย / หลักฐานอ้างอิง:</label>
                <input type="text" v-model="formData.form_2.citizenship.attributes[item.id].evidence" :placeholder="item.evidencePlaceholder" class="input-text" :disabled="isReadOnly" />
              </div>
            </div>
          </div>

          <!-- Section feedback feedback -->
          <div class="feedback-grid" style="margin-top: 1.5rem;">
            <div class="feedback-field">
              <label>จุดเด่น / ข้อสังเกต:</label>
              <textarea v-model="formData.form_2_feedback.citizenship.strengths" placeholder="พิมพ์จุดเด่น..." class="input-text textarea-input" :disabled="isReadOnly"></textarea>
            </div>
            <div class="feedback-field">
              <label>จุดที่ควรพัฒนา:</label>
              <textarea v-model="formData.form_2_feedback.citizenship.improvements" placeholder="พิมพ์จุดที่ควรพัฒนา..." class="input-text textarea-input" :disabled="isReadOnly"></textarea>
            </div>
            <div class="feedback-field">
              <label>ข้อเสนอแนะเพิ่มเติม / แนวทางติดตามครั้งต่อไป:</label>
              <textarea v-model="formData.form_2_feedback.citizenship.recommendations" placeholder="พิมพ์ข้อเสนอแนะ..." class="input-text textarea-input" :disabled="isReadOnly"></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- FORM 3: การประกันภายใน (ตอนที่ 4) -->
      <div v-else-if="activeForm === 'form_3'" class="form-content">
        <div class="instruction-guide glass-card">
          <h4>💡 คำแนะนำสำหรับการประเมินการประกันคุณภาพการศึกษาภายใน</h4>
          <p>ประเมินการดำเนินงานแบ่งออกเป็น 6 องค์ประกอบหลัก ให้เลือกระดับคะแนนคุณภาพ (1 ถึง 5): 5 = ยอดเยี่ยม, 4 = ดีเลิศ, 3 = ดี, 2 = ปานกลาง, 1 = กำลังพัฒนา และกรอกเอกสารหลักฐานประกอบการประเมิน</p>
        </div>

        <!-- ตอนที่ 1: ข้อมูลพื้นฐาน (Form 3) -->
        <div class="form-section glass-card" style="padding: 2rem; margin-bottom: 2rem; border-left: 4px solid var(--color-secondary);">
          <h3 style="color: #a5b4fc; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 1.25rem;">
            <span>📝</span> ตอนที่ 1: ข้อมูลพื้นฐานสถานศึกษา
          </h3>
          
          <!-- Grid 1: ข้อมูลทั่วไป -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            <div class="evidence-input">
              <label>1. ชื่อโรงเรียน:</label>
              <input type="text" :value="schoolInfo?.name" class="input-text" disabled style="background: rgba(255, 255, 255, 0.05); color: var(--text-muted);" />
            </div>
            
            <div class="evidence-input">
              <label>2. ศูนย์เครือข่ายพัฒนาฯ:</label>
              <input type="text" :value="schoolInfo?.school_group" class="input-text" disabled style="background: rgba(255, 255, 255, 0.05); color: var(--text-muted);" />
            </div>

            <div class="evidence-input">
              <label>3. ตำบล / อำเภอ:</label>
              <input type="text" :value="`ต.${schoolInfo?.subdistrict || ''} / อ.${schoolInfo?.district || ''}`" class="input-text" disabled style="background: rgba(255, 255, 255, 0.05); color: var(--text-muted);" />
            </div>

            <div class="evidence-input">
              <label>4. ที่ตั้ง (เลขที่/ถนน/หมู่บ้าน):</label>
              <input type="text" v-model="formData.form_3_basic_info.address" placeholder="ระบุที่ตั้งโรงเรียน..." class="input-text" :disabled="isReadOnly" />
            </div>

            <div class="evidence-input">
              <label>5. โทรศัพท์:</label>
              <input type="text" v-model="formData.form_3_basic_info.phone" placeholder="ระบุเบอร์โทรศัพท์..." class="input-text" :disabled="isReadOnly" />
            </div>

            <div class="evidence-input">
              <label>6. โทรสาร (ถ้ามี):</label>
              <input type="text" v-model="formData.form_3_basic_info.fax" placeholder="ระบุเบอร์โทรสาร..." class="input-text" :disabled="isReadOnly" />
            </div>

            <div class="evidence-input">
              <label>7. E-mail:</label>
              <input type="text" v-model="formData.form_3_basic_info.email" placeholder="ระบุอีเมลโรงเรียน..." class="input-text" :disabled="isReadOnly" />
            </div>

            <div class="evidence-input" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div>
                <label>8. เปิดสอนระดับ:</label>
                <input type="text" v-model="formData.form_3_basic_info.level_from" placeholder="เช่น อนุบาล 2" class="input-text" :disabled="isReadOnly" />
              </div>
              <div>
                <label>ถึงระดับ:</label>
                <input type="text" v-model="formData.form_3_basic_info.level_to" placeholder="เช่น ม.3" class="input-text" :disabled="isReadOnly" />
              </div>
            </div>
          </div>

          <!-- Grid 2: ผู้บริหารและบุคลากร -->
          <h4 style="color: var(--text-main); font-size: 1.1rem; margin-bottom: 1rem; font-weight: 600; border-top: 1px solid var(--border-light); padding-top: 1.5rem;">
            ข้อมูลผู้บริหารและบุคลากร
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            <div class="evidence-input">
              <label>9. ชื่อผู้อำนวยการโรงเรียน (ถ้ามี):</label>
              <input type="text" v-model="formData.form_3_basic_info.director_name" placeholder="ระบุชื่อผู้อำนวยการ..." class="input-text" :disabled="isReadOnly" />
            </div>

            <div class="evidence-input">
              <label>10. ชื่อผู้รักษาการแทน (กรณีไม่มี ผอ.):</label>
              <input type="text" v-model="formData.form_3_basic_info.acting_director_name" placeholder="ระบุชื่อผู้รักษาการแทน..." class="input-text" :disabled="isReadOnly" />
            </div>

            <div class="evidence-input">
              <label>11. จำนวนบุคลากรทางการศึกษา รวม (คน):</label>
              <input type="number" v-model.number="formData.form_3_basic_info.staff_total" placeholder="ระบุจำนวนบุคลากร..." class="input-text" :disabled="isReadOnly" />
            </div>
          </div>

          <!-- Grid 3: นักเรียน -->
          <h4 style="color: var(--text-main); font-size: 1.1rem; margin-bottom: 1rem; font-weight: 600; border-top: 1px solid var(--border-light); padding-top: 1.5rem;">
            12. จำนวนนักเรียน (คน)
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            <div class="evidence-input">
              <label>12.1 ระดับปฐมวัย:</label>
              <input type="number" v-model.number="formData.form_3_basic_info.students_kindergarten" placeholder="จำนวนคน..." class="input-text" :disabled="isReadOnly" />
            </div>

            <div class="evidence-input">
              <label>12.2 ระดับประถมศึกษา:</label>
              <input type="number" v-model.number="formData.form_3_basic_info.students_primary" placeholder="จำนวนคน..." class="input-text" :disabled="isReadOnly" />
            </div>

            <div class="evidence-input">
              <label>12.3 ระดับมัธยมศึกษาตอนต้น:</label>
              <input type="number" v-model.number="formData.form_3_basic_info.students_junior_high" placeholder="จำนวนคน..." class="input-text" :disabled="isReadOnly" />
            </div>

            <div class="evidence-input">
              <label>จำนวนนักเรียน รวมทั้งหมด:</label>
              <input type="number" :value="form3TotalStudentsComputed" class="input-text" disabled style="background: rgba(255, 255, 255, 0.05); color: var(--text-muted); font-weight: bold;" />
            </div>
          </div>

          <!-- Grid 4: ขนาดโรงเรียน -->
          <h4 style="color: var(--text-main); font-size: 1.1rem; margin-bottom: 1rem; font-weight: 600; border-top: 1px solid var(--border-light); padding-top: 1.5rem;">
            13. ขนาดโรงเรียน
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-top: 0.5rem;">
            <label class="radio-label">
              <input type="radio" value="small" v-model="formData.form_3_basic_info.school_size" :disabled="isReadOnly" />
              <span class="radio-custom done" style="flex-direction: column; align-items: flex-start; text-align: left; font-size: 0.85rem; padding: 0.75rem; width: 100%; gap: 0.25rem;">
                <strong style="font-size: 0.95rem; color: var(--text-main);">ขนาดเล็ก</strong>
                <span style="opacity: 0.8;">(นักเรียนไม่เกิน 119 คน)</span>
              </span>
            </label>
            <label class="radio-label">
              <input type="radio" value="medium" v-model="formData.form_3_basic_info.school_size" :disabled="isReadOnly" />
              <span class="radio-custom done" style="flex-direction: column; align-items: flex-start; text-align: left; font-size: 0.85rem; padding: 0.75rem; width: 100%; gap: 0.25rem;">
                <strong style="font-size: 0.95rem; color: var(--text-main);">ขนาดกลาง</strong>
                <span style="opacity: 0.8;">(นักเรียน 120 - 719 คน)</span>
              </span>
            </label>
            <label class="radio-label">
              <input type="radio" value="large" v-model="formData.form_3_basic_info.school_size" :disabled="isReadOnly" />
              <span class="radio-custom done" style="flex-direction: column; align-items: flex-start; text-align: left; font-size: 0.85rem; padding: 0.75rem; width: 100%; gap: 0.25rem;">
                <strong style="font-size: 0.95rem; color: var(--text-main);">ขนาดใหญ่</strong>
                <span style="opacity: 0.8;">(นักเรียน 720 - 1,679 คน)</span>
              </span>
            </label>
            <label class="radio-label">
              <input type="radio" value="extra_large" v-model="formData.form_3_basic_info.school_size" :disabled="isReadOnly" />
              <span class="radio-custom done" style="flex-direction: column; align-items: flex-start; text-align: left; font-size: 0.85rem; padding: 0.75rem; width: 100%; gap: 0.25rem;">
                <strong style="font-size: 0.95rem; color: var(--text-main);">ขนาดใหญ่พิเศษ</strong>
                <span style="opacity: 0.8;">(นักเรียน 1,680 คนขึ้นไป)</span>
              </span>
            </label>
          </div>
        </div>

        <div v-for="element in form3Structure" :key="element.id" class="form-section">
          <h3 class="section-title">องค์ประกอบที่ {{ element.id }}: {{ element.title }}</h3>
          
          <div class="questions-list">
            <div v-for="item in element.items" :key="item.id" class="question-card glass-card">
              <div class="q-header" style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; width: 100%;">
                <div style="display: flex; gap: 0.5rem; align-items: flex-start;">
                  <span class="q-id">{{ item.id }}</span>
                  <p class="q-text">{{ item.text }}</p>
                </div>
                <button 
                  type="button" 
                  @click="openImageModal(item.id)" 
                  class="btn-consideration" 
                  title="คลิกเพื่อเปิดดูรายการพิจารณา"
                >
                  📋 รายการพิจารณา
                </button>
              </div>

              <!-- Score 5 4 3 2 1 selector -->
              <div class="score-selection-row">
                <label v-for="score in [5,4,3,2,1]" :key="score" class="score-btn-label">
                  <input type="radio" :name="'f3-' + item.id" :value="score" v-model="formData.form_3[item.id].score" :disabled="isReadOnly" />
                  <span class="score-btn" :class="'score-' + score" :title="getForm3ScoreTitle(score)">{{ score }}</span>
                </label>
              </div>

              <div class="evidence-input">
                <label>แหล่งข้อมูล / เอกสารอ้างอิง:</label>
                <input type="text" v-model="formData.form_3[item.id].evidence" :placeholder="item.evidencePlaceholder" class="input-text" :disabled="isReadOnly" />
              </div>
            </div>
          </div>

          <!-- Comment per element -->
          <div class="feedback-grid" style="margin-top: 1.5rem;">
            <div class="feedback-field">
              <label>จุดเด่นองค์ประกอบที่ {{ element.id }}:</label>
              <textarea v-model="formData.form_3_feedback[element.id].strengths" placeholder="ระบุจุดเด่น..." class="input-text textarea-input" :disabled="isReadOnly"></textarea>
            </div>
            <div class="feedback-field">
              <label>จุดที่ควรพัฒนาองค์ประกอบที่ {{ element.id }}:</label>
              <textarea v-model="formData.form_3_feedback[element.id].improvements" placeholder="ระบุจุดที่ควรพัฒนา..." class="input-text textarea-input" :disabled="isReadOnly"></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- FORM 4: นโยบาย สพฐ. (ตอนที่ 5) -->
      <div v-else-if="activeForm === 'form_4'" class="form-content">
        <div class="instruction-guide glass-card">
          <h4>💡 นโยบายจุดเน้น สพฐ. และกระทรวงศึกษาธิการ</h4>
          <p>พิจารณาติดตามการดำเนินการขับเคลื่อนนโยบายกระทรวงฯ "เรียนดี มีคุณธรรม" และจุดเน้น สพฐ. รวมทั้งสิ้น 12 ประเด็น โดยระบุระดับการปฏิบัติงานจริงและร่องรอยเอกสารหลักฐาน</p>
        </div>

        <div v-for="issue in form4Structure" :key="issue.id" class="form-section">
          <h3 class="section-title">ประเด็นที่ {{ issue.id }}: {{ issue.title }}</h3>

          <div class="questions-list">
            <div v-for="item in issue.items" :key="item.id" class="question-card glass-card">
              <div class="q-header">
                <span class="q-id">{{ item.id }}</span>
                <p class="q-text">{{ item.text }}</p>
              </div>

              <!-- Evaluation options -->
              <div class="evaluation-options">
                <label class="radio-label">
                  <input type="radio" :name="'f4-' + item.id" value="done" v-model="formData.form_4[item.id].status" :disabled="isReadOnly" />
                  <span class="radio-custom done">ดำเนินการแล้ว</span>
                </label>
                <label class="radio-label">
                  <input type="radio" :name="'f4-' + item.id" value="in_progress" v-model="formData.form_4[item.id].status" :disabled="isReadOnly" />
                  <span class="radio-custom in-progress">อยู่ระหว่างดำเนินการ</span>
                </label>
                <label class="radio-label">
                  <input type="radio" :name="'f4-' + item.id" value="not_done" v-model="formData.form_4[item.id].status" :disabled="isReadOnly" />
                  <span class="radio-custom pending">ยังไม่ดำเนินการ</span>
                </label>
              </div>

              <!-- Evidence Text input -->
              <div class="evidence-input">
                <label>ร่องรอย / หลักฐานอ้างอิง:</label>
                <input type="text" v-model="formData.form_4[item.id].evidence" placeholder="ระบุหลักฐาน..." class="input-text" :disabled="isReadOnly" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Completeness Warning Checklist -->
      <section class="completeness-panel glass-card" :class="{ complete: incompleteItems.length === 0 }" style="margin-top: 3rem;">
        <div class="panel-header">
          <div class="panel-header-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.5rem; height: 1.5rem; color: #fbbf24;" v-if="incompleteItems.length > 0">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.5rem; height: 1.5rem; color: #34d399;" v-else>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <h4>ตรวจสอบความครบถ้วนในการกรอกข้อมูลของแบบประเมินนี้</h4>
          </div>
          <span class="count-badge">{{ completedFormQuestions }} / {{ totalFormQuestions }} ข้อที่ทำแล้ว</span>
        </div>
        
        <div v-if="incompleteItems.length > 0" class="incomplete-list-box">
          <p class="warning-text">⚠️ ยังมีข้อประเมินที่รอศึกษานิเทศก์กรอกข้อมูลอีก <strong>{{ incompleteItems.length }}</strong> ข้อดังนี้:</p>
          <div class="incomplete-grid">
            <div v-for="item in incompleteItems" :key="item.id" class="incomplete-item">
              <span class="item-badge">{{ item.id }}</span>
              <span class="item-text" :title="item.text">{{ item.text }}</span>
            </div>
          </div>
        </div>
        <div v-else class="complete-success-box">
          <p>🎉 ยอดเยี่ยม! ศึกษานิเทศก์กรอกข้อมูลครบถ้วนทุกข้อแล้วสำหรับแบบนิเทศนี้ พร้อมกดยืนยัน (Submit) เพื่อเสร็จสิ้น</p>
        </div>
      </section>

      <!-- Action Footer -->
      <footer class="form-actions-footer">
        <template v-if="!isReadOnly">
          <button @click="saveDraft" class="btn btn-secondary" :disabled="saving">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.2rem; height: 1.2rem;" v-if="!saving">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
            </svg>
            <span v-if="saving">กำลังบันทึก...</span>
            <span v-else>💾 บันทึกแบบร่าง (Save Draft)</span>
          </button>
          <button @click="submitAssessment" class="btn btn-primary" :disabled="saving">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.2rem; height: 1.2rem;" v-if="!saving">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span v-if="saving">กำลังบันทึก...</span>
            <span v-else>✅ ยืนยันและส่งผลการประเมิน (Submit)</span>
          </button>
        </template>
        <template v-else>
          <NuxtLink to="/" class="btn btn-primary" style="width: 100%; text-align: center;">
            กลับไปที่ Dashboard รายชื่อโรงเรียน
          </NuxtLink>
        </template>
      </footer>
    </main>

    <!-- Beautiful Image Modal for Consideration Details -->
    <div v-if="isImageModalOpen" class="modal-overlay" @click.self="closeImageModal">
      <div class="modal-content glass-panel fade-in" style="max-width: 800px; padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border-light); position: relative; background: #0f172a; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); width: 95%; margin: 2rem auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem;">
          <h3 style="margin: 0; color: #a5b4fc; font-weight: 600; font-size: 1.25rem;">
            📋 {{ currentModalTitle }}
          </h3>
          <button type="button" @click="closeImageModal" style="background: none; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='#f87171'" onmouseout="this.style.color='var(--text-muted)'">
            &times;
          </button>
        </div>
        <div style="display: flex; justify-content: center; align-items: center; background: rgba(0,0,0,0.3); border-radius: 8px; padding: 1rem; overflow: auto; max-height: 70vh;">
          <img :src="currentModalImage" alt="รายการพิจารณา" style="max-width: 100%; height: auto; border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
        </div>
      </div>
    </div>

    <!-- Footer developer credit -->
    <footer style="margin-top: 3rem; margin-bottom: 1.5rem; text-align: center;">
      <p style="color: var(--text-muted); opacity: 0.35; font-size: 0.85rem; font-weight: 400; letter-spacing: 0.05em;">
        © Developer: Winai Nunkratok
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  form1Questions,
  form2Questions,
  form3Questions,
  form4Questions
} from '~/utils/questionsData'

const route = useRoute()
const router = useRouter()

const schoolDmc = route.params.dmc
const activeForm = ref('form_1')
const isAdminMode = ref(false)
const isLightTheme = ref(false)
const isInitializing = ref(true)

const schoolInfo = ref(null)
const assessorName = ref('')
const saving = ref(false)

const toggleTheme = () => {
  isLightTheme.value = !isLightTheme.value
  localStorage.setItem('school_app_theme', isLightTheme.value ? 'light' : 'dark')
  if (isLightTheme.value) {
    document.body.classList.add('light-theme')
  } else {
    document.body.classList.remove('light-theme')
  }
}

// SweetAlert2 styled mixin helper
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

// Tabs structure
const tabs = [
  { id: 'form_1', title: '1. ความพร้อมเปิดเรียน', icon: 'svg-school' },
  { id: 'form_2', title: '2. จุดเน้นเขตพื้นที่ฯ', icon: 'svg-brain' },
  { id: 'form_3', title: '3. การประกันภายใน', icon: 'svg-shield' },
  { id: 'form_4', title: '4. นโยบาย สพฐ.', icon: 'svg-target' }
]

const form1Structure = form1Questions
const form2CoreStructure = form2Questions.core
const form2CitizenshipStructure = form2Questions.citizenship
const form3Structure = form3Questions
const form4Structure = form4Questions

// Modal state for QA consideration images
const isImageModalOpen = ref(false)
const currentModalImage = ref('')
const currentModalTitle = ref('')

const openImageModal = (itemId) => {
  currentModalTitle.value = `รายการพิจารณา ข้อ ${itemId}`
  currentModalImage.value = `/111/${itemId}.png`
  isImageModalOpen.value = true
}

const closeImageModal = () => {
  isImageModalOpen.value = false
}

// Initial state for assessment statuses & assessor names
const assessmentState = ref({
  status_form_1: 'pending',
  status_form_2: 'pending',
  status_form_3: 'pending',
  status_form_4: 'pending',
  assessor_form_1: '',
  assessor_form_2: '',
  assessor_form_3: '',
  assessor_form_4: '',
  unlocked_form_1: false,
  unlocked_form_2: false,
  unlocked_form_3: false,
  unlocked_form_4: false
})

// Locked/ReadOnly logic
const isLocked = computed(() => {
  const statusKey = 'status_' + activeForm.value
  const unlockKey = 'unlocked_' + activeForm.value
  return assessmentState.value[statusKey] === 'completed' && !assessmentState.value[unlockKey]
})

const isReadOnly = computed(() => {
  return (isLocked.value && !isAdminMode.value) || route.query.readOnly === 'true'
})

// Deep reactive form inputs state
const formData = ref({
  form_1: {},
  form_1_basic_info: {
    level_from: '',
    level_to: '',
    informer_name: '',
    informer_position: '',
    informer_date: '',
    director_type: 'ผอ.รร.', // 'ผอ.รร.' or 'รก.ผอ.รร.'
    director_name: '',
    director_lastname: '',
    director_phone: '',
    deputies: [] // Array of { name: '', lastname: '', phone: '' }
  },
  form_1_feedback: { strengths: '', improvements: '', needs: '' },
  form_2: { 
    reading_writing: {}, 
    reading_writing_info: { responder_name: '', responder_position: '', responder_date: '' },
    math_calculation: {}, 
    math_calculation_info: { responder_name: '', responder_position: '', responder_date: '' },
    citizenship: { indicators: {}, attributes: {} },
    citizenship_info: { responder_name: '', responder_position: '', responder_date: '' }
  },
  form_2_feedback: { reading_writing: { strengths: '', improvements: '', recommendations: '' }, math_calculation: { strengths: '', improvements: '', recommendations: '' }, citizenship: { strengths: '', improvements: '', recommendations: '' } },
  form_3: {},
  form_3_basic_info: {
    address: '',
    phone: '',
    fax: '',
    email: '',
    director_name: '',
    acting_director_name: '',
    level_from: '',
    level_to: '',
    school_size: '', // 'small' | 'medium' | 'large' | 'extra_large'
    students_kindergarten: '',
    students_primary: '',
    students_junior_high: '',
    students_total: '',
    staff_total: ''
  },
  form_3_feedback: { 1: { strengths: '', improvements: '' }, 2: { strengths: '', improvements: '' }, 3: { strengths: '', improvements: '' }, 4: { strengths: '', improvements: '' }, 5: { strengths: '', improvements: '' }, 6: { strengths: '', improvements: '' } },
  form_4: {}
})

// Initialize empty forms states structurally matching database schema
const initializeEmptyFormStates = () => {
  form1Structure.forEach(sec => {
    sec.items.forEach(item => {
      if (item.id === '1.8') {
        formData.value.form_1[item.id] = { status: 'pending', evidence: '', completeness: '', reason: '', expected_date: '' }
      } else if (item.id === '4.1.10') {
        formData.value.form_1[item.id] = { status: 'pending', evidence: '', has_safe_playground: false, has_fence: false }
      } else if (item.id === '4.2.4') {
        formData.value.form_1[item.id] = { status: 'pending', evidence: '', has_cctv: '', camera_count: '' }
      } else if (item.id === '4.3.8') {
        formData.value.form_1[item.id] = { status: 'pending', evidence: '', milk_box: false, milk_bag: false }
      } else {
        formData.value.form_1[item.id] = { status: 'pending', evidence: '' }
      }
    })
  })

  formData.value.form_2.reading_writing_info = { responder_name: '', responder_position: '', responder_date: '' }
  formData.value.form_2.math_calculation_info = { responder_name: '', responder_position: '', responder_date: '' }
  formData.value.form_2.citizenship_info = { responder_name: '', responder_position: '', responder_date: '' }

  form2CoreStructure.forEach(sec => {
    sec.items.forEach(item => {
      formData.value.form_2[sec.key][item.id] = { has_data: null, source: '' }
    })
  })
  form2CitizenshipStructure.indicators.forEach(item => {
    formData.value.form_2.citizenship.indicators[item.id] = { score: null, evidence: '' }
  })
  form2CitizenshipStructure.attributes.forEach(item => {
    formData.value.form_2.citizenship.attributes[item.id] = { score: null, evidence: '' }
  })

  form3Structure.forEach(el => {
    el.items.forEach(item => {
      formData.value.form_3[item.id] = { score: null, evidence: '' }
    })
  })

  formData.value.form_3_basic_info = {
    address: '',
    phone: '',
    fax: '',
    email: '',
    director_name: '',
    acting_director_name: '',
    level_from: '',
    level_to: '',
    school_size: '',
    students_kindergarten: '',
    students_primary: '',
    students_junior_high: '',
    students_total: '',
    staff_total: ''
  }

  form4Structure.forEach(issue => {
    issue.items.forEach(item => {
      formData.value.form_4[item.id] = { status: 'pending', evidence: '' }
    })
  })
}

const copyFromReadingWriting = (target) => {
  const source = formData.value.form_2.reading_writing_info
  if (target === 'math') {
    formData.value.form_2.math_calculation_info = { ...source }
  } else if (target === 'citizenship') {
    formData.value.form_2.citizenship_info = { ...source }
  }
}

const addDeputy = () => {
  if (!formData.value.form_1_basic_info.deputies) {
    formData.value.form_1_basic_info.deputies = []
  }
  formData.value.form_1_basic_info.deputies.push({ name: '', lastname: '', phone: '' })
}

const removeDeputy = (index) => {
  formData.value.form_1_basic_info.deputies.splice(index, 1)
}

// Handlers for special question changes
const update18Status = () => {
  const q = formData.value.form_1['1.8']
  if (!q) return
  if (q.completeness === 'yes') {
    q.status = 'done'
    q.reason = ''
    q.expected_date = ''
  } else if (q.completeness === 'no') {
    q.status = 'in_progress'
  } else {
    q.status = 'pending'
  }
}

const update4110Status = () => {
  const q = formData.value.form_1['4.1.10']
  if (!q) return
  if (q.has_safe_playground || q.has_fence) {
    q.status = 'done'
  } else if (q.status === 'done') {
    q.status = 'pending'
  }
}

const clear4110Checks = () => {
  const q = formData.value.form_1['4.1.10']
  if (!q) return
  q.has_safe_playground = false
  q.has_fence = false
  q.status = 'not_done'
}

const update424Status = () => {
  const q = formData.value.form_1['4.2.4']
  if (!q) return
  if (q.has_cctv === 'yes') {
    q.status = q.camera_count !== '' && q.camera_count !== null ? 'done' : 'in_progress'
  } else if (q.has_cctv === 'no') {
    q.status = 'not_done'
    q.camera_count = ''
  } else {
    q.status = 'pending'
  }
}

const update438Status = () => {
  const q = formData.value.form_1['4.3.8']
  if (!q) return
  if (q.milk_box || q.milk_bag) {
    q.status = 'done'
  } else if (q.status === 'done') {
    q.status = 'pending'
  }
}

const clear438Checks = () => {
  const q = formData.value.form_1['4.3.8']
  if (!q) return
  q.milk_box = false
  q.milk_bag = false
  q.status = 'not_done'
}

// Load query parameters if provided
if (route.query.form) {
  activeForm.value = route.query.form
}

// Active Form Title computed
const activeFormTitle = computed(() => {
  const t = tabs.find(tab => tab.id === activeForm.value)
  return t ? t.title : ''
})

// Real-time completeness check
const incompleteItems = computed(() => {
  const list = []
  
  if (activeForm.value === 'form_1') {
    form1Structure.forEach(sec => {
      sec.items.forEach(item => {
        const val = formData.value.form_1[item.id]
        if (!val || val.status === 'pending') {
          list.push({ id: item.id, text: item.text })
        }
      })
    })
  } else if (activeForm.value === 'form_2') {
    form2CoreStructure.forEach(sec => {
      sec.items.forEach(item => {
        const val = formData.value.form_2[sec.key][item.id]
        if (!val || val.has_data === null || val.has_data === undefined) {
          list.push({ id: `${sec.key === 'reading_writing' ? '2.1' : '2.2'} ข้อ ${item.id}`, text: item.text })
        }
      })
    })
    form2CitizenshipStructure.indicators.forEach(item => {
      const val = formData.value.form_2.citizenship.indicators[item.id]
      if (!val || val.score === null || val.score === undefined) {
        list.push({ id: `2.3.1 ข้อ ${item.id}`, text: item.text })
      }
    })
    form2CitizenshipStructure.attributes.forEach(item => {
      const val = formData.value.form_2.citizenship.attributes[item.id]
      if (!val || val.score === null || val.score === undefined) {
        list.push({ id: `2.3.2 ข้อ ${item.id}`, text: item.text })
      }
    })
  } else if (activeForm.value === 'form_3') {
    form3Structure.forEach(el => {
      el.items.forEach(item => {
        const val = formData.value.form_3[item.id]
        if (!val || val.score === null || val.score === undefined) {
          list.push({ id: item.id, text: item.text })
        }
      })
    })
  } else if (activeForm.value === 'form_4') {
    form4Structure.forEach(issue => {
      issue.items.forEach(item => {
        const val = formData.value.form_4[item.id]
        if (!val || val.status === 'pending') {
          list.push({ id: item.id, text: item.text })
        }
      })
    })
  }
  
  return list
})

const totalFormQuestions = computed(() => {
  if (activeForm.value === 'form_1') return 44
  if (activeForm.value === 'form_2') return 38
  if (activeForm.value === 'form_3') return 19
  if (activeForm.value === 'form_4') return 56
  return 0
})

const completedFormQuestions = computed(() => {
  return totalFormQuestions.value - incompleteItems.value.length
})

const form3TotalStudentsComputed = computed(() => {
  if (!formData.value.form_3_basic_info) return 0
  const k = Number(formData.value.form_3_basic_info.students_kindergarten) || 0
  const p = Number(formData.value.form_3_basic_info.students_primary) || 0
  const j = Number(formData.value.form_3_basic_info.students_junior_high) || 0
  const total = k + p + j
  formData.value.form_3_basic_info.students_total = total
  return total
})

watch(form3TotalStudentsComputed, (newTotal) => {
  if (isReadOnly.value) return
  if (newTotal === 0) return
  
  if (newTotal <= 119) {
    formData.value.form_3_basic_info.school_size = 'small'
  } else if (newTotal <= 719) {
    formData.value.form_3_basic_info.school_size = 'medium'
  } else if (newTotal <= 1679) {
    formData.value.form_3_basic_info.school_size = 'large'
  } else {
    formData.value.form_3_basic_info.school_size = 'extra_large'
  }
})

// Fetch initial data
onMounted(async () => {
  // Load Admin Mode
  isAdminMode.value = localStorage.getItem('school_admin_mode') === 'true'
  
  // Load Theme
  isLightTheme.value = localStorage.getItem('school_app_theme') === 'light'
  if (isLightTheme.value) {
    document.body.classList.add('light-theme')
  } else {
    document.body.classList.remove('light-theme')
  }

  initializeEmptyFormStates()

  // Load school info and assessment records
  try {
    const { data: fetchRes } = await useFetch(`/api/assessment?dmc_code=${schoolDmc}`)
    
    // First, query school details from standard schools API to get static fields
    const { data: schoolsRes } = await useFetch('/api/schools')
    if (schoolsRes.value && schoolsRes.value.success) {
      const csvSchool = schoolsRes.value.schools.find(s => s.dmc_code === schoolDmc)
      if (csvSchool) {
        schoolInfo.value = csvSchool
      }
    }

    if (fetchRes.value && fetchRes.value.success) {
      const assess = fetchRes.value.assessment
      
      // Update statuses and form assessors
      assessmentState.value.status_form_1 = assess.status_form_1 || 'pending'
      assessmentState.value.status_form_2 = assess.status_form_2 || 'pending'
      assessmentState.value.status_form_3 = assess.status_form_3 || 'pending'
      assessmentState.value.status_form_4 = assess.status_form_4 || 'pending'
      
      assessmentState.value.assessor_form_1 = assess.assessor_form_1 || ''
      assessmentState.value.assessor_form_2 = assess.assessor_form_2 || ''
      assessmentState.value.assessor_form_3 = assess.assessor_form_3 || ''
      assessmentState.value.assessor_form_4 = assess.assessor_form_4 || ''

      assessmentState.value.unlocked_form_1 = assess.unlocked_form_1 || false
      assessmentState.value.unlocked_form_2 = assess.unlocked_form_2 || false
      assessmentState.value.unlocked_form_3 = assess.unlocked_form_3 || false
      assessmentState.value.unlocked_form_4 = assess.unlocked_form_4 || false

      // Set the active assessor name field for the current active form
      const currentAssessorField = 'assessor_' + activeForm.value
      if (assessmentState.value[currentAssessorField]) {
        assessorName.value = assessmentState.value[currentAssessorField]
      } else {
        const savedAssessor = localStorage.getItem('school_assessor_name')
        if (savedAssessor) assessorName.value = savedAssessor
      }

      // Merge data values into reactive fields
      if (assess.data_form_1 && Object.keys(assess.data_form_1).length) {
        const d = assess.data_form_1
        if (d.items) {
          formData.value.form_1 = { ...formData.value.form_1, ...d.items }
          // Make sure default fields exist inside merged questions for safety
          form1Structure.forEach(sec => {
            sec.items.forEach(item => {
              if (!formData.value.form_1[item.id]) {
                formData.value.form_1[item.id] = { status: 'pending', evidence: '' }
              }
              // Initialize specific fields if missing in database
              if (item.id === '1.8') {
                if (formData.value.form_1[item.id].completeness === undefined) formData.value.form_1[item.id].completeness = ''
                if (formData.value.form_1[item.id].reason === undefined) formData.value.form_1[item.id].reason = ''
                if (formData.value.form_1[item.id].expected_date === undefined) formData.value.form_1[item.id].expected_date = ''
              }
              if (item.id === '4.1.10') {
                if (formData.value.form_1[item.id].has_safe_playground === undefined) formData.value.form_1[item.id].has_safe_playground = false
                if (formData.value.form_1[item.id].has_fence === undefined) formData.value.form_1[item.id].has_fence = false
              }
              if (item.id === '4.2.4') {
                if (formData.value.form_1[item.id].has_cctv === undefined) formData.value.form_1[item.id].has_cctv = ''
                if (formData.value.form_1[item.id].camera_count === undefined) formData.value.form_1[item.id].camera_count = ''
              }
              if (item.id === '4.3.8') {
                if (formData.value.form_1[item.id].milk_box === undefined) formData.value.form_1[item.id].milk_box = false
                if (formData.value.form_1[item.id].milk_bag === undefined) formData.value.form_1[item.id].milk_bag = false
              }
            })
          })
        }
        if (d.feedback) formData.value.form_1_feedback = { ...formData.value.form_1_feedback, ...d.feedback }
        if (d.basic_info) {
          formData.value.form_1_basic_info = {
            ...formData.value.form_1_basic_info,
            ...d.basic_info,
            deputies: d.basic_info.deputies || []
          }
        }
      }
      if (assess.data_form_2 && Object.keys(assess.data_form_2).length) {
        const d = assess.data_form_2
        if (d.reading_writing) formData.value.form_2.reading_writing = { ...formData.value.form_2.reading_writing, ...d.reading_writing }
        if (d.reading_writing_info) formData.value.form_2.reading_writing_info = { ...formData.value.form_2.reading_writing_info, ...d.reading_writing_info }
        if (d.math_calculation) formData.value.form_2.math_calculation = { ...formData.value.form_2.math_calculation, ...d.math_calculation }
        if (d.math_calculation_info) formData.value.form_2.math_calculation_info = { ...formData.value.form_2.math_calculation_info, ...d.math_calculation_info }
        if (d.citizenship) {
          if (d.citizenship.indicators) formData.value.form_2.citizenship.indicators = { ...formData.value.form_2.citizenship.indicators, ...d.citizenship.indicators }
          if (d.citizenship.attributes) formData.value.form_2.citizenship.attributes = { ...formData.value.form_2.citizenship.attributes, ...d.citizenship.attributes }
        }
        if (d.citizenship_info) formData.value.form_2.citizenship_info = { ...formData.value.form_2.citizenship_info, ...d.citizenship_info }
        if (d.feedback) formData.value.form_2_feedback = { ...formData.value.form_2_feedback, ...d.feedback }
      }
      if (assess.data_form_3 && Object.keys(assess.data_form_3).length) {
        const d = assess.data_form_3
        if (d.items) formData.value.form_3 = { ...formData.value.form_3, ...d.items }
        if (d.feedback) formData.value.form_3_feedback = { ...formData.value.form_3_feedback, ...d.feedback }
        if (d.basic_info) {
          formData.value.form_3_basic_info = {
            ...formData.value.form_3_basic_info,
            ...d.basic_info
          }
        }
      }
      if (assess.data_form_4 && Object.keys(assess.data_form_4).length) {
        const d = assess.data_form_4
        if (d.items) formData.value.form_4 = { ...formData.value.form_4, ...d.items }
      }
    }
    
    // Auto-prefill Form 3 basic info with values from CSV or Form 1 basic info if empty
    if (schoolInfo.value) {
      if (!formData.value.form_3_basic_info.email) {
        formData.value.form_3_basic_info.email = schoolInfo.value.email || ''
      }
    }
    const f1Info = formData.value.form_1_basic_info
    const f3Info = formData.value.form_3_basic_info
    if (f1Info && f3Info) {
      if (!f3Info.level_from) f3Info.level_from = f1Info.level_from || ''
      if (!f3Info.level_to) f3Info.level_to = f1Info.level_to || ''
      if (!f3Info.director_name && f1Info.director_type === 'ผอ.รร.') {
        f3Info.director_name = `${f1Info.director_name || ''} ${f1Info.director_lastname || ''}`.trim()
      }
      if (!f3Info.acting_director_name && f1Info.director_type === 'รก.ผอ.รร.') {
        f3Info.acting_director_name = `${f1Info.director_name || ''} ${f1Info.director_lastname || ''}`.trim()
      }
    }
  } catch (error) {
    console.error('Error loading school details:', error)
  } finally {
    setTimeout(() => {
      isInitializing.value = false
    }, 100)
  }
})

// Switch active form
const switchForm = (tabId) => {
  activeForm.value = tabId
  
  // Set correct assessor name for the switched form
  const currentAssessorField = 'assessor_' + tabId
  if (assessmentState.value[currentAssessorField]) {
    assessorName.value = assessmentState.value[currentAssessorField]
  } else {
    const savedAssessor = localStorage.getItem('school_assessor_name')
    if (savedAssessor) assessorName.value = savedAssessor
  }
  
  router.replace({ path: route.path, query: { form: tabId } })
}

// Get status labels
const getStatusLabel = (status) => {
  if (status === 'completed') return 'เสร็จสมบูรณ์'
  if (status === 'draft') return 'บันทึกแบบร่าง'
  return 'ยังไม่เริ่มประเมิน'
}

const getStatusClass = (status) => {
  if (status === 'completed') return 'status-completed'
  if (status === 'draft') return 'status-draft'
  return 'status-pending'
}

const getForm3ScoreTitle = (score) => {
  const titles = {
    5: 'ยอดเยี่ยม',
    4: 'ดีเลิศ',
    3: 'ดี',
    2: 'ปานกลาง',
    1: 'กำลังพัฒนา'
  }
  return titles[score] || ''
}

// Core DB operations: Save Draft & Submit
const saveAssessmentData = async (targetStatus) => {
  const Swal = await getSwal()
  if (!assessorName.value) {
    Swal.fire({ icon: 'warning', title: 'กรุณาระบุชื่อผู้ประเมิน', text: 'กรุณากรอกชื่อศึกษานิเทศก์ผู้ประเมินก่อนทำการบันทึกข้อมูลครับ' })
    return
  }

  saving.value = true
  
  let dataPayload = {}
  if (activeForm.value === 'form_1') {
    dataPayload = {
      items: formData.value.form_1,
      feedback: formData.value.form_1_feedback,
      basic_info: formData.value.form_1_basic_info
    }
  } else if (activeForm.value === 'form_2') {
    dataPayload = {
      reading_writing: formData.value.form_2.reading_writing,
      reading_writing_info: formData.value.form_2.reading_writing_info,
      math_calculation: formData.value.form_2.math_calculation,
      math_calculation_info: formData.value.form_2.math_calculation_info,
      citizenship: formData.value.form_2.citizenship,
      citizenship_info: formData.value.form_2.citizenship_info,
      feedback: formData.value.form_2_feedback
    }
  } else if (activeForm.value === 'form_3') {
    dataPayload = {
      items: formData.value.form_3,
      feedback: formData.value.form_3_feedback,
      basic_info: formData.value.form_3_basic_info
    }
  } else if (activeForm.value === 'form_4') {
    dataPayload = {
      items: formData.value.form_4
    }
  }

  localStorage.setItem('school_assessor_name', assessorName.value)

  try {
    const res = await $fetch('/api/assessment', {
      method: 'POST',
      body: {
        dmc_code: schoolDmc,
        school_name: schoolInfo.value.name,
        district: schoolInfo.value.district,
        school_group: schoolInfo.value.school_group,
        assessor_name: assessorName.value,
        form_type: activeForm.value,
        status: targetStatus,
        data: dataPayload
      }
    })

    if (res.success) {
      assessmentState.value['status_' + activeForm.value] = targetStatus
      assessmentState.value['assessor_' + activeForm.value] = assessorName.value
      
      Swal.fire({
        icon: 'success',
        title: targetStatus === 'completed' ? 'ส่งผลการประเมินเสร็จสิ้น!' : 'บันทึกแบบร่างเรียบร้อย!',
        text: targetStatus === 'completed' ? 'ข้อมูลของแบบนิเทศนี้ได้รับการยืนยันและล็อกระบบเรียบร้อยแล้ว' : 'คุณสามารถกลับเข้ามาแก้ไขแบบร่างนี้ได้ตลอดเวลา',
        timer: 3000,
        showConfirmButton: true
      })
    }
  } catch (err) {
    console.error(err)
    Swal.fire('ข้อผิดพลาด!', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + (err.statusMessage || err.message), 'error')
  } finally {
    saving.value = false
  }
}

const saveDraft = () => {
  saveAssessmentData('draft')
}

const submitAssessment = async () => {
  const Swal = await getSwal()
  
  if (incompleteItems.value.length > 0) {
    const result = await Swal.fire({
      icon: 'warning',
      title: '⚠️ แจ้งเตือน: กรอกข้อมูลไม่ครบถ้วน',
      text: `ยังมีหัวข้อคำถามค้างอยู่ ${incompleteItems.value.length} ข้อในฟอร์มนี้ หากส่งแล้วจะไม่สามารถแก้ไขได้อีก (กรุณาติดต่อผู้ดูแลระบบ Admin เพื่อปลดล็อกแก้ไขภายหลัง) คุณแน่ใจที่จะส่งข้อมูลใช่หรือไม่?`,
      showCancelButton: true,
      confirmButtonText: 'ยืนยันที่จะส่ง',
      cancelButtonText: 'กลับไปแก้ไข'
    })
    if (!result.isConfirmed) return
  } else {
    const result = await Swal.fire({
      icon: 'question',
      title: '✅ ยืนยันการส่งผลนิเทศฉบับสมบูรณ์?',
      text: 'เมื่อทำการส่งผล (Submit) แล้ว แบบนิเทศนี้จะถูกล็อกทันทีและไม่สามารถแก้ไขได้อีก (กรุณาติดต่อผู้ดูแลระบบ Admin หากต้องการปลดล็อกแก้ไขภายหลัง) คุณต้องการส่งข้อมูลใช่หรือไม่?',
      showCancelButton: true,
      confirmButtonText: 'ยืนยันส่งข้อมูล',
      cancelButtonText: 'ยกเลิก'
    })
    if (!result.isConfirmed) return
  }
  
  saveAssessmentData('completed')
}

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

// Admin Lock Toggle Action on Page
const toggleFormLockOnPage = async () => {
  const Swal = await getSwal()
  const unlockKey = 'unlocked_' + activeForm.value
  const currentLockState = assessmentState.value[unlockKey]
  const newLockState = !currentLockState

  try {
    const res = await $fetch('/api/admin', {
      method: 'POST',
      body: {
        action: 'toggle-lock',
        dmc_code: schoolDmc,
        form_type: activeForm.value,
        unlocked: newLockState
      }
    })
    if (res.success) {
      assessmentState.value[unlockKey] = newLockState
      Swal.fire({
        icon: 'success',
        title: newLockState ? '🔓 ปลดล็อกการแก้ไขแล้ว' : '🔒 ล็อกการแก้ไขแล้ว',
        text: newLockState ? 'ศึกษานิเทศก์สามารถแก้ไขข้อมูลแบบประเมินหัวข้อนี้ได้แล้ว' : 'แบบประเมินหัวข้อนี้ถูกล็อกการแก้ไขเรียบร้อย',
        timer: 2000,
        showConfirmButton: false
      })
    }
  } catch (err) {
    Swal.fire('ข้อผิดพลาด!', 'ไม่สามารถเปลี่ยนสถานะล็อกได้: ' + (err.statusMessage || err.message), 'error')
  }
}

// Admin Reset Form Action on Page
const resetFormOnPage = async () => {
  const Swal = await getSwal()
  const result = await Swal.fire({
    title: '⚠️ ยืนยันการรีเซ็ตข้อมูลฟอร์มนี้?',
    text: `คุณต้องการลบข้อมูลการประเมินและการบันทึกร่างทั้งหมดเฉพาะของฟอร์ม "${activeFormTitle.value}" ใช่หรือไม่? (ข้อมูลฟอร์มอื่นๆ จะไม่ถูกผลกระทบ)`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ใช่, รีเซ็ตข้อมูล',
    cancelButtonText: 'ยกเลิก'
  })

  if (result.isConfirmed) {
    try {
      const res = await $fetch('/api/admin', {
        method: 'POST',
        body: {
          action: 'reset-form',
          dmc_code: schoolDmc,
          form_type: activeForm.value
        }
      })
      if (res.success) {
        Swal.fire('สำเร็จ!', res.message, 'success')
        
        // Clear local form states
        if (activeForm.value === 'form_1') {
          form1Structure.forEach(sec => {
            sec.items.forEach(item => {
              if (item.id === '1.8') {
                formData.value.form_1[item.id] = { status: 'pending', evidence: '', completeness: '', reason: '', expected_date: '' }
              } else if (item.id === '4.1.10') {
                formData.value.form_1[item.id] = { status: 'pending', evidence: '', has_safe_playground: false, has_fence: false }
              } else if (item.id === '4.2.4') {
                formData.value.form_1[item.id] = { status: 'pending', evidence: '', has_cctv: '', camera_count: '' }
              } else if (item.id === '4.3.8') {
                formData.value.form_1[item.id] = { status: 'pending', evidence: '', milk_box: false, milk_bag: false }
              } else {
                formData.value.form_1[item.id] = { status: 'pending', evidence: '' }
              }
            })
          })
          formData.value.form_1_feedback = { strengths: '', improvements: '', needs: '' }
          formData.value.form_1_basic_info = {
            level_from: '',
            level_to: '',
            informer_name: '',
            informer_position: '',
            informer_date: '',
            director_type: 'ผอ.รร.',
            director_name: '',
            director_lastname: '',
            director_phone: '',
            deputies: []
          }
        } else if (activeForm.value === 'form_2') {
          form2CoreStructure.forEach(sec => {
            sec.items.forEach(item => {
              formData.value.form_2[sec.key][item.id] = { has_data: null, source: '' }
            })
          })
          form2CitizenshipStructure.indicators.forEach(item => {
            formData.value.form_2.citizenship.indicators[item.id] = { score: null, evidence: '' }
          })
          form2CitizenshipStructure.attributes.forEach(item => {
            formData.value.form_2.citizenship.attributes[item.id] = { score: null, evidence: '' }
          })
          formData.value.form_2_feedback = { reading_writing: { strengths: '', improvements: '', recommendations: '' }, math_calculation: { strengths: '', improvements: '', recommendations: '' }, citizenship: { strengths: '', improvements: '', recommendations: '' } }
        } else if (activeForm.value === 'form_3') {
          form3Structure.forEach(el => {
            el.items.forEach(item => {
              formData.value.form_3[item.id] = { score: null, evidence: '' }
            })
          })
          formData.value.form_3_feedback = { 1: { strengths: '', improvements: '' }, 2: { strengths: '', improvements: '' }, 3: { strengths: '', improvements: '' }, 4: { strengths: '', improvements: '' }, 5: { strengths: '', improvements: '' }, 6: { strengths: '', improvements: '' } }
        } else if (activeForm.value === 'form_4') {
          form4Structure.forEach(issue => {
            issue.items.forEach(item => {
              formData.value.form_4[item.id] = { status: 'pending', evidence: '' }
            })
          })
        }

        // Reset states in assessmentState
        assessmentState.value['status_' + activeForm.value] = 'pending'
        assessmentState.value['assessor_' + activeForm.value] = ''
        assessmentState.value['unlocked_' + activeForm.value] = false
        assessorName.value = ''
      }
    } catch (err) {
      Swal.fire('ข้อผิดพลาด!', 'ไม่สามารถรีเซ็ตข้อมูลได้: ' + (err.statusMessage || err.message), 'error')
    }
  }
}

// Print report
const printCurrentFormReport = () => {
  window.open(`/report-${schoolDmc}-${activeForm.value}`, '_blank')
}
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

.back-nav {
  margin-bottom: 0;
}

.school-header-card {
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.school-metadata h2 {
  font-size: 2rem;
  margin: 0.5rem 0;
  color: var(--text-main);
}

.dmc-tag {
  background: var(--color-primary-glow);
  color: #a5b4fc;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.meta-row {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  font-size: 0.95rem;
  color: var(--text-muted);
}

.assessor-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 250px;
}

.assessor-section label {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* Peer Collaboration Tracker styling */
.peer-status-panel {
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.peer-status-panel h4 {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 0.5rem;
}

.peer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1rem;
}

.peer-item {
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-light);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  transition: var(--transition-smooth);
}

.peer-item.active {
  border-color: rgba(99, 102, 241, 0.4);
  background: rgba(99, 102, 241, 0.03);
}

.peer-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
}

.peer-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.status-badge-inline {
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.peer-assessor {
  font-size: 0.75rem;
  color: #a5b4fc;
  font-weight: 500;
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.peer-assessor.empty {
  color: var(--text-muted);
}

/* Tab navigation */
.form-tabs-container {
  display: flex;
  padding: 0.5rem;
  gap: 0.5rem;
  margin-bottom: 2rem;
  overflow-x: auto;
}

.tab-btn {
  flex-grow: 1;
  flex-basis: 0;
  min-width: 160px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 12px;
  color: var(--text-muted);
  font-family: var(--font-sans);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.02);
  color: var(--text-main);
}

.tab-btn.active {
  background: var(--bg-card-hover);
  border-color: rgba(99, 102, 241, 0.3);
  color: var(--text-main);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), 0 0 10px var(--color-primary-glow);
}

.tab-icon {
  width: 1.4rem;
  height: 1.4rem;
}

.tab-title {
  white-space: nowrap;
}

.tab-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 6px currentColor;
}

.tab-status-dot.status-pending { background-color: var(--color-pending); color: var(--color-pending); }
.tab-status-dot.status-draft { background-color: var(--color-warning); color: var(--color-warning); }
.tab-status-dot.status-completed { background-color: var(--color-success); color: var(--color-success); }

/* Form main panel */
.assessment-form-main {
  padding: 2.5rem;
  margin-bottom: 4rem;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.form-header h2 {
  font-size: 1.5rem;
  color: #a5b4fc;
}

.instruction-guide {
  padding: 1.25rem 1.5rem;
  margin-bottom: 2rem;
  border-left: 4px solid var(--color-primary);
}

.instruction-guide h4 {
  margin-bottom: 0.25rem;
}

.instruction-guide p {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.section-title {
  font-size: 1.25rem;
  color: var(--text-main);
  margin: 2.5rem 0 1.25rem;
  padding-left: 0.75rem;
  border-left: 3px solid var(--color-secondary);
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.question-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.q-header {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}

.q-id {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-light);
  color: #a5b4fc;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  flex-shrink: 0;
}

.q-text {
  font-size: 1.05rem;
  font-weight: 500;
  color: var(--text-main);
}

.q-subtext {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* Custom segmented buttons layout */
.evaluation-options {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.radio-label {
  flex-grow: 1;
  flex-basis: 0;
  min-width: 140px;
  cursor: pointer;
}

.radio-label input {
  display: none;
}

.radio-custom {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  background: rgba(255, 255, 255, 0.02);
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
  transition: var(--transition-smooth);
}

.radio-label input:checked + .radio-custom.done {
  background-color: var(--color-success-bg);
  border-color: var(--color-success);
  color: var(--color-success);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
}

.radio-label input:checked + .radio-custom.in-progress {
  background-color: var(--color-warning-bg);
  border-color: var(--color-warning);
  color: var(--color-warning);
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.2);
}

.radio-label input:checked + .radio-custom.pending {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.2);
}

.evidence-input {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.evidence-input label {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* Score selection rows (Form 3 & Citizenship) */
.score-selection-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.score-btn-label {
  flex-grow: 1;
  flex-basis: 0;
  min-width: 50px;
  cursor: pointer;
}

.score-btn-label input {
  display: none;
}

.score-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  background: rgba(255, 255, 255, 0.02);
  color: var(--text-muted);
  font-size: 1.1rem;
  font-weight: 600;
  transition: var(--transition-smooth);
}

.score-btn-label input:checked + .score-btn.score-5 {
  background-color: rgba(16, 185, 129, 0.15);
  border-color: var(--color-success);
  color: #34d399;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
}

.score-btn-label input:checked + .score-btn.score-4 {
  background-color: rgba(99, 102, 241, 0.15);
  border-color: var(--color-primary);
  color: #a5b4fc;
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.3);
}

.score-btn-label input:checked + .score-btn.score-3 {
  background-color: rgba(59, 130, 246, 0.15);
  border-color: #3b82f6;
  color: #60a5fa;
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.3);
}

.score-btn-label input:checked + .score-btn.score-2 {
  background-color: rgba(245, 158, 11, 0.15);
  border-color: var(--color-warning);
  color: #fbbf24;
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.3);
}

.score-btn-label input:checked + .score-btn.score-1 {
  background-color: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
  color: #f87171;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.3);
}

/* Completeness panel checklist style */
.completeness-panel {
  padding: 1.5rem;
  border-left: 4px solid #fbbf24;
  background: rgba(245, 158, 11, 0.02);
}

.completeness-panel.complete {
  border-left-color: var(--color-success);
  background: rgba(16, 185, 129, 0.02);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.panel-header-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.panel-header h4 {
  font-size: 1.1rem;
  font-weight: 600;
}

.count-badge {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-light);
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #a5b4fc;
}

.warning-text {
  font-size: 0.95rem;
  color: #fbbf24;
  margin-bottom: 0.75rem;
}

.incomplete-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.65rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  border: 1px solid var(--border-light);
}

.incomplete-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  background: rgba(255, 255, 255, 0.01);
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.incomplete-item .item-badge {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.incomplete-item .item-text {
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.complete-success-box {
  color: var(--color-success);
  font-weight: 500;
}

/* Feedback section and textareas */
.feedback-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 768px) {
  .feedback-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

.feedback-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feedback-field label {
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 500;
}

.textarea-input {
  min-height: 90px;
  resize: vertical;
}

/* Action Sticky Footer */
.form-actions-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 3rem;
  border-top: 1px solid var(--border-light);
  padding-top: 1.5rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .header-logo-title {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .school-header-card {
    padding: 1.25rem;
  }

  .school-metadata h2 {
    font-size: 1.5rem;
  }

  .assessment-form-main {
    padding: 1.25rem;
  }

  .tab-btn {
    flex-grow: 0;
    width: auto;
  }

  .form-actions-footer {
    flex-direction: column;
  }

  .form-actions-footer button {
    width: 100%;
  }

  .radio-custom {
    padding: 0.6rem 0.5rem;
    font-size: 0.85rem;
  }

  .score-btn {
    padding: 0.6rem 0.5rem;
    font-size: 0.95rem;
  }
}

/* QA Consideration Modal & Button Styles */
.btn-consideration {
  flex-shrink: 0;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.25);
  color: #a5b4fc;
  padding: 0.35rem 0.7rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s ease;
  user-select: none;
}

.btn-consideration:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: #6366f1;
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.15);
}

.btn-consideration:active {
  transform: translateY(0);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.25s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 768px) {
  .btn-consideration {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
  }
}
</style>
