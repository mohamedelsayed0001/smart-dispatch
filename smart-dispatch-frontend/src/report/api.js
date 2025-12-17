export const submitReport = async (reportData) => {
  const authToken = localStorage.getItem('authToken');

  const response = await fetch('http://localhost:8080/api/report', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(reportData)
  });

  if (!response.ok) {
    throw new Error('Failed to submit report. Please try again.');
  }

  return response;
};
