import { db } from "./client.js";

const TRANSACTION_UNSUPPORTED_MESSAGE = "No transactions support in neon-http driver";
let warnedNoTransactionSupport = false;

function isTransactionUnsupportedError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes(TRANSACTION_UNSUPPORTED_MESSAGE)
  );
}

export async function withDbTransaction<T>(
  operation: (tx: typeof db) => Promise<T>,
): Promise<T> {
  const transaction = (
    db as typeof db & {
      transaction?: (cb: (tx: typeof db) => Promise<T>) => Promise<T>;
    }
  ).transaction;

  if (typeof transaction !== "function") {
    return operation(db);
  }

  try {
    return await transaction.call(db, operation);
  } catch (error) {
    if (!isTransactionUnsupportedError(error)) {
      throw error;
    }

    if (!warnedNoTransactionSupport) {
      warnedNoTransactionSupport = true;
      console.warn(
        "[db] Transactions are unavailable with neon-http; running multi-step writes without transaction.",
      );
    }

    return operation(db);
  }
}
