import type { TelemetryEvent } from './types';

function toLogLine(event: TelemetryEvent) {
  return JSON.stringify({
    type: 'chat_api_telemetry',
    timestamp: new Date().toISOString(),
    ...event,
  });
}

export function emitChatTelemetry(event: TelemetryEvent) {
  if (process.env.NODE_ENV === 'test') return;
  console.info(toLogLine(event));
}
