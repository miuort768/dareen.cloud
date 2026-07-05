const CACHE_KEYS = {
  teachers: {
    list: () => 'teachers:list',
    byId: (id) => `teachers:id:${id}`,
  },
  parents: {
    list: () => 'parents:list',
    byId: (id) => `parents:id:${id}`,
  },
  students: {
    list: () => 'students:list',
    byId: (id) => `students:id:${id}`,
  },
  enrollments: {
    list: () => 'enrollments:list',
    byId: (id) => `enrollments:id:${id}`,
    byStudent: (studentId) => `enrollments:student:${studentId}`,
    byTeacher: (teacherId) => `enrollments:teacher:${teacherId}`,
  },
  invoices: {
    teacherList: () => 'invoices:teacher:list',
    teacherById: (id) => `invoices:teacher:id:${id}`,
    studentList: () => 'invoices:student:list',
    studentById: (id) => `invoices:student:id:${id}`,
    stats: () => 'invoices:stats',
  },
};

module.exports = { CACHE_KEYS };
