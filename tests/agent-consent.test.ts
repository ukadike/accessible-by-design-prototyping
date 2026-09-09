import { describe, expect, it } from 'vitest';
import { createConsentGate, type ProposedAction } from '../src/site/agent-consent';

const proposal = (): ProposedAction => ({
  tool: 'message.send', recipient: 'Workshop team', body: 'Please review this draft.', revision: 1,
});

describe('simulated action permission boundary', () => {
  it('blocks an action without approval, including apparently harmless text', () => {
    const gate = createConsentGate();
    expect(gate.execute(proposal()).ok).toBe(false);
    expect(gate.execute({ ...proposal(), body: 'Say hello' }).ok).toBe(false);
  });

  it('allows exactly one execution and prevents replay or reapproval', () => {
    const gate = createConsentGate();
    const action = proposal();
    expect(gate.approve(action)).toBe(true);
    expect(gate.execute(action).ok).toBe(true);
    expect(gate.execute(action).ok).toBe(false);
    expect(gate.approve(action)).toBe(false);
    expect(gate.approve({ ...action, revision: 2 })).toBe(true);
    expect(gate.execute({ ...action, revision: 2 }).ok).toBe(true);
  });

  it.each([
    { body: 'A different message' },
    { recipient: 'Someone else' },
    { revision: 2 },
  ])('rejects changed action details and clears stale approval: %j', (change) => {
    const gate = createConsentGate();
    const action = proposal();
    gate.approve(action);
    expect(gate.execute({ ...action, ...change }).ok).toBe(false);
    expect(gate.execute(action).ok).toBe(false);
  });

  it('copies the approved action so mutation cannot change permission', () => {
    const gate = createConsentGate();
    const action = proposal();
    gate.approve(action);
    action.recipient = 'Unexpected recipient';
    expect(gate.execute(action).ok).toBe(false);
  });

  it('honors explicit revocation', () => {
    const gate = createConsentGate();
    gate.approve(proposal());
    gate.revoke();
    expect(gate.execute(proposal()).ok).toBe(false);
  });

  it.each([
    { body: ' ' }, { recipient: '' }, { revision: 0 }, { revision: NaN },
    { tool: 'file.delete' as ProposedAction['tool'] },
  ])('refuses incomplete or unsupported actions: %j', (change) => {
    const gate = createConsentGate();
    const action = { ...proposal(), ...change };
    expect(gate.approve(action)).toBe(false);
    expect(gate.execute(action).ok).toBe(false);
  });
});
