// src/screens/EditRide/utils/formatting.ts

/**
 * Format timestamp to human-readable relative time
 */
export function formatTimestamp(isoString: string): string {
  if (!isoString) {
    return 'Unknown';
  }

  try {
    const utcString = isoString.endsWith('Z') ? isoString : `${isoString}Z`;
    const utcDate = new Date(utcString);

    if (isNaN(utcDate.getTime())) {
      return 'Unknown';
    }

    const now = new Date();
    const diffMs = now.getTime() - utcDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
      return 'In the future';
    }

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return utcDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  } catch (error) {
    return 'Unknown';
  }
}

/**
 * Get the relevant timestamp based on request status
 */
export function getRelevantTimestamp(request: any): string {
  if (request.status === 'pending') {
    return request.requested_at || request.created_at;
  } else {
    return request.updated_at || request.requested_at || request.created_at;
  }
}

/**
 * Get timestamp label based on status
 */
export function getTimestampLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'Requested';
    case 'accepted':
      return 'Accepted';
    case 'declined':
      return 'Declined';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Requested';
  }
}