import { supabase } from '../config/supabaseClient';

export const adminService = {
  // User Management
  getAllUsers: async () => {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  createUser: async (userData) => {
    // IMPORTANT: This only creates a record in the 'users' profile table.
    // We use an upsert approach to avoid conflicts if a record with the same email already exists.
    const { data, error } = await supabase
      .from('users')
      .upsert([userData], { onConflict: 'email' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateUser: async (id, userData) => {
    const { data, error } = await supabase.from('users').update(userData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  
  deleteUser: async (id) => {
    // Call RPC to delete from both auth.users and public.users
    const { data, error } = await supabase.rpc('delete_user_v2', { user_id: id });
    if (error) throw error;
    return { id, success: true };
  },

  // Problem Management
  getAllProblems: async () => {
    const { data, error } = await supabase.rpc('admin_manage_problem', { p_op: 'SELECT' });
    if (error) throw error;
    return data || [];
  },
  createProblem: async (problemData) => {
    const { data, error } = await supabase.rpc('admin_manage_problem', { 
      p_op: 'INSERT', 
      p_data: problemData 
    });
    if (error) throw error;
    return data;
  },
  updateProblem: async (id, problemData) => {
    const { data, error } = await supabase.rpc('admin_manage_problem', { 
      p_op: 'UPDATE', 
      p_id: id, 
      p_data: problemData 
    });
    if (error) throw error;
    return data;
  },
  deleteProblem: async (id) => {
    // We can use standard DELETE because it's row-level and teachers have access via RLS
    const { data, error } = await supabase.from('problems').delete().eq('id', id).select('id');
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Problem not found or permission denied');
    return data[0];
  },
  approveProblem: async (id, approvalData) => {
    const { data, error } = await supabase.rpc('admin_manage_problem', { 
      p_op: 'UPDATE', 
      p_id: id, 
      p_data: {
        is_approved: true,
        is_arena_problem: approvalData.is_arena_problem,
        hardness_score: approvalData.hardness_score
      }
    });
    if (error) throw error;
    return data;
  },

  // Challenge Management
  getAllChallenges: async () => {
    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        participants:challenge_participants!challenge_participants_challenge_id_fkey(count),
        created_by:users!challenges_created_by_fkey (id, name, role)
      `);
    if (error) throw error;
    
    // Flatten the count from the join
    return data.map(c => ({
      ...c,
      participant_count: c.participants?.[0]?.count || 0
    }));
  },
  deleteChallenge: async (id) => {
    const { data, error } = await supabase.from('challenges').delete().eq('id', id).select();
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Challenge not found or permission denied');
    return data[0];
  },

  // Course Management
  getAllCourses: async () => {
    const { data, error } = await supabase.from('courses').select('*');
    if (error) throw error;
    return data;
  },
  createCourse: async (courseData) => {
    const dataToInsert = { ...courseData };
    if (!dataToInsert.slug && dataToInsert.title) {
      const baseSlug = dataToInsert.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const suffix = Math.random().toString(36).substring(2, 6);
      dataToInsert.slug = `${baseSlug}-${suffix}`;
    }
    const { data, error } = await supabase.from('courses').insert([dataToInsert]).select();
    if (error) throw error;
    return data[0];
  },
  updateCourse: async (id, courseData) => {
    const { data, error } = await supabase.from('courses').update(courseData).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },
  deleteCourse: async (id) => {
    const { data, error } = await supabase.from('courses').delete().eq('id', id).select();
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Course not found or permission denied');
    return data[0];
  },

  // Dashboard Summary
  getAdminStats: async () => {
    try {
      const [usersResponse, classroomsResponse, problemsResponse] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact' }),
        supabase.from('classrooms').select('id', { count: 'exact' }),
        supabase.from('problems').select('id', { count: 'exact' })
      ]);

      const users = usersResponse.data || [];
      const total_xp = users.reduce((acc, u) => acc + (u.xp || 0), 0);
      
      return {
        total_users: usersResponse.count || 0,
        active_classes: classroomsResponse.count || 0,
        challenges_count: problemsResponse.count || 0,
        total_xp: total_xp,
        recent_users: [...users].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  }
};

export default adminService;
