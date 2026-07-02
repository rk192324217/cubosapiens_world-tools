export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours()

  if (hour >= 5 && hour < 12) return "Good Morning"
  if (hour >= 12 && hour < 17) return "Good Afternoon"
  if (hour >= 17 && hour < 21) return "Good Evening"
  return "Welcome Back" // night hours, 9pm–5am
}
