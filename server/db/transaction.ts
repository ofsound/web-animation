import { db } from "./client.js";

const TRANSACTION_UNSUPPORTED_MESSAGE = "No transactions support in neon-http driver";
let warnedNoTransactionSupport = false;

export type DbTransactionMode = "transaction" | "fallback";

export class DbTransactionExecutionError extends Error {
  readonly mode: DbTransactionMode;
  readonly cause: unknown;

  constructor(mode: DbTransactionMode, cause: unknown) {
    super(
      cause instanceof Error
        ? cause.message
        : "Database transaction operation failed",
    );
    this.name = "DbTransactionExecutionError";
    this.mode = mode;
    this.cause = cause;
  }
}

export function isDbTransactionExecutionError(
  error: unknown,
): error is DbTransactionExecutionError {
  return error instanceof DbTransactionExecutionError;
}

function isTransactionUnsupportedError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes(TRANSACTION_UNSUPPORTED_MESSAGE)
  );
}

function warnNoTransactionSupportOnce() {
  if (!warnedNoTransactionSupport) {
    warnedNoTransactionSupport = true;
    console.warn(
      "[db] Transactions are unavailable with neon-http; running multi-step writes without transaction.",
    );
  }
}

async function runOperationWithMode<T>(
  mode: DbTransactionMode,
  operation: (tx: typeof db) => Promise<T>,
  tx: typeof db,
): Promise<{ mode: DbTransactionMode; value: T }> {
  try {
    const value = await operation(tx);
    return { mode, value };
  } catch (error) {
    throw new DbTransactionExecutionError(mode, error);
  }
}

export async function withDbTransactionWithMode<T>(
  operation: (tx: typeof db) => Promise<T>,
): Promise<{ mode: DbTransactionMode; value: T }> {
  const transaction = (
    db as typeof db & {
      transaction?: (cb: (tx: typeof db) => Promise<T>) => Promise<T>;
    }
  ).transaction;

  if (typeof transaction !== "function") {
    return runOperationWithMode("fallback", operation, db);
  }

  try {
    try {
      const value = await transaction.call(db, operation);
      return { mode: "transaction", value };
    } catch (error) {
      throw new DbTransactionExecutionError("transaction", error);
    }
  } catch (error) {
    if (
      isDbTransactionExecutionError(error) &&
      !isTransactionUnsupportedError(error.cause)
    ) {
      throw error;
    }

    if (
      !isDbTransactionExecutionError(error) &&
      !isTransactionUnsupportedError(error)
    ) {
      throw error;
    }

    warnNoTransactionSupportOnce();
    return runOperationWithMode("fallback", operation, db);
  }
}

export async function withDbTransaction<T>(
  operation: (tx: typeof db) => Promise<T>,
): Promise<T> {
  try {
    const { value } = await withDbTransactionWithMode(operation);
    return value;
  } catch (error) {
    if (isDbTransactionExecutionError(error)) {
      throw error.cause;
    }
    throw error;
  }
}
