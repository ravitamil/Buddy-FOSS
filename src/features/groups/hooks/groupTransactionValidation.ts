export function validateSettlementRecipients(receivedBy: string[]): string | null {
  if (receivedBy.length === 0) return 'Select at least one recipient';
  if (receivedBy.length > 1) return 'Select only one recipient for pairwise settlement';
  return null;
}
