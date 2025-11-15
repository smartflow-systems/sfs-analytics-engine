/**
 * Export utility functions for analytics data
 */

export interface ExportEvent {
  id: string;
  event: string;
  userId?: string;
  timestamp: string;
  properties?: Record<string, any>;
  sessionId?: string;
}

/**
 * Convert events array to CSV format
 */
export function exportToCSV(events: ExportEvent[]): string {
  if (events.length === 0) return '';

  // Get all unique property keys
  const allPropertyKeys = new Set<string>();
  events.forEach(event => {
    if (event.properties) {
      Object.keys(event.properties).forEach(key => allPropertyKeys.add(key));
    }
  });

  // Create CSV header
  const baseHeaders = ['ID', 'Event', 'User ID', 'Timestamp', 'Session ID'];
  const propertyHeaders = Array.from(allPropertyKeys).map(key => `property.${key}`);
  const headers = [...baseHeaders, ...propertyHeaders];

  // Create CSV rows
  const rows = events.map(event => {
    const baseRow = [
      event.id,
      event.event,
      event.userId || '',
      event.timestamp,
      event.sessionId || '',
    ];

    const propertyRow = Array.from(allPropertyKeys).map(key => {
      const value = event.properties?.[key];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    });

    return [...baseRow, ...propertyRow];
  });

  // Combine header and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Convert events array to JSON format
 */
export function exportToJSON(events: ExportEvent[]): string {
  return JSON.stringify(events, null, 2);
}

/**
 * Download data as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export events to CSV file
 */
export function exportEventsAsCSV(events: ExportEvent[], filename: string = 'events.csv') {
  const csv = exportToCSV(events);
  downloadFile(csv, filename, 'text/csv');
}

/**
 * Export events to JSON file
 */
export function exportEventsAsJSON(events: ExportEvent[], filename: string = 'events.json') {
  const json = exportToJSON(events);
  downloadFile(json, filename, 'application/json');
}

/**
 * Format timestamp for filename
 */
export function getTimestampedFilename(prefix: string, extension: string): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${prefix}-${timestamp}.${extension}`;
}
