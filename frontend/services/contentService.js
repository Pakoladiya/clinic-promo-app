import supabase from './supabaseClient';

export const fetchContentByDiscipline = async (discipline) => {
    const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('discipline', discipline)
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

export const addContent = async (newContent) => {
    const { data, error } = await supabase
        .from('content')
        .insert([newContent])
        .select();
    if (error) throw new Error(error.message);
    return data;
};

export const updateContent = async (id, updatedContent) => {
    const { data, error } = await supabase
        .from('content')
        .update(updatedContent)
        .eq('id', id)
        .select();
    if (error) throw new Error(error.message);
    return data;
};

export const deleteContent = async (id) => {
    const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);
    if (error) throw new Error(error.message);
};
