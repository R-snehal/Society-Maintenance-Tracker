// Overdue is computed on read, not stored. A complaint is overdue if it is
// not yet Resolved and it has been open longer than OVERDUE_THRESHOLD_DAYS.
export function getOverdueThresholdDays() {
  return Number(process.env.OVERDUE_THRESHOLD_DAYS || 5);
}

export function isOverdue(complaint) {
  if (complaint.status === "Resolved") return false;
  const thresholdMs = getOverdueThresholdDays() * 24 * 60 * 60 * 1000;
  const ageMs = Date.now() - new Date(complaint.created_at).getTime();
  return ageMs > thresholdMs;
}

export function withOverdueFlag(complaint) {
  return { ...complaint, is_overdue: isOverdue(complaint) };
}
