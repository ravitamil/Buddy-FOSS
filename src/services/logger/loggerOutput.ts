import {documentDirectory, EncodingType, fileSystem} from '../filesystem/fileSystemAdapter';
import {originalConsole} from './loggerConsole';
import {LogLevel, type LogEntry} from './loggerTypes';

export const LOG_FILE_PATH = `${documentDirectory}app_logs.txt`;

export function consoleLog(logEntry: LogEntry): void {
  const prefix = `[${logEntry.level}] ${logEntry.timestamp}`;
  const args: unknown[] = [`${prefix} - ${logEntry.message}`];

  if (logEntry.context && Object.keys(logEntry.context).length > 0) {
    args.push(logEntry.context);
  }

  if (logEntry.data !== undefined) {
    args.push(logEntry.data);
  }

  if (logEntry.stackTrace) {
    args.push(logEntry.stackTrace);
  }

  switch (logEntry.level) {
    case LogLevel.DEBUG:
      originalConsole.log(...args);
      break;
    case LogLevel.INFO:
      originalConsole.info(...args);
      break;
    case LogLevel.WARN:
      originalConsole.warn(...args);
      break;
    case LogLevel.ERROR:
    case LogLevel.CRITICAL:
      originalConsole.error(...args);
      break;
  }
}

export async function writeLogToFile(logEntry: LogEntry): Promise<void> {
  try {
    const logLine = `${JSON.stringify(logEntry)}\n`;
    const fileInfo = await fileSystem.getInfoAsync(LOG_FILE_PATH);
    const existingContent = fileInfo.exists
      ? await fileSystem.readAsStringAsync(LOG_FILE_PATH)
      : '';

    await fileSystem.writeAsStringAsync(LOG_FILE_PATH, existingContent + logLine, {
      encoding: EncodingType.UTF8,
    });
  } catch (error) {
    if (__DEV__) {
      originalConsole.error('[Logger] File write failed:', error);
    }
  }
}

export async function readLogFile(): Promise<string | null> {
  try {
    const fileInfo = await fileSystem.getInfoAsync(LOG_FILE_PATH);

    if (fileInfo.exists) {
      return await fileSystem.readAsStringAsync(LOG_FILE_PATH);
    }

    return null;
  } catch (error) {
    originalConsole.error('[Logger] Failed to read log file:', error);
    return null;
  }
}

export async function clearLogFile(): Promise<void> {
  try {
    await fileSystem.deleteAsync(LOG_FILE_PATH, {idempotent: true});
  } catch (error) {
    originalConsole.error('[Logger] Failed to delete log file:', error);
  }
}

export function sendToExternalService(logEntry: LogEntry): void {
  try {
    if (__DEV__) {
      originalConsole.log('[Logger] Firebase Crashlytics temporarily disabled:', logEntry.message);
    }
  } catch (error) {
    if (__DEV__) {
      originalConsole.error('[Logger] Firebase Crashlytics integration failed:', error);
    }
  }
}
