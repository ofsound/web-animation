import "dotenv/config";

type CheckResult = {
  key: string;
  status: "ok" | "warn" | "fail";
  message: string;
};

const REQUIRED_KEYS = ["DATABASE_URL", "BETTER_AUTH_SECRET", "ADMIN_PASSWORD"] as const;

const RECOMMENDED_KEYS = [
  "BETTER_AUTH_URL",
  "BETTER_AUTH_TRUSTED_ORIGINS",
  "ADMIN_EMAIL",
  "ADMIN_NAME",
  "API_PORT",
  "VITE_API_ORIGIN",
] as const;

function readEnvValue(key: string): string {
  return String(process.env[key] ?? "").trim();
}

function looksLikePlaceholder(key: string, value: string): boolean {
  const lower = value.toLowerCase();

  const commonPatterns = [
    "replace-with",
    "change-me",
    "placeholder",
    "example",
    "your-",
  ];

  if (commonPatterns.some((pattern) => lower.includes(pattern))) {
    return true;
  }

  if (key === "DATABASE_URL") {
    return (
      lower.includes("user:password") ||
      lower.includes("ep-xxx") ||
      lower.includes("/dbname")
    );
  }

  return false;
}

function validateRequiredKey(key: string): CheckResult {
  const value = readEnvValue(key);
  if (!value) {
    return {
      key,
      status: "fail",
      message: "missing",
    };
  }

  if (looksLikePlaceholder(key, value)) {
    return {
      key,
      status: "fail",
      message: "looks like a placeholder value",
    };
  }

  if (key === "DATABASE_URL" && !/^postgres(ql)?:\/\//i.test(value)) {
    return {
      key,
      status: "fail",
      message: "must start with postgres:// or postgresql://",
    };
  }

  return {
    key,
    status: "ok",
    message: "set",
  };
}

function validateRecommendedKey(key: string): CheckResult {
  const value = readEnvValue(key);
  if (!value) {
    return {
      key,
      status: "warn",
      message: "not set (using fallback/default behavior)",
    };
  }

  if (looksLikePlaceholder(key, value)) {
    return {
      key,
      status: "warn",
      message: "looks like a placeholder value",
    };
  }

  return {
    key,
    status: "ok",
    message: "set",
  };
}

function printResult(result: CheckResult): void {
  const label =
    result.status === "ok"
      ? "OK"
      : result.status === "warn"
        ? "WARN"
        : "FAIL";
  console.log(`[${label}] ${result.key}: ${result.message}`);
}

function main() {
  console.log("Environment check for migration + admin seed");

  const requiredResults = REQUIRED_KEYS.map((key) => validateRequiredKey(key));
  const recommendedResults = RECOMMENDED_KEYS.map((key) =>
    validateRecommendedKey(key),
  );

  for (const result of requiredResults) {
    printResult(result);
  }
  for (const result of recommendedResults) {
    printResult(result);
  }

  const failCount = requiredResults.filter((result) => result.status === "fail").length;
  if (failCount > 0) {
    console.error(
      `\nEnvironment check failed with ${failCount} required issue(s). Update .env and retry.`,
    );
    process.exit(1);
  }

  console.log("\nEnvironment check passed for required variables.");
}

main();
