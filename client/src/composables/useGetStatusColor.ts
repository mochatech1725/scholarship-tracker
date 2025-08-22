const StatusColors: Record<string, string> = {
  'Not Started': 'grey',
  'In Progress': 'blue',
  'Pending': 'warning',
  'Submitted': 'orange',
  'Awarded': 'green',
  'Not Awarded': 'red'
}

export function useGetStatusColor() {
  const getStatusColor = (status: string) => {
    return StatusColors[status] || 'grey'
  }

  return {
    getStatusColor
  }
} 