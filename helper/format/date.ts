import { format, isToday, isYesterday } from "date-fns";

const groupLogsByDay = (logs: any[]) => {
  const groups: { [key: string]: any[] } = {};

  logs.forEach((log) => {
    const date = new Date(log.timestamp);
    let day = format(date, "MMMM d, yyyy"); // Default: "April 17, 2026"

    if (isToday(date)) day = "Today";
    else if (isYesterday(date)) day = "Yesterday";

    if (!groups[day]) groups[day] = [];
    groups[day].push(log);
  });

  // Convert to array format for SectionList
  return Object.keys(groups).map((day) => ({
    title: day,
    data: groups[day],
  }));
};

export { groupLogsByDay };
