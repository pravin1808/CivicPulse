export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export const endpoints = {
  adminIssues: '/api/admin/issues/all',
  adminWorkers: '/api/admin/workers',
  assignIssue: (issueId: string) => `/api/admin/issue/assign/${issueId}`,
  citizenIssues: '/api/citizen/issue/all',
  workerIssues: '/api/worker/issues/assigned',
}
