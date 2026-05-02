import { supabase } from '../config/supabaseClient';

export const problemService = {
  getProblems: async (params = {}) => {
    // Explicitly exclude sensitive columns (test_cases, starter_code) for list views
    const columns = 'id, slug, title, difficulty, category, course, is_practice, tags, description, examples, constraints, creator_id, is_approved, is_arena_problem, hardness_score, created_at';
    let query = supabase.from('problems').select(columns);
    if (params.difficulty) query = query.eq('difficulty', params.difficulty);
    if (params.category) query = query.eq('category', params.category);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  getAllProblems: async (params = {}) => {
    return problemService.getProblems(params);
  },
  getArenaProblems: async () => {
    const columns = 'id, slug, title, difficulty, category, course, is_practice, tags, description, examples, constraints, creator_id, is_approved, is_arena_problem, hardness_score, created_at';
    const { data, error } = await supabase
      .from('problems')
      .select(columns)
      .eq('is_arena_problem', true)
      .eq('is_approved', true);
    if (error) throw error;
    return data;
  },
  getUnapprovedProblems: async () => {
    const columns = 'id, slug, title, difficulty, category, course, is_practice, tags, description, examples, constraints, creator_id, is_approved, is_arena_problem, hardness_score, created_at';
    const { data, error } = await supabase.from('problems').select(columns).eq('is_approved', false);
    if (error) throw error;
    return data;
  },
  getProblemById: async (id) => {
    const { data, error } = await supabase.rpc('get_problem_for_student', { p_id_or_slug: id });
    if (error) throw error;
    if (!data) throw new Error('Problem not found');
    return data;
  },
  createProblem: async (problemData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required to create problems');

    // Clone the object to avoid mutating the original reference
    const dataToInsert = { 
      ...problemData,
      creator_id: user.id 
    };

    // Auto-generate slug via server-side RPC if missing
    if (!dataToInsert.slug && dataToInsert.title) {
      const { data: slug, error: slugError } = await supabase.rpc('generate_unique_problem_slug', { title: dataToInsert.title });
      if (slugError) throw slugError;
      dataToInsert.slug = slug;
    }
    
    const columns = 'id, slug, title, difficulty, category, course, is_practice, tags, description, examples, constraints, creator_id, is_approved, is_arena_problem, hardness_score, created_at';
    const { data, error } = await supabase.from('problems').insert([dataToInsert]).select(columns);
    if (error) throw error;
    return data[0];
  },
  updateProblem: async (id, problemData) => {
    const columns = 'id, slug, title, difficulty, category, course, is_practice, tags, description, examples, constraints, creator_id, is_approved, is_arena_problem, hardness_score, created_at';
    const { data, error } = await supabase.from('problems').update(problemData).eq('id', id).select(columns);
    if (error) throw error;
    return data[0];
  },
  deleteProblem: async (id) => {
    const { data, error } = await supabase.from('problems').delete().eq('id', id).select();
    if (error) throw error;
    return data[0];
  },
  subscribeToProblems: (callback) => {
    return supabase
      .channel('public:problems')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'problems' }, callback)
      .subscribe();
  }
};

export default problemService;
