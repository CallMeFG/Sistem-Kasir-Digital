import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nucgkixfgsebwazyhoty.supabase.co';
const supabaseKey = 'sb_publishable_rrwVJA2a3azqnuXhfh-WrA_NYriCwxT';

export const supabase = createClient(supabaseUrl, supabaseKey);