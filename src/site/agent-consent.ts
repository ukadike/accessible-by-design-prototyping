export interface ProposedAction {
  tool: 'message.send';
  recipient: string;
  body: string;
  revision: number;
}

type Decision = { ok: true } | { ok: false; reason: string };

function sameAction(left: ProposedAction, right: ProposedAction): boolean {
  return left.tool === right.tool && left.recipient === right.recipient &&
    left.body === right.body && left.revision === right.revision;
}

function validAction(action: ProposedAction): boolean {
  return action.tool === 'message.send' && !!action.recipient.trim() &&
    !!action.body.trim() && Number.isSafeInteger(action.revision) && action.revision > 0;
}

// This local teaching gate models a check that belongs at the real tool service.
export function createConsentGate() {
  let approved: ProposedAction | null = null;
  const consumed = new Set<number>();

  return {
    approve(action: ProposedAction): boolean {
      approved = null;
      if (!validAction(action) || consumed.has(action.revision)) return false;
      approved = { ...action };
      return true;
    },
    revoke(): void {
      approved = null;
    },
    execute(action: ProposedAction): Decision {
      if (!validAction(action)) {
        return { ok: false, reason: 'Prepare a nonempty draft and recipient before acting.' };
      }
      if (consumed.has(action.revision)) {
        return { ok: false, reason: 'This revision was already used. Prepare a new draft for another action.' };
      }
      if (!approved || !sameAction(approved, action)) {
        approved = null;
        return { ok: false, reason: 'Approve the exact current draft and recipient before acting.' };
      }
      consumed.add(action.revision);
      approved = null;
      return { ok: true };
    },
  };
}
