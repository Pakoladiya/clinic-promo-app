// contentService.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

export const fetchContentByDiscipline = async (discipline) => {
    const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('discipline', discipline);

    if (error) {
        throw new Error(error.message);
    }
    return data;
};

export const addContent = async (newContent) => {
    const { data, error } = await supabase
        .from('content')
        .insert([newContent]);

    if (error) {
        throw new Error(error.message);
    }
    return data;
};

export const updateContent = async (id, updatedContent) => {
    const { data, error } = await supabase
        .from('content')
        .update(updatedContent)
        .eq('id', id);

    if (error) {
        throw new Error(error.message);
    }
    return data;
};

export const deleteContent = async (id) => {
    const { data, error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(error.message);
    }
    return data;
};
