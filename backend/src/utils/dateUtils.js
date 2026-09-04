/**
 * Date and Week Utilities for Weekly Report System
 */

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return { weekNumber: weekNo, year: date.getUTCFullYear() };
}

function getDateRangeForWeek(weekNumber, year) {
  // ISO-8601 week: Jan 4 is always in week 1
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const mondayWeek1 = new Date(jan4.getTime() - (jan4Day - 1) * 86400000);
  
  const monday = new Date(mondayWeek1.getTime() + (weekNumber - 1) * 7 * 86400000);
  monday.setUTCHours(0, 0, 0, 0);

  const sunday = new Date(monday.getTime() + 6 * 86400000);
  sunday.setUTCHours(23, 59, 59, 999);

  // Deadline: Friday 18:00 of that week
  const deadline = new Date(monday.getTime() + 4 * 86400000);
  deadline.setUTCHours(18, 0, 0, 0);

  return {
    startDate: monday,
    endDate: sunday,
    dueDate: deadline
  };
}

module.exports = {
  getWeekNumber,
  getDateRangeForWeek
};
