export const formatDepartureTime = (s: string) => {
    const d = new Date(s);
    return {
      date: d.toLocaleDateString([], { month: "short", day: "numeric" }),
      time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };