import { serverSupabaseClient } from '#supabase/server'

interface SchoolCsvRow {
  dmc_code: string
  name: string
  subdistrict: string
  district: string
  school_group: string
  email: string
  website_url: string
  distance_km: string
  lat: string
  lng: string
}

export default defineEventHandler(async (event) => {
  // 1. Read and parse the CSV file
  let schools: SchoolCsvRow[] = []
  try {
    const csvContent = await useStorage('assets:server').getItem<string>('schools_2026-06-05.csv')
    if (!csvContent) throw new Error('CSV file not found in assets storage')
    const lines = csvContent.split('\n')
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      let cleanLine = line
      if (cleanLine.startsWith('"')) cleanLine = cleanLine.substring(1)
      if (cleanLine.endsWith('"')) cleanLine = cleanLine.substring(0, cleanLine.length - 1)
      
      const cols = cleanLine.split('","')
      
      if (cols.length >= 10) {
        schools.push({
          dmc_code: cols[0],
          name: cols[1],
          subdistrict: cols[2],
          district: cols[3],
          school_group: cols[4],
          email: cols[5],
          website_url: cols[6],
          distance_km: cols[7],
          lat: cols[8],
          lng: cols[9]
        })
      }
    }
  } catch (error) {
    console.error('Error reading schools CSV:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Could not read school database file.'
    })
  }

  // 2. Fetch existing assessment records from Supabase
  let assessmentsMap: Record<string, any> = {}
  try {
    const client = await serverSupabaseClient(event)
    const { data, error } = await client
      .from('school_assessments')
      .select(`
        dmc_code, 
        status_form_1, status_form_2, status_form_3, status_form_4, 
        assessor_form_1, assessor_form_2, assessor_form_3, assessor_form_4,
        unlocked_form_1, unlocked_form_2, unlocked_form_3, unlocked_form_4,
        assessor_name,
        data_form_1, data_form_2, data_form_3, data_form_4
      `)

    if (error) {
      console.warn('Supabase fetch warning:', error.message)
    } else if (data) {
      data.forEach((record) => {
        assessmentsMap[record.dmc_code] = record
      })
    }
  } catch (error) {
    console.warn('Supabase not connected. Proceeding with default pending statuses.')
  }

  // 3. Merge CSV data with database states
  const mergedSchools = schools.map((school) => {
    const dbRecord = assessmentsMap[school.dmc_code]
    return {
      ...school,
      assessor_name: dbRecord?.assessor_name || '',
      assessor_form_1: dbRecord?.assessor_form_1 || '',
      assessor_form_2: dbRecord?.assessor_form_2 || '',
      assessor_form_3: dbRecord?.assessor_form_3 || '',
      assessor_form_4: dbRecord?.assessor_form_4 || '',
      status_form_1: dbRecord?.status_form_1 || 'pending',
      status_form_2: dbRecord?.status_form_2 || 'pending',
      status_form_3: dbRecord?.status_form_3 || 'pending',
      status_form_4: dbRecord?.status_form_4 || 'pending',
      unlocked_form_1: dbRecord?.unlocked_form_1 || false,
      unlocked_form_2: dbRecord?.unlocked_form_2 || false,
      unlocked_form_3: dbRecord?.unlocked_form_3 || false,
      unlocked_form_4: dbRecord?.unlocked_form_4 || false,
      data_form_1: dbRecord?.data_form_1 || {},
      data_form_2: dbRecord?.data_form_2 || {},
      data_form_3: dbRecord?.data_form_3 || {},
      data_form_4: dbRecord?.data_form_4 || {}
    }
  })

  return {
    success: true,
    schools: mergedSchools
  }
})
