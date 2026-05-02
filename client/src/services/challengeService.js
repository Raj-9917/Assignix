import { supabase } from '../config/supabaseClient';

export const challengeService = {
  // Public
  async getChallenges() {
    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        created_by:users!challenges_created_by_fkey (id, name, role),
        participants:challenge_participants!challenge_participants_challenge_id_fkey(count)
      `)
      .eq('is_private', false)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    
    // Flatten count from the participants array join
    return data.map(c => ({
      ...c,
      participant_count: c.participants?.[0]?.count || 0
    }));
  },

  async getChallengeById(id) {
    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        created_by:users!challenges_created_by_fkey (id, name, role),
        participants:challenge_participants!challenge_participants_challenge_id_fkey(user_id, joined_at)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);

    // Manually fetch problem details using the problem_ids array
    if (data.problem_ids && Array.isArray(data.problem_ids) && data.problem_ids.length > 0) {
      const { data: problemsData, error: problemsError } = await supabase
        .from('problems')
        .select('*')
        .in('id', data.problem_ids);
      
      if (!problemsError) {
        data.problems_details = problemsData;
      }
    }

    return data;
  },

  async getLeaderboard(id) {
    const { data, error } = await supabase
      .from('challenge_participants')
      .select('*, user:users(*)')
      .eq('challenge_id', id)
      .order('score', { ascending: false });
    
    if (error) throw new Error(error.message);
    
    // Fetch total problems for this challenge to calculate progress
    const { data: challengeData } = await supabase
      .from('challenges')
      .select('problem_ids')
      .eq('id', id)
      .single();

    return {
      leaderboard: data.map((entry, index) => ({
        ...entry,
        rank: index + 1
      })),
      totalProblems: challengeData?.problem_ids?.length || 0
    };
  },

  // Authenticated
  async joinChallenge(id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('challenge_participants')
      .insert([{ challenge_id: id, user_id: user.id }])
      .select()
      .single();
    if (error && error.code !== '23505') throw new Error(error.message); // Ignore unique violation if already joined
    return { message: 'Joined successfully' };
  },


  async createPrivateRoom(roomData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Generate a random 6-character room code via RPC
    const { data: room_code, error: rpcError } = await supabase.rpc('generate_unique_challenge_code');
    if (rpcError) throw rpcError;

    const sanitizedRoomData = {
      ...roomData,
      room_code
    };

    const { data, error } = await supabase
      .from('challenges')
      .insert([{
        ...sanitizedRoomData,
        is_private: true,
        created_by: user.id,
        status: 'active'
      }])
      .select('id, title, is_private, room_code, created_at')
      .single();
      
    if (error) throw new Error(error.message);
    return data;
  },

  async getChallengeByCode(code) {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('room_code', code)
      .single();
      
    if (error) throw new Error('Invalid room code');
    return data;
  },

  // Admin only
  async createChallenge(challengeData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const sanitizedChallengeData = challengeData;
    
    // Handle room code generation for private challenges via RPC
    let room_code = null;
    if (sanitizedChallengeData.is_private) {
      const { data: generatedCode, error: rpcError } = await supabase.rpc('generate_unique_challenge_code');
      if (rpcError) throw rpcError;
      room_code = generatedCode;
    }
    
    const { data, error } = await supabase
      .from('challenges')
      .insert([{ 
        ...sanitizedChallengeData, 
        created_by: user.id,
        room_code
      }])
      .select('id, title, is_private, room_code, difficulty, description, created_at')
      .single();
      
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteChallenge(id) {
    const { data, error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', id)
      .select();
      
    if (error) throw new Error(error.message);
    return data[0];
  }
};

export default challengeService;
