const cache = require('./cacheService');
const { prisma } = require('../utils/prisma');
const { CACHE_KEYS } = require('../constants/cacheKeys');
const { canonicalPhone } = require('./parentService');

// TTLs sit ABOVE the frontend poll cadence (notifications: 3s, dashboards: 5s)
// so every tab/background refetch dedupes to one DB hit per TTL window per user
// instead of one DB hit per poll per tab. Writes invalidate their keys
// immediately (near-real-time), so staleness is bounded to one TTL only for
// cross-feature writes that have no invalidation hook (e.g. broadcast).
const NOTIFICATIONS_TTL = 6;
const PORTAL_TTL = 10;
const PARENT_CHILDREN_TTL = 10;

// Invalidate a student's dashboard snapshot AND the cached my-children list of
// their parent (same change must refresh both surfaces). Best-effort: the parent
// lookup failure is swallowed — the TTL still bounds staleness.
async function invalidateStudent(studentId) {
  if (!studentId) return;
  await cache.del(CACHE_KEYS.studentPortal.me(studentId));
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { parentPhone: true },
    });
    if (student && student.parentPhone) {
      await cache.del(CACHE_KEYS.parentChildren.byPhone(canonicalPhone(student.parentPhone)));
    }
  } catch (err) {
    // best-effort parent refresh
  }
}

module.exports = {
  NOTIFICATIONS_TTL,
  PORTAL_TTL,
  PARENT_CHILDREN_TTL,
  invalidateStudent,
};