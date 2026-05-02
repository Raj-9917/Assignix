import { supabase } from '../config/supabaseClient';

export const submissionService = {
  submitCode: async (submissionData) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('submit_problem_solution', {
      p_problem_id: submissionData.problemId,
      p_code: submissionData.code,
      p_language: submissionData.language,
      p_classroom_id: submissionData.classroomId,
      p_assignment_id: submissionData.assignmentId
    });

    if (error) throw error;
    return data;
  },
  getUserSubmissions: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('submissions')
      .select('*, problems(*)')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  getStats: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { total: 0, accepted: 0 };

    const { data, error } = await supabase
      .from('submissions')
      .select('status')
      .eq('user_id', user.id);
    if (error) throw error;

    const accepted = data.filter(s => s.status === 'Accepted').length;
    return {
      total: data.length,
      accepted,
      accuracyRate: data.length > 0 ? Math.round((accepted / data.length) * 100) : 0
    };
  },
  getActivityHistory: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('submissions')
      .select('submitted_at, status')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: true });

    if (error) throw error;

    // Group by date
    const history = data.reduce((acc, curr) => {
      const date = new Date(curr.submitted_at).toLocaleDateString('en-CA'); // YYYY-MM-DD
      if (!acc[date]) acc[date] = 0;
      if (curr.status === 'Accepted') acc[date]++;
      return acc;
    }, {});

    return Object.entries(history).map(([date, solves]) => ({ date, solves }));
  },
  getSubmissionById: async (id) => {
    const { data, error } = await supabase
      .from('submissions')
      .select('*, problems(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }
};

export default submissionService;
