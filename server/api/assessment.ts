import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  // --- GET REQUEST: Fetch assessment data for a single school ---
  if (method === 'GET') {
    const query = getQuery(event)
    const dmcCode = query.dmc_code as string

    if (!dmcCode) {
      throw createError({
        statusCode: 400,
        statusMessage: 'DMC Code is required.'
      })
    }

    try {
      const client = await serverSupabaseClient(event)
      const { data, error } = await client
        .from('school_assessments')
        .select('*')
        .eq('dmc_code', dmcCode)
        .maybeSingle()

      if (error) {
        console.error('Supabase query error:', error.message)
        throw error
      }

      if (data) {
        return {
          success: true,
          exists: true,
          assessment: data
        }
      }
    } catch (e) {
      console.warn('Database query failed. Returning mock empty assessment state.')
    }

    return {
      success: true,
      exists: false,
      assessment: {
        dmc_code: dmcCode,
        assessor_name: '',
        assessor_form_1: '',
        assessor_form_2: '',
        assessor_form_3: '',
        assessor_form_4: '',
        status_form_1: 'pending',
        status_form_2: 'pending',
        status_form_3: 'pending',
        status_form_4: 'pending',
        data_form_1: {},
        data_form_2: {},
        data_form_3: {},
        data_form_4: {}
      }
    }
  }

  // --- POST REQUEST: Save or Update assessment data (Draft or Complete) ---
  if (method === 'POST') {
    const body = await readBody(event)
    const {
      dmc_code,
      school_name,
      district,
      school_group,
      assessor_name,
      form_type,
      status, // 'draft' | 'completed'
      data
    } = body

    if (!dmc_code || !form_type || !status) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters: dmc_code, form_type, status.'
      })
    }

    try {
      const client = await serverSupabaseClient(event)

      // Get current record to preserve other columns
      const { data: existingRecord } = await client
        .from('school_assessments')
        .select('*')
        .eq('dmc_code', dmc_code)
        .maybeSingle()

      if (existingRecord) {
        const currentStatus = existingRecord[`status_${form_type}`]
        const isUnlocked = existingRecord[`unlocked_${form_type}`]
        if (currentStatus === 'completed' && !isUnlocked) {
          throw createError({
            statusCode: 403,
            statusMessage: 'แบบประเมินนี้ถูกล็อกการแก้ไขแล้ว กรุณาติดต่อผู้ดูแลระบบ (Admin) เพื่อปลดล็อก'
          })
        }
      }

      const upsertData: Record<string, any> = {
        dmc_code,
        school_name,
        district,
        school_group,
        updated_at: new Date().toISOString()
      }

      // Populate form-specific status, data, and assessor name
      if (form_type === 'form_1') {
        upsertData.status_form_1 = status
        upsertData.data_form_1 = data
        upsertData.assessor_form_1 = assessor_name || existingRecord?.assessor_form_1 || ''
      } else if (form_type === 'form_2') {
        upsertData.status_form_2 = status
        upsertData.data_form_2 = data
        upsertData.assessor_form_2 = assessor_name || existingRecord?.assessor_form_2 || ''
      } else if (form_type === 'form_3') {
        upsertData.status_form_3 = status
        upsertData.data_form_3 = data
        upsertData.assessor_form_3 = assessor_name || existingRecord?.assessor_form_3 || ''
      } else if (form_type === 'form_4') {
        upsertData.status_form_4 = status
        upsertData.data_form_4 = data
        upsertData.assessor_form_4 = assessor_name || existingRecord?.assessor_form_4 || ''
      }

      // Combine all assessors into assessor_name for display
      const assessors = [
        upsertData.assessor_form_1 || existingRecord?.assessor_form_1,
        upsertData.assessor_form_2 || existingRecord?.assessor_form_2,
        upsertData.assessor_form_3 || existingRecord?.assessor_form_3,
        upsertData.assessor_form_4 || existingRecord?.assessor_form_4
      ].filter(Boolean)
      
      // Remove duplicate names and join by comma
      upsertData.assessor_name = Array.from(new Set(assessors)).join(', ')

      const { error } = await client
        .from('school_assessments')
        .upsert(upsertData)

      if (error) {
        throw error
      }

      return {
        success: true,
        message: 'Assessment saved successfully.'
      }
    } catch (error: any) {
      if (error.statusCode) throw error
      console.error('Error saving assessment:', error)
      throw createError({
        statusCode: 500,
        statusMessage: `Database error: ${error.message || error}`
      })
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed'
  })
})
