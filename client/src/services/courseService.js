import { supabase } from '../config/supabaseClient';

export const courseService = {
  getAllCourses: async () => {
    const { data, error } = await supabase.from('courses').select('*');
    if (error) throw new Error(error.message);
    return data;
  },

  getCourseById: async (id) => {
    const { data, error } = await supabase.from('courses').select('*').eq('id', id).single();
    if (error) throw new Error(error.message);
    return data;
  },
  subscribeToCourses: (callback) => {
    return supabase
      .channel('public:courses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, callback)
      .subscribe();
  }
};

export default courseService;
