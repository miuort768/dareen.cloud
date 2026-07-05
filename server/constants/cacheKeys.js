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
};

module.exports = { CACHE_KEYS };
