import { createConsentGate, type ProposedAction } from '../agent-consent';
import { mountFlow } from '../access-agent-sketch.js';

interface RecognitionResultEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

interface VoiceRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  abort(): void;
}

type VoiceWindow = Window & {
  SpeechRecognition?: new () => VoiceRecognition;
  webkitSpeechRecognition?: new () => VoiceRecognition;
};

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Missing demo control: ${id}`);
  return found as T;
}

const request = element<HTMLTextAreaElement>('request-text');
const recipient = element<HTMLInputElement>('recipient');
const draft = element<HTMLTextAreaElement>('draft-text');
const consent = element<HTMLInputElement>('consent-check');
const speakButton = element<HTMLButtonElement>('speak-button');
const stopSpeechButton = element<HTMLButtonElement>('stop-speech-button');
const voiceButton = element<HTMLButtonElement>('voice-button');
const status = element('demo-status');
const history = element<HTMLOListElement>('action-log');
const initialRequest = request.value;
const initialRecipient = recipient.value;
const gate = createConsentGate();
const Voice = (window as VoiceWindow).SpeechRecognition || (window as VoiceWindow).webkitSpeechRecognition;
const speechAvailable = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
let revision = 0;
let sentRevision = -1;
let prepared = false;
let state = 'input';
let redraw = () => {};
let recognition: VoiceRecognition | null = null;
let utterance: SpeechSynthesisUtterance | null = null;
let logCount = 0;

function currentAction(): ProposedAction {
  return { tool: 'message.send', recipient: recipient.value, body: prepared ? draft.value : '', revision };
}

function addLog(message: string): void {
  const item = document.createElement('li');
  item.value = ++logCount;
  item.textContent = message;
  history.prepend(item);
  if (history.children.length > 20) history.lastElementChild?.remove();
  element('log-count').textContent = `(${logCount}; latest ${history.children.length} shown)`;
}

function announce(message: string, nextState = state): void {
  state = nextState;
  status.dataset.state = state;
  status.textContent = message;
  const descriptions: Record<string, string> = {
    input: 'Current stage: expression. No action has been authorized.',
    review: `Current stage: review, revision ${revision}. The proposed action is waiting for approval.`,
    approved: `Current stage: review, revision ${revision}. One exact action is approved but has not run.`,
    blocked: 'Current stage: action blocked. Nothing was sent; inspect the status for the reason.',
    done: `Current stage: simulated action complete, revision ${revision}. Permission was consumed. No email was sent.`,
  };
  element('flow-text').textContent = descriptions[state];
  redraw();
}

function updateControls(): void {
  const action = currentAction();
  const reviewable = prepared && !!action.body.trim() && !!action.recipient.trim();
  consent.disabled = !reviewable || sentRevision === revision;
  speakButton.disabled = !reviewable || !speechAvailable;
  element('revision-note').textContent = prepared
    ? `Revision ${revision}. Editing the request, recipient, or draft clears approval. Permission is for one use.`
    : 'Prepare a draft to enable approval. Editing the request, recipient, or draft clears approval.';
}

function stopReading(): void {
  if (utterance) {
    utterance.onend = null;
    utterance.onerror = null;
    utterance = null;
  }
  if (speechAvailable) window.speechSynthesis.cancel();
  stopSpeechButton.disabled = true;
}

function stopVoice(): void {
  const active = recognition;
  recognition = null;
  if (active) {
    active.onresult = null;
    active.onerror = null;
    active.onend = null;
    active.abort();
  }
  voiceButton.textContent = 'Use voice input';
  voiceButton.setAttribute('aria-pressed', 'false');
}

function invalidate(message: string, clearDraft: boolean): void {
  gate.revoke();
  consent.checked = false;
  revision += 1;
  stopReading();
  if (clearDraft) {
    prepared = false;
    draft.disabled = true;
  }
  updateControls();
  announce(message, prepared ? 'review' : 'input');
}

element('prepare-button').addEventListener('click', () => {
  stopVoice();
  if (!request.value.trim()) {
    invalidate('Enter a request before preparing a draft.', true);
    request.focus();
    return;
  }
  invalidate('Preparing a new sample draft.', true);
  draft.value = [
    'Hello workshop team,', '',
    'I would like to propose Access Is the Interface, a keynote on the convergence of creative coding, accessibility, and AI governance.', '',
    'The talk explores how voice input, speech output, and tool use can enable creative work, and how people retain authority over actions carried out on their behalf.', '',
    'Working brief, as entered:', request.value.trim(), '',
    'This is a sample draft for review.',
  ].join('\n');
  prepared = true;
  draft.disabled = false;
  element('interpretation').textContent = 'Proposed tool: message.send. The script prepares your brief in a fixed template. Interpretation supplies no authority to send.';
  updateControls();
  addLog(`Prepared revision ${revision}. Stopped for accessible review.`);
  announce('Draft ready. Review or edit the recipient and message. Try a simulated send without approval to see the boundary.', 'review');
  draft.focus();
  draft.setSelectionRange(0, 0);
  draft.scrollTop = 0;
});

request.addEventListener('input', () => {
  stopVoice();
  invalidate('Request changed. The previous draft and approval are no longer current. Prepare a new draft.', true);
  element('interpretation').textContent = 'Request changed. Prepare a new sample draft for review.';
});

for (const field of [recipient, draft]) {
  field.addEventListener('input', () => {
    stopVoice();
    invalidate('Content changed. Approval cleared. Review the current recipient and draft before approving.', false);
  });
}

consent.addEventListener('change', () => {
  stopVoice();
  if (!consent.checked) {
    gate.revoke();
    addLog(`Approval revoked for revision ${revision}.`);
    announce('Approval revoked. The system cannot act on this draft.', 'review');
    return;
  }
  if (!prepared || !gate.approve(currentAction())) {
    consent.checked = false;
    announce('Blocked. Prepare a current draft and recipient before approving.', 'blocked');
    return;
  }
  addLog(`Approved revision ${revision} for one simulated send to ${recipient.value}.`);
  announce(`Revision ${revision} approved for one simulated send to ${recipient.value}. Nothing has been sent.`, 'approved');
});

element('act-button').addEventListener('click', () => {
  stopVoice();
  stopReading();
  const result = gate.execute(currentAction());
  if (!result.ok) {
    consent.checked = false;
    gate.revoke();
    addLog(`Blocked revision ${revision}: ${result.reason}`);
    announce(`Blocked. ${result.reason} Nothing was sent.`, 'blocked');
    return;
  }
  sentRevision = revision;
  consent.checked = false;
  updateControls();
  addLog(`Simulated receipt: message.send to ${recipient.value}, revision ${revision}. One-use permission consumed. No email was sent.`);
  announce('Simulated send complete. Permission was consumed. No email was sent. A second attempt will be blocked.', 'done');
});

speakButton.addEventListener('click', () => {
  if (!speechAvailable || !prepared) return;
  stopVoice();
  stopReading();
  utterance = new SpeechSynthesisUtterance(`Simulated recipient: ${recipient.value}. Draft revision ${revision}. ${draft.value}`);
  utterance.lang = 'en-US';
  utterance.rate = 0.95;
  utterance.onend = () => {
    utterance = null;
    stopSpeechButton.disabled = true;
    announce('Finished reading. Hearing a preview does not approve it.');
  };
  utterance.onerror = () => {
    utterance = null;
    stopSpeechButton.disabled = true;
    announce('Read-aloud is unavailable. The editable text remains available.');
  };
  stopSpeechButton.disabled = false;
  window.speechSynthesis.speak(utterance);
  announce('Reading the recipient and current draft. Use Stop reading to stop.');
});

stopSpeechButton.addEventListener('click', () => {
  stopReading();
  announce('Reading stopped. The draft remains available for review.');
});

voiceButton.addEventListener('click', () => {
  if (recognition) {
    stopVoice();
    announce('Voice input stopped. No action was approved.');
    return;
  }
  if (!Voice) return;
  invalidate('Starting voice input. New dictation requires a new draft and approval.', true);
  const session = new Voice();
  recognition = session;
  session.lang = 'en-US';
  session.interimResults = false;
  session.continuous = false;
  session.onresult = (event) => {
    if (recognition !== session) return;
    request.value = event.results[0][0].transcript;
    stopVoice();
    invalidate('Voice captured as text. Review the request, then prepare a new draft. Voice input never grants approval.', true);
    request.focus();
  };
  session.onerror = () => {
    if (recognition !== session) return;
    stopVoice();
    announce('Voice input could not continue. Type or use device dictation in the request field.');
  };
  session.onend = () => {
    if (recognition !== session) return;
    stopVoice();
    announce('Voice input ended without a transcript. The request field remains available.');
  };
  voiceButton.textContent = 'Stop voice input';
  voiceButton.setAttribute('aria-pressed', 'true');
  try {
    session.start();
    announce('Listening. Speak a request, or select Stop voice input.');
  } catch {
    stopVoice();
    announce('Voice input is unavailable. Continue in the request field.');
  }
});

element('reset-button').addEventListener('click', () => {
  stopVoice();
  invalidate('Reset. Prepare a draft, or try a simulated send to test the boundary.', true);
  request.value = initialRequest;
  recipient.value = initialRecipient;
  draft.value = '';
  history.replaceChildren();
  logCount = 0;
  element('log-count').textContent = '(0)';
  element('interpretation').textContent = 'The script prepares a fixed example for review. No language model is connected.';
  updateControls();
  request.focus();
});

window.addEventListener('pagehide', () => {
  stopVoice();
  stopReading();
  gate.revoke();
  consent.checked = false;
});

if (!Voice) {
  voiceButton.disabled = true;
  element('voice-note').textContent = 'Browser voice input is unavailable here. Type your request or use your device keyboard dictation. Dictation never approves an action.';
}
if (!speechAvailable) {
  element('speech-note').textContent = 'Browser read-aloud is unavailable here. The editable preview also works with your screen reader.';
}
element('demo-loading').hidden = true;
element('demo-controls').hidden = false;
updateControls();

mountFlow(() => ({ state, prepared })).then((draw: () => void) => {
  redraw = draw;
  element('canvas-note').hidden = true;
  redraw();
}).catch(() => {
  element('canvas-note').textContent = 'The p5 diagram could not load. All controls, status descriptions, and keynote content remain available.';
});
