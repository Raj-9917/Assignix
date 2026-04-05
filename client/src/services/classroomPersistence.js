/**
 * Classroom Persistence Service
 * Manages the creation, joining, and storage of classrooms in localStorage.
 */

const STORAGE_KEY = 'assignix_classrooms';

const generateClassCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const classroomService = {
  // Get all classrooms from storage
  getAllClassrooms: () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Create a new classroom (Teacher)
  createClassroom: (name, teacherName, teacherId) => {
    const classrooms = classroomService.getAllClassrooms();
    const newRoom = {
      id: 'room_' + Date.now(),
      code: generateClassCode(),
      name,
      teacher: teacherName,
      teacherId,
      studentCount: 0,
      problemIds: [],
      createdAt: new Date().toISOString()
    };
    
    const updated = [newRoom, ...classrooms];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newRoom;
  },

  // Join a classroom (Student)
  joinClassroom: (code, studentId) => {
    const classrooms = classroomService.getAllClassrooms();
    const roomIndex = classrooms.findIndex(r => r.code === code);
    
    if (roomIndex === -1) {
      throw new Error('Invalid classroom code.');
    }

    // In a real app, we'd add the student to a 'members' array in the room
    // For now, we'll increment the student count as a simulation
    classrooms[roomIndex].studentCount += 1;
    
    // Save updated room info back to storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(classrooms));
    
    // Also track which rooms this student has joined
    const studentRoomsKey = `student_rooms_${studentId}`;
    const enrolled = JSON.parse(localStorage.getItem(studentRoomsKey) || '[]');
    if (!enrolled.includes(classrooms[roomIndex].id)) {
      localStorage.setItem(studentRoomsKey, JSON.stringify([...enrolled, classrooms[roomIndex].id]));
    }

    return classrooms[roomIndex];
  },

  // Get rooms for a specific teacher
  getTeacherRooms: (teacherId) => {
    return classroomService.getAllClassrooms().filter(r => r.teacherId === teacherId);
  },

  // Get rooms for a specific student
  getStudentRooms: (studentId) => {
    const studentRoomsKey = `student_rooms_${studentId}`;
    const enrolledIds = JSON.parse(localStorage.getItem(studentRoomsKey) || '[]');
    return classroomService.getAllClassrooms().filter(r => enrolledIds.includes(r.id));
  }
};

export default classroomService;
