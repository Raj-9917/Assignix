import { supabase } from '../config/supabaseClient';

export const classroomService = {
  createClassroom: async (classroomData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Generate a unique 6-character alphanumeric code via RPC
    const { data: code, error: rpcError } = await supabase.rpc('generate_unique_classroom_code');
    if (rpcError) throw rpcError;

    const { data, error } = await supabase
      .from('classrooms')
      .insert([{ ...classroomData, code, teacher_id: user.id }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  
  joinClassroom: async (code) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Find classroom by code
    const { data: classroom, error: findError } = await supabase
      .from('classrooms')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();
    
    if (findError) throw new Error('Invalid classroom code');

    // Join classroom
    const { error: joinError } = await supabase
      .from('classroom_students')
      .insert([{ classroom_id: classroom.id, student_id: user.id }]);
      
    if (joinError) {
      if (joinError.code === '23505') throw new Error('You are already a member of this classroom');
      throw joinError;
    }
    return { success: true, classroom };
  },

  getMyClassrooms: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Classrooms where user is teacher
    const { data: taughtClassrooms, error: err1 } = await supabase
      .from('classrooms')
      .select('*, assignments(*), teacher:users!classrooms_teacher_id_fkey(id, name, username, avatar)')
      .eq('teacher_id', user.id);

    // Classrooms where user is student
    const { data: studentClassroomsData, error: err2 } = await supabase
      .from('classroom_students')
      .select('classrooms(*, assignments(*), teacher:users!classrooms_teacher_id_fkey(id, name, username, avatar))')
      .eq('student_id', user.id);

    if (err1 || err2) {
      console.error('Fetch error:', err1 || err2);
      throw new Error('Failed to fetch classrooms');
    }

    const studentClassrooms = studentClassroomsData.map(d => d.classrooms);
    return [...taughtClassrooms, ...studentClassrooms];
  },

  getClassroomDetail: async (id) => {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*, assignments(*), teacher:users!classrooms_teacher_id_fkey(id, name, username, avatar)')
      .eq('id', id)
      .single();
    
    if (error) throw error;

    // Hydrate assignments with problem details
    if (data.assignments && data.assignments.length > 0) {
      const allProblemIds = [...new Set(data.assignments.flatMap(a => a.problem_ids || []))];
      if (allProblemIds.length > 0) {
        const { data: problems, error: pError } = await supabase
          .from('problems')
          .select('id, title, difficulty, category')
          .in('id', allProblemIds);
        
        if (!pError && problems) {
          const problemMap = Object.fromEntries(problems.map(p => [p.id, p]));
          data.assignments = data.assignments.map(a => ({
            ...a,
            problem_ids: (a.problem_ids || []).map(pid => problemMap[pid] || { id: pid, title: 'Unknown Problem' })
          }));
        }
      }
    }

    return data;
  },

  assignProblem: async (classroomId, assignmentData) => {
    const { data, error } = await supabase
      .from('assignments')
      .insert([{ ...assignmentData, classroom_id: classroomId }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteClassroom: async (id) => {
    const { data, error } = await supabase.from('classrooms').delete().eq('id', id).select();
    if (error) throw error;
    return data[0];
  },

  getClassroomReports: async (id) => {
    // Requires joining with submissions, users, and problems
    const { data, error } = await supabase
      .from('submissions')
      .select('*, user_id(*), problem_id(*)')
      .eq('classroom_id', id);
    if (error) throw error;
    return data;
  },

  updateClassroom: async (id, classroomData) => {
    const { data, error } = await supabase.from('classrooms').update(classroomData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  leaveClassroom: async (id) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('classroom_students').delete()
      .match({ classroom_id: id, student_id: user.id });
    if (error) throw error;
    return { success: true };
  },

  updateAssignment: async (classroomId, assignmentId, assignmentData) => {
    const { data, error } = await supabase.from('assignments').update(assignmentData).eq('id', assignmentId).select().single();
    if (error) throw error;
    return data;
  },

  deleteAssignment: async (classroomId, assignmentId) => {
    const { data, error } = await supabase.from('assignments').delete().eq('id', assignmentId).select();
    if (error) throw error;
    return data[0];
  },

  removeStudent: async (classroomId, studentId) => {
    const { error } = await supabase
      .from('classroom_students')
      .delete()
      .match({ classroom_id: classroomId, student_id: studentId });
    if (error) throw error;
    return { success: true };
  }
};

export default classroomService;
