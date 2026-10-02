/**
 * Web Worker for heavy debt calculations.
 *
 * The worker entry point stays intentionally small; calculation stages live in
 * focused modules under `src/workers/debtCalculation`.
 */

import {handleWorkerMessage} from './debtCalculation/debtCalculationMessageHandler';
import type {WorkerMessage, WorkerResponse} from './debtCalculation/debtCalculationTypes';

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  handleWorkerMessage(event.data);
};

export type {WorkerMessage, WorkerResponse};
