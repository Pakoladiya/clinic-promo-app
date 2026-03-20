import supabase from './supabaseClient';

export const fetchByDiscipline = (discipline) =>
  supabase
    .from('content')
    .select('*')
    .eq('discipline', discipline)
    .order('created_at', { ascending: false });

export const fetchDisciplines = () =>
  supabase
    .from('content')
    .select('discipline')
    .then(({ data }) => [...new Set(data?.map(r => r.discipline) ?? [])]);
