import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { action, dmc_code, form_type, unlocked } = body

  if (!action || !dmc_code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing action or dmc_code parameter.'
    })
  }

  const client = await serverSupabaseClient(event)

  // --- ACTION: DELETE (Reset all evaluations for the school) ---
  if (action === 'delete') {
    try {
      const { error } = await client
        .from('school_assessments')
        .delete()
        .eq('dmc_code', dmc_code)

      if (error) throw error

      return {
        success: true,
        message: 'ลบข้อมูลการประเมินเรียบร้อยแล้ว'
      }
    } catch (e: any) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to delete record: ${e.message || e}`
      })
    }
  }

  // --- ACTION: CLEAR ALL (Delete all assessments in the database) ---
  if (action === 'clear-all') {
    try {
      const { error } = await client
        .from('school_assessments')
        .delete()
        .neq('dmc_code', '') // deletes all rows as dmc_code is never empty

      if (error) throw error

      return {
        success: true,
        message: 'ล้างข้อมูลการประเมินทั้งหมดในระบบเรียบร้อยแล้ว'
      }
    } catch (e: any) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to clear all records: ${e.message || e}`
      })
    }
  }

  // --- ACTION: RESET FORM (Reset a single evaluation form for the school) ---
  if (action === 'reset-form') {
    if (!form_type) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing form_type parameter.'
      })
    }

    try {
      const { data: record, error: fetchErr } = await client
        .from('school_assessments')
        .select('*')
        .eq('dmc_code', dmc_code)
        .maybeSingle()

      if (fetchErr) throw fetchErr

      if (!record) {
        return {
          success: true,
          message: 'ไม่พบข้อมูลการประเมินเพื่อรีเซ็ต'
        }
      }

      const updateData: Record<string, any> = {}
      if (form_type === 'form_1') {
        updateData.status_form_1 = 'pending'
        updateData.data_form_1 = {}
        updateData.assessor_form_1 = ''
        updateData.unlocked_form_1 = false
      } else if (form_type === 'form_2') {
        updateData.status_form_2 = 'pending'
        updateData.data_form_2 = {}
        updateData.assessor_form_2 = ''
        updateData.unlocked_form_2 = false
      } else if (form_type === 'form_3') {
        updateData.status_form_3 = 'pending'
        updateData.data_form_3 = {}
        updateData.assessor_form_3 = ''
        updateData.unlocked_form_3 = false
      } else if (form_type === 'form_4') {
        updateData.status_form_4 = 'pending'
        updateData.data_form_4 = {}
        updateData.assessor_form_4 = ''
        updateData.unlocked_form_4 = false
      }

      // Recalculate remaining assessors
      const assessors = [
        form_type === 'form_1' ? '' : record.assessor_form_1,
        form_type === 'form_2' ? '' : record.assessor_form_2,
        form_type === 'form_3' ? '' : record.assessor_form_3,
        form_type === 'form_4' ? '' : record.assessor_form_4
      ].filter(Boolean)

      updateData.assessor_name = Array.from(new Set(assessors)).join(', ')

      const { error } = await client
        .from('school_assessments')
        .update(updateData)
        .eq('dmc_code', dmc_code)

      if (error) throw error

      return {
        success: true,
        message: 'รีเซ็ตข้อมูลแบบประเมินนี้เรียบร้อยแล้ว'
      }
    } catch (e: any) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to reset form: ${e.message || e}`
      })
    }
  }

  // --- ACTION: TOGGLE LOCK (Lock/Unlock editing for a specific form) ---
  if (action === 'toggle-lock') {
    if (!form_type || unlocked === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing form_type or unlocked parameter.'
      })
    }

    try {
      const updateData: Record<string, any> = {}
      if (form_type === 'form_1') {
        updateData.unlocked_form_1 = unlocked
      } else if (form_type === 'form_2') {
        updateData.unlocked_form_2 = unlocked
      } else if (form_type === 'form_3') {
        updateData.unlocked_form_3 = unlocked
      } else if (form_type === 'form_4') {
        updateData.unlocked_form_4 = unlocked
      }

      // If unlocked is set to true, also check if status is completed
      // Supabase supports partial updates using update/eq
      const { error } = await client
        .from('school_assessments')
        .update(updateData)
        .eq('dmc_code', dmc_code)

      if (error) throw error

      return {
        success: true,
        message: unlocked ? 'ปลดล็อกฟอร์มประเมินเรียบร้อยแล้ว' : 'ล็อกฟอร์มประเมินเรียบร้อยแล้ว'
      }
    } catch (e: any) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to update lock status: ${e.message || e}`
      })
    }
  }

  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid action.'
  })
})
