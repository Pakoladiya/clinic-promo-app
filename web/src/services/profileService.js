import supabase from './supabaseClient';

export const getProfile = async (userId) => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
};

export const upsertProfile = (userId, fields) =>
  supabase.from('profiles').upsert({ id: userId, ...fields, updated_at: new Date().toISOString() });

export const uploadLogo = async (userId, file) => {
  const ext  = file.name.split('.').pop();
  const path = `logos/${userId}.${ext}`;

  const { error } = await supabase.storage
    .from('clinic-assets')
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('clinic-assets')
    .getPublicUrl(path);

  return publicUrl;
};
