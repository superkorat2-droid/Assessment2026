<template>
  <div class="report-print-container">
    <!-- Action Bar (Hidden during Print) -->
    <div class="action-bar no-print glass-panel">
      <div class="action-left">
        <NuxtLink :to="`/assessment/${dmcCode}?form=${formId}`" class="btn btn-secondary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.1rem; height: 1.1rem;">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          กลับไปหน้าแบบประเมิน
        </NuxtLink>
        <NuxtLink to="/" class="btn btn-secondary">
          กลับหน้าแรก Dashboard
        </NuxtLink>
      </div>
      <div class="action-right">
        <button @click="printReport" class="btn btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.1rem; height: 1.1rem;">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          🖨️ สั่งพิมพ์ / บันทึกเป็น PDF
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state text-center" style="padding: 4rem 0;">
      <div class="spinner"></div>
      <p style="margin-top: 1rem; color: var(--text-muted);">กำลังโหลดข้อมูลรายงานสำหรับการพิมพ์...</p>
    </div>

    <!-- Report Paper Content -->
    <div v-else-if="schoolInfo && assessment" class="report-paper-body">
      <!-- Official Header -->
      <header class="report-doc-header">
        <img src="/obec_logo.png" alt="สพฐ Logo" class="obec-print-logo" />
        <h2>รายงานผลการนิเทศและติดตามความพร้อมรายหัวข้อ</h2>
        <h3>{{ getFormTitle(formId) }}</h3>
        <p class="school-year">ปีการศึกษา 2569</p>
      </header>

      <!-- School & Assessor Metadata Table -->
      <section class="meta-report-section">
        <table class="meta-report-table">
          <tbody>
            <tr>
              <td style="width: 15%;"><strong>โรงเรียน:</strong></td>
              <td style="width: 35%;">{{ schoolInfo.name }}</td>
              <td style="width: 15%;"><strong>รหัส DMC:</strong></td>
              <td style="width: 35%;">{{ schoolInfo.dmc_code }}</td>
            </tr>
            <tr>
              <td><strong>ศูนย์เครือข่าย:</strong></td>
              <td>{{ schoolInfo.school_group }}</td>
              <td><strong>อำเภอ:</strong></td>
              <td>{{ schoolInfo.district }}</td>
            </tr>
            <tr>
              <td><strong>ผู้ประเมิน:</strong></td>
              <td>{{ assessment['assessor_' + formId] || 'ไม่ระบุผู้ประเมิน' }}</td>
              <td><strong>สถานะ:</strong></td>
              <td>
                <span class="status-print-badge" :class="assessment['status_' + formId]">
                  {{ getStatusLabel(assessment['status_' + formId]) }}
                </span>
              </td>
            </tr>
            <tr>
              <td><strong>วันที่ประเมินล่าสุด:</strong></td>
              <td colspan="3">{{ formatThaiDate(assessment.updated_at) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- FORM 1 Content -->
      <section v-if="formId === 'form_1'" class="report-content-section">
        <!-- ๑.๑ ข้อมูลทั่วไป & ๑.๒ ข้อมูลผู้บริหารสถานศึกษา -->
        <h4 class="section-doc-title">ตอนที่ 1: ข้อมูลพื้นฐานสถานศึกษา</h4>
        <table class="meta-report-table" style="margin-bottom: 2rem; width: 100%;">
          <tbody>
            <tr class="table-group-header">
              <td colspan="4"><strong>๑.๑ ข้อมูลทั่วไป</strong></td>
            </tr>
            <tr>
              <td style="width: 20%;"><strong>ระดับที่เปิดสอน:</strong></td>
              <td style="width: 30%;">
                {{ assessment.data_form_1?.basic_info?.level_from || '-' }} ถึง {{ assessment.data_form_1?.basic_info?.level_to || '-' }}
              </td>
              <td style="width: 20%;"><strong>วันที่ประเมิน:</strong></td>
              <td style="width: 30%;">
                {{ formatThaiShortDate(assessment.data_form_1?.basic_info?.informer_date) }}
              </td>
            </tr>
            <tr>
              <td><strong>ชื่อผู้ให้ข้อมูล:</strong></td>
              <td>{{ assessment.data_form_1?.basic_info?.informer_name || '-' }}</td>
              <td><strong>ตำแหน่ง:</strong></td>
              <td>{{ assessment.data_form_1?.basic_info?.informer_position || '-' }}</td>
            </tr>
            <tr class="table-group-header">
              <td colspan="4"><strong>๑.๒ ข้อมูลผู้บริหารสถานศึกษา</strong></td>
            </tr>
            <tr>
              <td><strong>ผู้บริหาร ({{ assessment.data_form_1?.basic_info?.director_type || 'ผอ.รร.' }}):</strong></td>
              <td>
                {{ assessment.data_form_1?.basic_info?.director_name || '-' }} {{ assessment.data_form_1?.basic_info?.director_lastname || '' }}
              </td>
              <td><strong>เบอร์โทรศัพท์มือถือ:</strong></td>
              <td>{{ assessment.data_form_1?.basic_info?.director_phone || '-' }}</td>
            </tr>
            <!-- Render Deputies if any -->
            <template v-if="assessment.data_form_1?.basic_info?.deputies && assessment.data_form_1?.basic_info?.deputies.length > 0">
              <tr v-for="(dep, index) in assessment.data_form_1.basic_info.deputies" :key="index">
                <td><strong>รอง ผอ.รร. (คนที่ {{ index + 1 }}):</strong></td>
                <td>{{ dep.name || '-' }} {{ dep.lastname || '' }}</td>
                <td><strong>เบอร์โทรศัพท์มือถือ:</strong></td>
                <td>{{ dep.phone || '-' }}</td>
              </tr>
            </template>
            <tr v-else>
              <td><strong>รอง ผอ.รร.:</strong></td>
              <td colspan="3" style="color: #64748b; font-style: italic;">ไม่มีข้อมูลรองผู้อำนวยการโรงเรียน</td>
            </tr>
          </tbody>
        </table>

        <h4 class="section-doc-title" style="margin-top: 2rem;">ตอนที่ 2: สรุปผลการติดตามความพร้อมเปิดเรียนรายหัวข้อย่อย</h4>
        <table class="report-data-table">
          <thead>
            <tr>
              <th style="width: 8%;" class="text-center">ข้อที่</th>
              <th>รายการประเมินความพร้อมเปิดเรียน</th>
              <th style="width: 25%;" class="text-center">ผลการประเมิน</th>
              <th style="width: 25%;">ร่องรอย / หลักฐานอ้างอิง</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="sec in form1Structure" :key="sec.title">
              <tr class="table-group-header">
                <td colspan="4"><strong>{{ sec.title }}</strong></td>
              </tr>
              <tr v-for="item in sec.items" :key="item.id">
                <td class="text-center">{{ item.id }}</td>
                <td>{{ item.text }}</td>
                
                <!-- Custom status column -->
                <td class="text-center">
                  <!-- Main Status Badge -->
                  <span :class="getStatusClass(getForm1Val(item.id, 'status'))">
                    {{ getForm1ValLabel(item.id) }}
                  </span>

                  <!-- 1.8 completeness info -->
                  <template v-if="item.id === '1.8'">
                    <div v-if="getForm1Val(item.id, 'completeness')" style="font-size: 0.8rem; margin-top: 0.25rem; color: #475569;">
                      ({{ getForm1Val(item.id, 'completeness') === 'yes' ? 'ครบถ้วน' : 'ไม่ครบถ้วน' }})
                    </div>
                  </template>
                  
                  <!-- 4.1.10 playground checkboxes -->
                  <template v-else-if="item.id === '4.1.10'">
                    <div v-if="getForm1RawVal(item.id)?.has_safe_playground || getForm1RawVal(item.id)?.has_fence" style="font-size: 0.8rem; margin-top: 0.25rem; color: #475569; text-align: left; display: inline-block;">
                      <div v-if="getForm1RawVal(item.id)?.has_safe_playground">✓ มีเครื่องเล่นปลอดภัย</div>
                      <div v-if="getForm1RawVal(item.id)?.has_fence">✓ มีแนวรั้วกั้นสนามเด็กเล่น</div>
                    </div>
                  </template>
                  
                  <!-- 4.2.4 cctv details -->
                  <template v-else-if="item.id === '4.2.4'">
                    <div v-if="getForm1RawVal(item.id)?.has_cctv" style="font-size: 0.8rem; margin-top: 0.25rem; color: #475569;">
                      <span v-if="getForm1RawVal(item.id)?.has_cctv === 'yes'">
                        มีกล้องวงจรปิด ({{ getForm1RawVal(item.id)?.camera_count || 0 }} ตัว)
                      </span>
                      <span v-else>
                        ไม่มีกล้องวงจรปิด
                      </span>
                    </div>
                  </template>
                  
                  <!-- 4.3.8 milk details -->
                  <template v-else-if="item.id === '4.3.8'">
                    <div v-if="getForm1RawVal(item.id)?.milk_box || getForm1RawVal(item.id)?.milk_bag" style="font-size: 0.8rem; margin-top: 0.25rem; color: #475569; text-align: left; display: inline-block;">
                      <div v-if="getForm1RawVal(item.id)?.milk_box">✓ นมกล่อง</div>
                      <div v-if="getForm1RawVal(item.id)?.milk_bag">✓ นมถุง</div>
                    </div>
                  </template>
                </td>
                
                <!-- Custom evidence cell -->
                <td class="evidence-cell">
                  <template v-if="item.id === '1.8' && getForm1Val(item.id, 'completeness') === 'no'">
                    <div style="font-size: 0.85rem; color: #dc2626;">
                      <strong>เหตุผลที่ไม่ครบ:</strong> {{ getForm1RawVal(item.id)?.reason || '-' }}<br/>
                      <strong>คาดว่าจะครบ:</strong> {{ getForm1RawVal(item.id)?.expected_date || '-' }}
                    </div>
                    <div v-if="getForm1Val(item.id, 'evidence') && getForm1Val(item.id, 'evidence') !== '-'" style="margin-top: 0.25rem; font-size: 0.8rem; opacity: 0.8;">
                      หลักฐาน: {{ getForm1Val(item.id, 'evidence') }}
                    </div>
                  </template>
                  <template v-else>
                    {{ getForm1Val(item.id, 'evidence') }}
                  </template>
                </td>
              </tr>
            </template>
          </tbody>
        </table>

        <!-- Feedback -->
        <div class="feedback-doc-box print-avoid-break">
          <h4 class="section-doc-title">สรุปผลเพิ่มเติมท้ายแบบประเมิน</h4>
          <div class="feedback-doc-item">
            <strong>1. จุดเด่นของโรงเรียน:</strong>
            <p>{{ getFeedbackVal('form_1_feedback', 'strengths') }}</p>
          </div>
          <div class="feedback-doc-item">
            <strong>2. จุดที่ควรพัฒนาของโรงเรียน:</strong>
            <p>{{ getFeedbackVal('form_1_feedback', 'improvements') }}</p>
          </div>
          <div class="feedback-doc-item">
            <strong>3. สิ่งที่โรงเรียนมีความต้องการพัฒนาหรือแก้ปัญหา:</strong>
            <p>{{ getFeedbackVal('form_1_feedback', 'needs') }}</p>
          </div>
        </div>
      </section>

      <!-- FORM 2 Content -->
      <section v-else-if="formId === 'form_2'" class="report-content-section">
        <!-- Core sections 2.1 & 2.2 -->
        <h4 class="section-doc-title">ตอนที่ 1: ความสามารถด้านการอ่าน-เขียน และการคิดคำนวณ</h4>
        <table class="report-data-table">
          <thead>
            <tr>
              <th style="width: 8%;" class="text-center">ข้อที่</th>
              <th>ตัวชี้วัด / รายการประเมินจุดเน้น</th>
              <th style="width: 15%;" class="text-center">การดำเนินงาน</th>
              <th style="width: 32%;">แหล่งข้อมูล / เอกสารหลักฐาน</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="sec in form2CoreStructure" :key="sec.key">
              <tr class="table-group-header">
                <td colspan="4"><strong>{{ sec.title }}</strong></td>
              </tr>
              <!-- Metadata row inside the data table -->
              <tr class="comment-row">
                <td colspan="4" style="background: #f8fafc; padding: 0.5rem 0.8rem; font-size: 0.85rem; border: 1px solid #cbd5e1;">
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.5rem;">
                    <div><strong>ผู้รับการนิเทศ:</strong> {{ getForm2InfoVal(sec.key, 'responder_name') }}</div>
                    <div><strong>ตำแหน่ง:</strong> {{ getForm2InfoVal(sec.key, 'responder_position') }}</div>
                    <div><strong>วัน/เดือน/ปี:</strong> {{ formatThaiShortDate(getForm2InfoVal(sec.key, 'responder_date')) }}</div>
                  </div>
                </td>
              </tr>
              <tr v-for="item in sec.items" :key="item.id">
                <td class="text-center">{{ item.id }}</td>
                <td>{{ item.text }}</td>
                <td class="text-center">
                  <span :class="getForm2CoreVal(sec.key, item.id, 'has_data') ? 'text-done' : 'text-pending'">
                    {{ getForm2CoreVal(sec.key, item.id, 'has_data') === true ? 'มี' : (getForm2CoreVal(sec.key, item.id, 'has_data') === false ? 'ไม่มี' : '-') }}
                  </span>
                </td>
                <td class="evidence-cell">{{ getForm2CoreVal(sec.key, item.id, 'source') }}</td>
              </tr>
            </template>
          </tbody>
        </table>

        <!-- Core section feedback comments -->
        <div class="feedback-doc-box print-avoid-break">
          <h4 class="section-doc-title">ข้อเสนอแนะตอนที่ 1</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="feedback-doc-item" v-for="k in ['reading_writing', 'math_calculation']" :key="k">
              <strong>ด้าน{{ k === 'reading_writing' ? 'การอ่าน-การเขียน' : 'การคิดคำนวณ' }}:</strong>
              <p><strong>จุดเด่น:</strong> {{ getFeedbackVal('form_2_feedback', 'strengths', k) }}</p>
              <p><strong>จุดที่ควรพัฒนา:</strong> {{ getFeedbackVal('form_2_feedback', 'improvements', k) }}</p>
              <p><strong>ข้อเสนอแนะเพิ่มเติม:</strong> {{ getFeedbackVal('form_2_feedback', 'recommendations', k) }}</p>
            </div>
          </div>
        </div>

        <!-- Citizenship indicators -->
        <div class="print-page-break"></div>

        <h4 class="section-doc-title" style="margin-top: 2rem;">ตอนที่ 2: คุณลักษณะอันพึงประสงค์ (พลเมืองดี)</h4>
        
        <!-- Metadata table for 2.3 -->
        <table class="meta-report-table" style="margin-bottom: 1.5rem; width: 100%;">
          <tbody>
            <tr>
              <td style="width: 33%;"><strong>ผู้รับการนิเทศ:</strong> {{ assessment.data_form_2?.citizenship_info?.responder_name || '-' }}</td>
              <td style="width: 33%;"><strong>ตำแหน่ง:</strong> {{ assessment.data_form_2?.citizenship_info?.responder_position || '-' }}</td>
              <td style="width: 34%;"><strong>วัน/เดือน/ปี:</strong> {{ formatThaiShortDate(assessment.data_form_2?.citizenship_info?.responder_date) }}</td>
            </tr>
          </tbody>
        </table>

        <h5 style="margin-bottom: 0.5rem; font-size: 0.95rem;">2.1 ตัวชี้วัดการดำเนินงาน (10 ข้อ)</h5>
        <table class="report-data-table">
          <thead>
            <tr>
              <th style="width: 8%;" class="text-center">ข้อที่</th>
              <th>รายการตัวชี้วัดพลเมืองดี</th>
              <th style="width: 15%;" class="text-center">คะแนนคุณภาพ</th>
              <th style="width: 32%;">ร่องรอย / หลักฐานอ้างอิง</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in form2CitizenshipStructure.indicators" :key="item.id">
              <td class="text-center">{{ item.id }}</td>
              <td>{{ item.text }}</td>
              <td class="text-center">
                <strong>{{ getForm2CitizenScore('indicators', item.id) }}</strong> / 4
              </td>
              <td class="evidence-cell">{{ getForm2CitizenEvidence('indicators', item.id) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Citizenship attributes -->
        <h5 style="margin: 1.5rem 0 0.5rem; font-size: 0.95rem;" class="print-avoid-break">2.2 คุณลักษณะอันพึงประสงค์ 8 ประการ</h5>
        <table class="report-data-table">
          <thead>
            <tr>
              <th style="width: 8%;" class="text-center">ข้อที่</th>
              <th style="width: 25%;">คุณลักษณะ</th>
              <th>พฤติกรรมบ่งชี้ / การดำเนินงาน</th>
              <th style="width: 15%;" class="text-center">คะแนนคุณภาพ</th>
              <th style="width: 25%;">ร่องรอย / หลักฐาน</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in form2CitizenshipStructure.attributes" :key="item.id">
              <td class="text-center">{{ item.id }}</td>
              <td><strong>{{ item.text }}</strong></td>
              <td>{{ item.desc }}</td>
              <td class="text-center">
                <strong>{{ getForm2CitizenScore('attributes', item.id) }}</strong> / 4
              </td>
              <td class="evidence-cell">{{ getForm2CitizenEvidence('attributes', item.id) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Citizenship Feedback -->
        <div class="feedback-doc-box print-avoid-break">
          <h4 class="section-doc-title">ข้อเสนอแนะคุณลักษณะอันพึงประสงค์ (พลเมืองดี)</h4>
          <div class="feedback-doc-item">
            <strong>จุดเด่น / ข้อสังเกต:</strong>
            <p>{{ getFeedbackVal('form_2_feedback', 'strengths', 'citizenship') }}</p>
          </div>
          <div class="feedback-doc-item">
            <strong>จุดที่ควรพัฒนา:</strong>
            <p>{{ getFeedbackVal('form_2_feedback', 'improvements', 'citizenship') }}</p>
          </div>
          <div class="feedback-doc-item">
            <strong>ข้อเสนอแนะเพิ่มเติม / แนวทางติดตามครั้งต่อไป:</strong>
            <p>{{ getFeedbackVal('form_2_feedback', 'recommendations', 'citizenship') }}</p>
          </div>
        </div>
      </section>

      <!-- FORM 3 Content -->
      <section v-else-if="formId === 'form_3'" class="report-content-section">
        <!-- ตอนที่ 1: ข้อมูลพื้นฐาน -->
        <h4 class="section-doc-title">ตอนที่ 1: ข้อมูลพื้นฐานสถานศึกษา</h4>
        <table class="meta-report-table" style="margin-bottom: 2rem; width: 100%;">
          <tbody>
            <tr>
              <td style="width: 20%;"><strong>ชื่อโรงเรียน:</strong></td>
              <td style="width: 30%;">{{ schoolInfo?.name || '-' }}</td>
              <td style="width: 20%;"><strong>ศูนย์เครือข่าย:</strong></td>
              <td style="width: 30%;">{{ schoolInfo?.school_group || '-' }}</td>
            </tr>
            <tr>
              <td><strong>ที่ตั้ง/ตำบล/อำเภอ:</strong></td>
              <td>{{ assessment.data_form_3?.basic_info?.address || '-' }} ต.{{ schoolInfo?.subdistrict || '-' }} อ.{{ schoolInfo?.district || '-' }}</td>
              <td><strong>โทรศัพท์:</strong></td>
              <td>{{ assessment.data_form_3?.basic_info?.phone || '-' }}</td>
            </tr>
            <tr>
              <td><strong>โทรสาร:</strong></td>
              <td>{{ assessment.data_form_3?.basic_info?.fax || '-' }}</td>
              <td><strong>E-mail:</strong></td>
              <td>{{ assessment.data_form_3?.basic_info?.email || schoolInfo?.email || '-' }}</td>
            </tr>
            <tr>
              <td><strong>ผู้อำนวยการโรงเรียน:</strong></td>
              <td>{{ assessment.data_form_3?.basic_info?.director_name || '-' }}</td>
              <td><strong>ผู้รักษาการแทน:</strong></td>
              <td>{{ assessment.data_form_3?.basic_info?.acting_director_name || '-' }}</td>
            </tr>
            <tr>
              <td><strong>เปิดสอนระดับ:</strong></td>
              <td>
                {{ assessment.data_form_3?.basic_info?.level_from || '-' }} ถึง {{ assessment.data_form_3?.basic_info?.level_to || '-' }}
              </td>
              <td><strong>ขนาดโรงเรียน:</strong></td>
              <td>
                {{ getSchoolSizeLabel(assessment.data_form_3?.basic_info?.school_size) }}
              </td>
            </tr>
            <tr>
              <td><strong>จำนวนนักเรียน:</strong></td>
              <td colspan="3">
                รวม <strong>{{ assessment.data_form_3?.basic_info?.students_total || '0' }}</strong> คน 
                (ระดับปฐมวัย: {{ assessment.data_form_3?.basic_info?.students_kindergarten || '0' }} คน, 
                ประถมศึกษา: {{ assessment.data_form_3?.basic_info?.students_primary || '0' }} คน, 
                มัธยมศึกษาตอนต้น: {{ assessment.data_form_3?.basic_info?.students_junior_high || '0' }} คน)
              </td>
            </tr>
            <tr>
              <td><strong>บุคลากรทางการศึกษา:</strong></td>
              <td colspan="3">
                รวม <strong>{{ assessment.data_form_3?.basic_info?.staff_total || '0' }}</strong> คน
              </td>
            </tr>
          </tbody>
        </table>

        <h4 class="section-doc-title">ระดับคุณภาพระบบการประกันคุณภาพภายใน (6 องค์ประกอบ)</h4>
        <table class="report-data-table">
          <thead>
            <tr>
              <th style="width: 8%;" class="text-center">ข้อที่</th>
              <th>องค์ประกอบและประเด็นประเมินการประกันภัย</th>
              <th style="width: 20%;" class="text-center">ระดับคุณภาพ</th>
              <th style="width: 32%;">แหล่งข้อมูล / เอกสารอ้างอิง</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="el in form3Structure" :key="el.id">
              <tr class="table-group-header">
                <td colspan="4"><strong>องค์ประกอบที่ {{ el.id }}: {{ el.title }}</strong></td>
              </tr>
              <tr v-for="item in el.items" :key="item.id">
                <td class="text-center">{{ item.id }}</td>
                <td>{{ item.text }}</td>
                <td class="text-center">
                  <strong>{{ getForm3Val(item.id, 'score') }}</strong> / 5
                  <span style="font-size:0.8rem; display:block; color: #475569;">({{ getForm3ScoreLabel(getForm3Val(item.id, 'score')) }})</span>
                </td>
                <td class="evidence-cell">{{ getForm3Val(item.id, 'evidence') }}</td>
              </tr>
              <!-- Element Feedback comments inside Table rows to look elegant -->
              <tr class="comment-row print-avoid-break">
                <td colspan="4" style="background: rgba(0, 0, 0, 0.01); padding: 0.75rem 1rem;">
                  <div style="font-size: 0.85rem; color: #334155;">
                    <div>📌 <strong>จุดเด่น (องค์ประกอบที่ {{ el.id }}):</strong> {{ getFeedbackVal('form_3_feedback', 'strengths', el.id) || '-' }}</div>
                    <div style="margin-top: 0.25rem;">📌 <strong>จุดที่ควรพัฒนา (องค์ประกอบที่ {{ el.id }}):</strong> {{ getFeedbackVal('form_3_feedback', 'improvements', el.id) || '-' }}</div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </section>

      <!-- FORM 4 Content -->
      <section v-else-if="formId === 'form_4'" class="report-content-section">
        <h4 class="section-doc-title">ระดับการดำเนินการตามจุดเน้นนโยบาย สพฐ. (12 ประเด็น)</h4>
        <table class="report-data-table">
          <thead>
            <tr>
              <th style="width: 8%;" class="text-center">ข้อที่</th>
              <th>ประเด็นประเมินจุดเน้น สพฐ.</th>
              <th style="width: 22%;" class="text-center">ผลการดำเนินงาน</th>
              <th style="width: 28%;">ร่องรอย / หลักฐานอ้างอิง</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="issue in form4Structure" :key="issue.id">
              <tr class="table-group-header">
                <td colspan="4"><strong>ประเด็นที่ {{ issue.id }}: {{ issue.title }}</strong></td>
              </tr>
              <tr v-for="item in issue.items" :key="item.id">
                <td class="text-center">{{ item.id }}</td>
                <td>{{ item.text }}</td>
                <td class="text-center">
                  <span :class="getStatusClass(getForm4Val(item.id, 'status'))">
                    {{ getForm4ValLabel(item.id) }}
                  </span>
                </td>
                <td class="evidence-cell">{{ getForm4Val(item.id, 'evidence') }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </section>

      <!-- Signatures Footer -->
      <footer class="report-signature-footer print-avoid-break">
        <div class="signature-row">
          <div class="signature-col">
            <p>ลงชื่อ..............................................................</p>
            <p style="margin-top: 0.5rem;">(..............................................................)</p>
            <p style="margin-top: 0.25rem; font-size: 0.9rem;">ศึกษานิเทศก์ผู้ประเมิน</p>
          </div>
          <div class="signature-col">
            <p>ลงชื่อ..............................................................</p>
            <p style="margin-top: 0.5rem;">(..............................................................)</p>
            <p style="margin-top: 0.25rem; font-size: 0.9rem;">ผู้อำนวยการโรงเรียน / ผู้รับการประเมิน</p>
          </div>
        </div>
      </footer>
    </div>

    <!-- Error State -->
    <div v-else class="text-center" style="padding: 4rem 0;">
      <p style="color: #ef4444; font-weight: 500;">❌ ไม่พบข้อมูลการประเมินหรือข้อมูลโรงเรียนนี้ในระบบ</p>
      <NuxtLink to="/" class="btn btn-primary" style="margin-top: 1.5rem;">กลับหน้าแรก Dashboard</NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  form1Questions,
  form2Questions,
  form3Questions,
  form4Questions
} from '~/utils/questionsData'

const route = useRoute()
const dmcCode = route.params.dmc
const formId = route.params.form

const schoolInfo = ref(null)
const assessment = ref(null)
const loading = ref(true)

const form1Structure = form1Questions
const form2CoreStructure = form2Questions.core
const form2CitizenshipStructure = form2Questions.citizenship
const form3Structure = form3Questions
const form4Structure = form4Questions

// Status styling mapper
const getStatusClass = (status) => {
  if (status === 'done') return 'text-done'
  if (status === 'in_progress') return 'text-in-progress'
  if (status === 'not_done') return 'text-not-done'
  return 'text-pending'
}

// Fetch resources
onMounted(async () => {
  try {
    // 1. Get school metadata
    const schoolsRes = await $fetch('/api/schools')
    if (schoolsRes && schoolsRes.success) {
      schoolInfo.value = schoolsRes.schools.find(s => s.dmc_code === dmcCode)
    }

    // 2. Get Supabase record
    const assessRes = await $fetch(`/api/assessment?dmc_code=${dmcCode}`)
    if (assessRes && assessRes.success) {
      assessment.value = assessRes.assessment
    }
  } catch (error) {
    console.error('Error loading print page data:', error)
  } finally {
    loading.value = false
    
    // Auto trigger print dialogue once DOM renders
    if (schoolInfo.value && assessment.value) {
      setTimeout(() => {
        window.print()
      }, 1200)
    }
  }
})

// Print manual trigger
const printReport = () => {
  window.print()
}

// Helpers
const getFormTitle = (id) => {
  const titles = {
    'form_1': 'เรื่องที่ 1: ความพร้อมการเปิดภาคเรียนที่ 1 บูรณาการ',
    'form_2': 'เรื่องที่ 2: การติดตามจุดเน้นการพัฒนาคุณภาพการศึกษา สพป.นครราชสีมา เขต 2',
    'form_3': 'เรื่องที่ 3: การประกันคุณภาพการศึกษาภายในสถานศึกษา (QA)',
    'form_4': 'เรื่องที่ 4: การขับเคลื่อนนโยบายจุดเน้น สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)'
  }
  return titles[id] || ''
}

const getStatusLabel = (status) => {
  if (status === 'completed') return 'เสร็จสมบูรณ์'
  if (status === 'draft') return 'บันทึกแบบร่าง'
  return 'ยังไม่ได้ดำเนินการ'
}

const formatThaiDate = (isoString) => {
  if (!isoString) return '-'
  const date = new Date(isoString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) + ' น.'
}

const formatThaiShortDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getForm1RawVal = (itemId) => {
  return assessment.value?.data_form_1?.items?.[itemId] || {}
}

// Form 1 getters
const getForm1Val = (itemId, key) => {
  const data = assessment.value?.data_form_1
  if (!data || !data.items || !data.items[itemId]) {
    return key === 'status' ? 'text-pending' : '-'
  }
  return data.items[itemId][key] || (key === 'status' ? 'text-pending' : '-')
}

const getForm1ValLabel = (itemId) => {
  const status = getForm1Val(itemId, 'status')
  if (status === 'done') return 'ดำเนินการแล้ว'
  if (status === 'in_progress') return 'อยู่ระหว่างดำเนินการ'
  if (status === 'not_done') return 'ยังไม่ดำเนินการ'
  return 'ยังไม่ได้บันทึก'
}

// Form 2 getters
const getForm2CoreVal = (sectionKey, itemId, key) => {
  const data = assessment.value?.data_form_2
  if (!data || !data[sectionKey] || !data[sectionKey][itemId]) return null
  return data[sectionKey][itemId][key]
}

const getForm2InfoVal = (sectionKey, fieldKey) => {
  const data = assessment.value?.data_form_2
  if (!data || !data[sectionKey + '_info']) return '-'
  return data[sectionKey + '_info'][fieldKey] || '-'
}

const getForm2CitizenScore = (subKey, itemId) => {
  const data = assessment.value?.data_form_2?.citizenship
  if (!data || !data[subKey] || !data[subKey][itemId]) return '-'
  return data[subKey][itemId].score ?? '-'
}

const getForm2CitizenEvidence = (subKey, itemId) => {
  const data = assessment.value?.data_form_2?.citizenship
  if (!data || !data[subKey] || !data[subKey][itemId]) return '-'
  return data[subKey][itemId].evidence || '-'
}

// Form 3 getters
const getForm3Val = (itemId, key) => {
  const data = assessment.value?.data_form_3
  if (!data || !data.items || !data.items[itemId]) {
    return key === 'score' ? '-' : '-'
  }
  return data.items[itemId][key] ?? '-'
}

const getForm3ScoreLabel = (score) => {
  const labels = {
    5: 'ยอดเยี่ยม',
    4: 'ดีเลิศ',
    3: 'ดี',
    2: 'ปานกลาง',
    1: 'กำลังพัฒนา'
  }
  return labels[score] || ''
}

const getSchoolSizeLabel = (size) => {
  const labels = {
    small: 'ขนาดเล็ก (นักเรียนน้อยกว่า 119 คน ลงมา)',
    medium: 'ขนาดกลาง (นักเรียนตั้งแต่ 120 - 719 คน)',
    large: 'ขนาดใหญ่ (นักเรียนตั้งแต่ 720 - 1,679 คน)',
    extra_large: 'ขนาดใหญ่พิเศษ (นักเรียนตั้งแต่ 1,680 คน ขึ้นไป)'
  }
  return labels[size] || '-'
}

// Form 4 getters
const getForm4Val = (itemId, key) => {
  const data = assessment.value?.data_form_4
  if (!data || !data.items || !data.items[itemId]) {
    return key === 'status' ? 'text-pending' : '-'
  }
  return data.items[itemId][key] || (key === 'status' ? 'text-pending' : '-')
}

const getForm4ValLabel = (itemId) => {
  const status = getForm4Val(itemId, 'status')
  if (status === 'done') return 'ดำเนินการแล้ว'
  if (status === 'in_progress') return 'อยู่ระหว่างดำเนินการ'
  if (status === 'not_done') return 'ยังไม่ดำเนินการ'
  return 'ยังไม่ได้บันทึก'
}

// Global Feedback getter
const getFeedbackVal = (formFeedbackKey, fieldKey, subKey = null) => {
  const data = assessment.value?.[`data_${formId}`]
  if (!data) return '-'
  
  // Handle Form 3 element specific feedback
  if (formId === 'form_3') {
    if (!data.feedback || !data.feedback[subKey]) return '-'
    return data.feedback[subKey][fieldKey] || '-'
  }

  // Handle Form 2 key specific feedback
  if (formId === 'form_2') {
    if (!data.feedback || !data.feedback[subKey]) return '-'
    return data.feedback[subKey][fieldKey] || '-'
  }

  // Form 1 standard feedback
  if (!data.feedback) return '-'
  return data.feedback[fieldKey] || '-'
}
</script>

<style scoped>
/* Page Layout */
.report-print-container {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: 'Sarabun', 'Inter', sans-serif;
  color: #0f172a;
}

/* Action Bar at the top (Hidden in print) */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  border-radius: 12px;
}

.action-left {
  display: flex;
  gap: 0.75rem;
}

/* Spinner styling */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Document Paper Styles (Simulates an A4 print page on screen) */
.report-paper-body {
  background: white;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 3.5rem 3rem;
  min-height: 297mm; /* standard A4 height ratio */
}

/* Official Header */
.report-doc-header {
  text-align: center;
  margin-bottom: 2rem;
  border-bottom: 2px double #cbd5e1;
  padding-bottom: 1.5rem;
}

.obec-print-logo {
  height: 90px;
  width: auto;
  object-fit: contain;
  margin-bottom: 0.75rem;
}

.report-doc-header h2 {
  font-size: 1.45rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: #0f172a;
}

.report-doc-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
}

.school-year {
  font-size: 0.95rem;
  color: #64748b;
}

/* Metadata table */
.meta-report-section {
  margin-bottom: 2rem;
}

.meta-report-table {
  width: 100%;
  border-collapse: collapse;
}

.meta-report-table td {
  padding: 0.6rem 0.8rem;
  border: 1px solid #cbd5e1;
  font-size: 0.95rem;
}

.meta-report-table td strong {
  color: #1e293b;
}

.status-print-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-print-badge.completed { background: #d1fae5; color: #065f46; }
.status-print-badge.draft { background: #fef3c7; color: #92400e; }
.status-print-badge.pending { background: #f1f5f9; color: #475569; }

/* Data Table */
.report-content-section {
  margin-bottom: 2rem;
}

.section-doc-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  border-left: 4px solid #4f46e5;
  padding-left: 0.6rem;
  margin: 2rem 0 1rem;
}

.report-data-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
}

.report-data-table th {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  padding: 0.75rem;
  font-weight: 700;
  font-size: 0.9rem;
  color: #1e293b;
  text-align: left;
}

.report-data-table td {
  border: 1px solid #cbd5e1;
  padding: 0.7rem;
  font-size: 0.9rem;
  line-height: 1.45;
}

.report-data-table th.text-center,
.report-data-table td.text-center {
  text-align: center;
}

.table-group-header {
  background: #f1f5f9;
}

.table-group-header td {
  font-weight: 700;
  font-size: 0.9rem;
  color: #1e293b;
}

.evidence-cell {
  color: #475569;
  font-style: italic;
  font-size: 0.85rem;
}

/* Text status styling in printing */
.text-done {
  color: #059669;
  font-weight: 600;
}

.text-in-progress {
  color: #d97706;
  font-weight: 600;
}

.text-not-done {
  color: #dc2626;
  font-weight: 600;
}

.text-pending {
  color: #64748b;
}

/* Feedback Box */
.feedback-doc-box {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 1.25rem;
  margin-top: 2rem;
}

.feedback-doc-item {
  margin-bottom: 1rem;
}

.feedback-doc-item:last-child {
  margin-bottom: 0;
}

.feedback-doc-item strong {
  font-size: 0.95rem;
  color: #1e293b;
  display: block;
  margin-bottom: 0.25rem;
}

.feedback-doc-item p {
  font-size: 0.9rem;
  color: #334155;
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.6rem;
  border-radius: 4px;
  min-height: 38px;
  line-height: 1.5;
}

/* Signature Footer */
.report-signature-footer {
  margin-top: 4rem;
  border-top: 1px solid #cbd5e1;
  padding-top: 2rem;
}

.signature-row {
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.signature-col {
  width: 45%;
}

.signature-col p {
  color: #0f172a;
}

/* CSS Page Break Helper */
.print-page-break {
  display: none;
}

/* Print Overrides */
@media print {
  /* Layout setup */
  body {
    background: white !important;
    color: black !important;
  }
  
  .report-print-container {
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .report-paper-body {
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .no-print {
    display: none !important;
  }

  /* Keep table rows intact (don't break elements across page boundaries) */
  tr, .print-avoid-break {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .print-page-break {
    display: block !important;
    page-break-after: always !important;
    break-after: always !important;
  }

  /* Adjust typography for print sizing */
  .obec-print-logo {
    height: 80px !important;
  }
  
  .report-doc-header h2 {
    font-size: 1.35rem !important;
  }

  .report-doc-header h3 {
    font-size: 1.15rem !important;
  }

  .report-data-table th, 
  .report-data-table td,
  .meta-report-table td {
    padding: 0.5rem !important;
    font-size: 0.85rem !important;
  }

  .feedback-doc-item p {
    padding: 0.4rem !important;
    font-size: 0.85rem !important;
    min-height: auto !important;
  }
}
</style>
