/**
 * Formats a date string or Date object to mm/dd/yyyy format
 * @param date - Date string or Date object
 * @returns Formatted date string in mm/dd/yyyy format
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', { 
    month: '2-digit', 
    day: '2-digit', 
    year: 'numeric' 
  })
}

/**
 * Formats a date string for HTML date input (yyyy-MM-dd format)
 * @param dateString - Date string or null/undefined
 * @returns Formatted date string in yyyy-MM-dd format for HTML date inputs
 */
export function formatDateForInput(dateString: string | null | undefined): string {
  if (!dateString) return ''
  try {
    // Convert ISO date string to yyyy-MM-dd format for HTML date input
    return new Date(dateString).toISOString().split('T')[0] || ''
  } catch {
    return ''
  }
}
