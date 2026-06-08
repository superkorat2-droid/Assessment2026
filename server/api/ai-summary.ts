import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const dmcCode = query.dmc_code as string
  const apiKey = process.env.GEMINI_API_KEY || ''

  try {
    const client = await serverSupabaseClient(event)
    
    // --- CASE 1: Single School AI Summary ---
    if (dmcCode) {
      const { data: schoolRecord, error } = await client
        .from('school_assessments')
        .select('*')
        .eq('dmc_code', dmcCode)
        .maybeSingle()

      if (error) throw error

      if (!schoolRecord) {
        return {
          success: false,
          message: 'ไม่พบข้อมูลการประเมินของโรงเรียนที่ระบุ'
        }
      }

      const prompt = `คุณคือผู้เชี่ยวชาญด้านการศึกษานิเทศก์และผู้ประเมินคุณภาพการศึกษามืออาชีพ
ช่วยวิเคราะห์และสรุปผลการประเมินรายโรงเรียนโดยละเอียดสำหรับ:
โรงเรียน: ${schoolRecord.school_name}
รหัส DMC: ${schoolRecord.dmc_code}
อำเภอ: ${schoolRecord.district}
ศูนย์เครือข่าย: ${schoolRecord.school_group}
ศึกษานิเทศก์ผู้ประเมิน: ${schoolRecord.assessor_name || 'ไม่ระบุชื่อ'}

ข้อมูลดิบแบบประเมินจริง (ในรูปแบบ JSON):
- ด้านความพร้อมเปิดเรียน (ตอนที่ 2): ${JSON.stringify(schoolRecord.data_form_1)}
- จุดเน้นอ่านเขียนคิดเลข (ตอนที่ 3): ${JSON.stringify(schoolRecord.data_form_2)}
- การประกันคุณภาพภายใน (ตอนที่ 4): ${JSON.stringify(schoolRecord.data_form_3)}
- นโยบาย สพฐ. (ตอนที่ 5): ${JSON.stringify(schoolRecord.data_form_4)}

โปรดสรุปผลการประเมินนี้เป็นภาษาไทยที่กระชับและเป็นทางการ โดยแบ่งออกเป็นหัวข้อดังนี้:
1. **จุดเด่นและจุดแข็งที่เด่นชัด** (สรุปจากผลการดำเนินงานที่เสร็จสิ้นหรือระดับคุณภาพดีเยี่ยม 4-5)
2. **จุดวิกฤตและจุดที่ควรปรับปรุงอย่างเร่งด่วน** (พิจารณาจากข้อที่อยู่ระหว่างดำเนินการ, ยังไม่ดำเนินการ หรือระดับคุณภาพ 1-2)
3. **ข้อเสนอแนะเชิงยุทธศาสตร์เพื่อการพัฒนาโรงเรียน** (ให้คำแนะนำที่สามารถนำไปปฏิบัติจริงได้ตามบริบทโรงเรียนนี้)`

      if (!apiKey) {
        // Simulated AI response fallback
        return {
          success: true,
          simulated: true,
          analysis: generateMockSchoolAnalysis(schoolRecord)
        }
      }

      const aiResponse = await callGemini(apiKey, prompt)
      return {
        success: true,
        simulated: false,
        analysis: aiResponse
      }
    }

    // --- CASE 2: Area-wide Global AI Analysis ---
    const { data: allRecords, error } = await client
      .from('school_assessments')
      .select('*')

    if (error) throw error

    if (!allRecords || allRecords.length === 0) {
      return {
        success: true,
        empty: true,
        message: 'ยังไม่มีข้อมูลการประเมินของโรงเรียนใดๆ ในระบบสำหรับการประมวลผล'
      }
    }

    // Compile statistics
    const totalAssessed = allRecords.length
    const form1Completed = allRecords.filter(r => r.status_form_1 === 'completed').length
    const form2Completed = allRecords.filter(r => r.status_form_2 === 'completed').length
    const form3Completed = allRecords.filter(r => r.status_form_3 === 'completed').length
    const form4Completed = allRecords.filter(r => r.status_form_4 === 'completed').length
    
    const prompt = `คุณคือที่ปรึกษาระดับนโยบายการจัดการศึกษาและผู้อำนวยการเขตพื้นที่การศึกษา
ช่วยเขียนรายงานวิเคราะห์ภาพรวมการตรวจราชการและการเตรียมความพร้อมโรงเรียนในสังกัดสำนักงานเขตพื้นที่การศึกษาประถมศึกษานครราชสีมา เขต 2 
จากข้อมูลโรงเรียนสะสมจำนวน ${totalAssessed} โรงเรียนที่ได้รับการประเมินแล้ว ดังนี้:
- แบบประเมินความพร้อมเปิดเรียน (ประเมินเสร็จสิ้นแล้ว ${form1Completed} โรงเรียน)
- แบบประเมินจุดเน้นอ่านเขียนคิดเลข (ประเมินเสร็จสิ้นแล้ว ${form2Completed} โรงเรียน)
- แบบประเมินการประกันคุณภาพภายใน (ประเมินเสร็จสิ้นแล้ว ${form3Completed} โรงเรียน)
- แบบประเมินจุดเน้น สพฐ. (ประเมินเสร็จสิ้นแล้ว ${form4Completed} โรงเรียน)

โปรดเขียนวิเคราะห์รายงานภาพรวมเชิงสถิติ แนวโน้ม และข้อจำกัดที่พบมากที่สุด พร้อมระบุเขตหรือกลุ่มโรงเรียนที่ต้องได้รับการสนับสนุนเร่งด่วน โดยตอบเป็นภาษาไทยที่เป็นทางการและกระชับ`

    if (!apiKey) {
      return {
        success: true,
        simulated: true,
        analysis: generateMockGlobalAnalysis(allRecords)
      }
    }

    const aiResponse = await callGemini(apiKey, prompt)
    return {
      success: true,
      simulated: false,
      analysis: aiResponse
    }

  } catch (error: any) {
    console.error('Error generating AI summary:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `AI Summary Error: ${error.message || error}`
    })
  }
})

// Call Gemini API utility
async function callGemini(apiKey: string, prompt: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
  
  const response = await $fetch<any>(url, {
    method: 'POST',
    body: {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    }
  })

  return response?.candidates?.[0]?.content?.parts?.[0]?.text || 'ไม่สามารถรับข้อมูลจาก AI ได้'
}

// Fallback Mock School analysis generator
function generateMockSchoolAnalysis(record: any) {
  return `### 🏫 รายงานการวิเคราะห์โรงเรียน ${record.school_name} (จำลองวิเคราะห์)
*(ตั้งค่าคีย์ GEMINI_API_KEY ในไฟล์ .env เพื่อเปิดใช้งานระบบ AI ประมวลผลข้อความจริง)*

1. **จุดเด่นและจุดแข็งที่เด่นชัด**
   * โรงเรียนมีความพร้อมด้านวิชาการสูง มีปฏิทินเวลาเรียนและตารางสอนที่ชัดเจนตั้งแต่วันแรกที่เปิดภาคเรียน
   * ด้านการประกันคุณภาพภายใน: มีการกำหนดมาตรฐานการศึกษาของสถานศึกษาในเกณฑ์ดีและผ่านความเห็นชอบจากคณะกรรมการสถานศึกษาเรียบร้อยแล้ว
   * อาคารสถานที่ ประตู รั้ว ป้ายโรงเรียนได้รับการปรับปรุงให้สะอาด ปลอดภัย และสวยงามเอื้อต่อการเรียนการสอน

2. **จุดวิกฤตและจุดที่ควรปรับปรุงอย่างเร่งด่วน**
   * อาหารกลางวัน: พบว่าบางประเด็นยังมีอุปกรณ์ล้างภาชนะและน้ำดื่มสะอาดที่ต้องดูแลรักษาความปลอดภัยเพิ่มเติม
   * ด้านระบบดูแลช่วยเหลือนักเรียน: แผนความปลอดภัยและการซักซ้อมแผนเผชิญเหตุของโรงเรียนยังอยู่ระหว่างดำเนินการ ควรได้รับการเร่งรัดให้เสร็จสิ้นโดยเร็ว
   * นโยบาย สพฐ. ด้านการยกระดับผลสัมฤทธิ์ตามเกณฑ์ PISA ยังขาดสื่อการจัดกิจกรรมและกระบวนการเรียนรู้เชิงรุกสำหรับครูผู้สอน

3. **ข้อเสนอแนะเชิงยุทธศาสตร์เพื่อการพัฒนา**
   * *ด้านการเรียนรู้:* สนับสนุนให้เกิดวงสนทนาแลกเปลี่ยน PLC ระหว่างครูผู้สอน เพื่อยกระดับความสามารถในการสร้างสื่อ/นวัตกรรมการอ่านออกเขียนได้
   * *ด้านกายภาพและความปลอดภัย:* ดำเนินการปรับปรุงและติดตั้งระบบตรวจสอบถังเก็บน้ำดื่มของโรงเรียน และจัดกิจกรรมซักซ้อมแผนเผชิญเหตุอุบัติภัยเป็นระยะ
   * *ด้านงบประมาณ:* จัดลำดับความสำคัญของงบประมาณโครงการอาหารกลางวันและงบวัสดุเพื่อจัดหาอุปกรณ์การเรียนให้ครอบคลุมนักเรียนทุกกลุ่ม`
}

// Fallback Mock Global analysis generator
function generateMockGlobalAnalysis(records: any[]) {
  const total = records.length
  return `### 📊 รายงานภาพรวมเชิงบริหารระดับเขตพื้นที่ฯ (จำลองวิเคราะห์สะสม)
*(ตั้งค่าคีย์ GEMINI_API_KEY ในไฟล์ .env เพื่อเปิดใช้งานระบบ AI ประมวลผลภาพรวมจากข้อมูลจริง)*

ข้อมูลสะสมจากโรงเรียนที่ประเมินแล้ว **${total} โรงเรียน** แสดงทิศทางดังนี้:

1. **แนวโน้มและสภาพความพร้อมภาพรวม**
   * โรงเรียนมากกว่าร้อยละ 85 มีความพร้อมด้านการจัดการตารางสอนและครูผู้สอนเข้าปฏิบัติงานตรงตามเวลาตั้งแต่วันแรก
   * ระบบการประกันคุณภาพภายใน (SAR) เป็นประเด็นที่ทุกโรงเรียนดำเนินการได้อย่างเป็นระเบียบและเป็นระบบสูงสุด

2. **ประเด็นที่เป็นปัญหาร่วมระดับเขตพื้นที่ฯ**
   * **การยกระดับการคิดวิเคราะห์ (PISA):** โรงเรียนขนาดเล็กหลายแห่งยังประสบความช่วยเหลือด้านเครื่องมือและการเข้าถึงแพลตฟอร์มการประเมินความฉลาดรู้
   * **ระบบดูแลความปลอดภัยและการเดินทาง:** ประเด็นการจัดทำแผนเผชิญเหตุและการซักซ้อมความปลอดภัยส่วนใหญ่ยังค้างคาในระดับ "อยู่ระหว่างดำเนินการ"
   * **ภาวะทุพโภชนาการและสุขาภิบาล:** ระบบบำบัดน้ำดื่มและสุขาภิบาลของห้องครัวโรงเรียนบางส่วนต้องได้รับความช่วยเหลือด้านงบประมาณเพิ่มเติม

3. **มาตรการสนับสนุนยุทธศาสตร์ระดับเขต**
   * *ระดับเร่งด่วน:* จัดสรรงบประมาณสนับสนุนหรือจับคู่โรงเรียนพี่เลี้ยงพัฒนาปรับปรุงอาคารเรียนและไฟฟ้า-ประปาของโรงเรียนกลุ่มเสี่ยง
   * *ระดับวิชาการ:* จัดกิจกรรมอบรมหลักสูตรเชิงรุกและพัฒนาทักษะการประเมิน PISA ให้กับครูชั้นประถมศึกษาและมัธยมศึกษาตอนต้นเป็นรายเครือข่าย`
}
