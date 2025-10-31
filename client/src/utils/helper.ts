/**
 * Formats a date string or Date object to mm/dd/yyyy format
 * @param date - Date string or Date object
 * @returns Formatted date string in mm/dd/yyyy format, or empty string if invalid
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return ''

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) return ''

    return dateObj.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    })
  } catch {
    return ''
  }
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
