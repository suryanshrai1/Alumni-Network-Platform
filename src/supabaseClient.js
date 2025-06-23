// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vkqnhmlbahwpcqajsiru.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrcW5obWxiYWh3cGNxYWpzaXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzkyMDEsImV4cCI6MjA2NjE1NTIwMX0.Wr_CLo48J6in_pUdbg2WrhB_vm1-A9ECLZUJyn3QD7Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
