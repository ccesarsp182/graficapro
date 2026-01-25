
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://imcdbmjevxjlgvzcegyq.supabase.co';
const supabaseAnonKey = 'sb_publishable_rTgutoKWEFruqKwouXtl6w_2O3VRuBj';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
