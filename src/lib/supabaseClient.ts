import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://woytkkdndxpspbdrpbbt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndveXRra2RuZHhwc3BiZHJwYmJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE3MTYwNiwiZXhwIjoyMDY1NzQ3NjA2fQ.iJ1pDCZE0V1_9jLg0e_vHVZr-Fddi1fG8gZhrCrtAw0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
