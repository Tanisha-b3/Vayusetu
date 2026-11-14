const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchReports() {
  const res = await fetch(`${API_BASE}/reports`);
  return res.json();
}

export async function fetchReport(id) {
  const res = await fetch(`${API_BASE}/reports/${id}`);
  if (!res.ok) throw new Error('Report not found');
  return res.json();
}

export async function uploadReportFile(file, { city, reportDate, name } = {}) {
  const data = new FormData();
  data.append('file', file);
  if (city) data.append('city', city);
  if (reportDate) data.append('reportDate', reportDate);
  if (name) data.append('name', name);

  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    body: data,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to upload report');
  }
  return res.json();
}

export async function uploadReportText({ text, name, city, reportDate }) {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, name, city, reportDate }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit report text');
  }
  return res.json();
}

export async function fetchSamples() {
  const res = await fetch(`${API_BASE}/samples`);
  return res.json();
}

export async function triggerAnalyze(id) {
  const res = await fetch(`${API_BASE}/reports/${id}/analyze`, { method: 'POST' });
  if (!res.ok) throw new Error('Analysis failed');
  return res.json();
}

export async function fetchReading(id, rid) {
  const res = await fetch(`${API_BASE}/reports/${id}/readings/${rid}`);
  if (!res.ok) throw new Error('Reading not found');
  return res.json();
}

export async function fetchBatchReadings(id, ids) {
  const res = await fetch(`${API_BASE}/reports/${id}/readings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  return res.json();
}

export async function fetchRecommendations(id, role) {
  const res = await fetch(`${API_BASE}/reports/${id}/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error('Failed to generate recommendations');
  return res.json();
}

export async function updateActionStatus(id, role, actionId, { status, assignee }) {
  const res = await fetch(`${API_BASE}/reports/${id}/actions/${role}/${actionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, assignee }),
  });
  if (!res.ok) throw new Error('Failed to update action');
  return res.json();
}

export async function triggerCompare(id, previousId) {
  const res = await fetch(`${API_BASE}/reports/${id}/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ previousId }),
  });
  if (!res.ok) throw new Error('Comparison failed');
  return res.json();
}

export async function generateDoc(id, kind, { language, level, role }) {
  const res = await fetch(`${API_BASE}/reports/${id}/${kind}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language, level, role }),
  });
  if (!res.ok) throw new Error(`Failed to generate ${kind}`);
  return res.json();
}

export async function askQuestion(id, question, role) {
  const res = await fetch(`${API_BASE}/reports/${id}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, role }),
  });
  if (!res.ok) throw new Error('Q&A query failed');
  return res.json();
}
