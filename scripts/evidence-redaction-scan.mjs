import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const evidenceDir = "docs/evidence";
const placeholderPattern = /^(|<.*>|replace_with.*|changeme|change-me|dummy|example|todo|tbd|test|test_only|redacted|\[redacted\])$/i;
const allowedPublicEmailDomains = new Set(["kozbeylikonagi.com", "kozbeylikonagi.com.tr"]);
const allowedPublicPhoneNumbers = new Set(["902328261112", "905322342686"]);

const tokenPatterns = [
  {
    id: "private_key",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/i,
    message: "Private key material must never be stored in launch evidence.",
  },
  {
    id: "github_token",
    pattern: /\b(?:ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/,
    message: "GitHub tokens must be redacted from launch evidence.",
  },
  {
    id: "stripe_or_payment_secret",
    pattern: /\b(?:sk_live_|sk_test_)[A-Za-z0-9]{16,}\b/,
    message: "Payment provider secret keys must be redacted from launch evidence.",
  },
  {
    id: "slack_token",
    pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/,
    message: "Slack tokens must be redacted from launch evidence.",
  },
  {
    id: "aws_access_key",
    pattern: /\bAKIA[0-9A-Z]{16}\b/,
    message: "AWS access keys must be redacted from launch evidence.",
  },
  {
    id: "google_api_key",
    pattern: /\bAIza[0-9A-Za-z_-]{20,}\b/,
    message: "Google API keys must be redacted from launch evidence.",
  },
  {
    id: "vercel_token",
    pattern: /\bvercel_[A-Za-z0-9]{20,}\b/,
    message: "Vercel tokens must be redacted from launch evidence.",
  },
  {
    id: "npm_token",
    pattern: /\bnpm_[A-Za-z0-9]{20,}\b/,
    message: "npm tokens must be redacted from launch evidence.",
  },
  {
    id: "jwt_token",
    pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/,
    message: "JWT-style access tokens must be redacted from launch evidence.",
  },
  {
    id: "database_connection_string",
    pattern: /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s`'"<>:]+:[^\s`'"<>@]+@[^\s`'"<>]+/i,
    message: "Database connection strings must be redacted from launch evidence.",
  },
  {
    id: "basic_auth_url",
    pattern: /\bhttps?:\/\/[^\s`'"<>:@/]+:[^\s`'"<>@/]+@[^\s`'"<>]+/i,
    message: "URLs containing embedded credentials must be redacted from launch evidence.",
  },
];

function listMarkdownFiles(baseDir, dir) {
  const fullDir = path.join(baseDir, dir);
  if (!fs.existsSync(fullDir)) return [];

  return fs.readdirSync(fullDir, { withFileTypes: true }).flatMap((entry) => {
    const relPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listMarkdownFiles(baseDir, relPath);
    return entry.isFile() && entry.name.endsWith(".md") ? [relPath] : [];
  });
}

function luhnValid(value) {
  const digits = value.replace(/\D/g, "");
  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function validTurkishIdentityNumber(value) {
  if (!/^[1-9]\d{10}$/.test(value)) return false;
  const digits = value.split("").map(Number);
  const odd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const even = digits[1] + digits[3] + digits[5] + digits[7];
  const tenth = ((odd * 7) - even) % 10;
  const eleventh = digits.slice(0, 10).reduce((total, digit) => total + digit, 0) % 10;

  return digits[9] === tenth && digits[10] === eleventh;
}

function lineNumberForOffset(source, offset) {
  return source.slice(0, offset).split(/\r?\n/).length;
}

function finding(file, source, index, category, message) {
  return {
    file,
    line: lineNumberForOffset(source, index),
    category,
    message,
  };
}

function hasMeaningfulSecretAssignment(line) {
  const match = line.match(/^\s*([A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|PRIVATE|STORE_KEY|API_KEY)[A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
  if (!match) return false;
  const value = match[2].replace(/^["'`]|["'`]$/g, "").trim();
  return !placeholderPattern.test(value);
}

function allowedPublicEmail(value) {
  const domain = value.split("@").pop()?.toLowerCase();
  return Boolean(domain && allowedPublicEmailDomains.has(domain));
}

function normalizePhone(value) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `90${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `9${digits}`;
  return digits;
}

function allowedPublicPhone(value) {
  return allowedPublicPhoneNumbers.has(normalizePhone(value));
}

export function scanEvidenceSource(source, file = "inline.md") {
  const findings = [];

  for (const tokenPattern of tokenPatterns) {
    for (const match of source.matchAll(new RegExp(tokenPattern.pattern, `${tokenPattern.pattern.flags}g`))) {
      findings.push(finding(file, source, match.index ?? 0, tokenPattern.id, tokenPattern.message));
    }
  }

  for (const match of source.matchAll(/\bTR\d{2}(?:[ -]?\d){20,24}\b/gi)) {
    findings.push(
      finding(file, source, match.index ?? 0, "iban", "Bank IBAN values must be redacted from launch evidence."),
    );
  }

  for (const match of source.matchAll(/\b(?:\d[ -]?){13,19}\b/g)) {
    const candidate = match[0].replace(/\D/g, "");
    if (candidate.length >= 13 && candidate.length <= 19 && luhnValid(candidate)) {
      findings.push(
        finding(file, source, match.index ?? 0, "payment_card", "Payment card numbers must be redacted from launch evidence."),
      );
    }
  }

  for (const match of source.matchAll(/\b(?:cvv|cvc|security code)\s*[:=]\s*\d{3,4}\b/gi)) {
    findings.push(
      finding(file, source, match.index ?? 0, "card_security_code", "Card security codes must be redacted from launch evidence."),
    );
  }

  for (const match of source.matchAll(/\b[1-9]\d{10}\b/g)) {
    if (validTurkishIdentityNumber(match[0])) {
      findings.push(
        finding(file, source, match.index ?? 0, "turkish_identity_number", "TCKN values must be redacted from launch evidence."),
      );
    }
  }

  for (const match of source.matchAll(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi)) {
    if (!allowedPublicEmail(match[0])) {
      findings.push(
        finding(file, source, match.index ?? 0, "guest_email", "Guest or non-public email addresses must be redacted from launch evidence."),
      );
    }
  }

  for (const match of source.matchAll(/\b(?:\+?90[\s.-]*)?(?:0[\s.-]*)?(?:[235]\d{2}[\s.-]*)\d{3}[\s.-]?\d{2}[\s.-]?\d{2}\b/g)) {
    if (!allowedPublicPhone(match[0])) {
      findings.push(
        finding(file, source, match.index ?? 0, "guest_phone", "Guest or non-public phone numbers must be redacted from launch evidence."),
      );
    }
  }

  source.split(/\r?\n/).forEach((line, index) => {
    if (hasMeaningfulSecretAssignment(line)) {
      findings.push({
        file,
        line: index + 1,
        category: "secret_env_assignment",
        message: "Secret-looking env assignments must be redacted from launch evidence.",
      });
    }
  });

  return findings;
}

export function scanEvidenceDirectory(baseDir = root) {
  const files = listMarkdownFiles(baseDir, evidenceDir);
  const findings = files.flatMap((file) => {
    const source = fs.readFileSync(path.join(baseDir, file), "utf8");
    return scanEvidenceSource(source, file);
  });

  return {
    status: findings.length === 0 ? "pass" : "fail",
    scannedDir: evidenceDir,
    scannedFiles: files.length,
    findings,
  };
}

function formatReport(report) {
  const lines = [
    "Kozbeyli Konagi evidence redaction scan",
    `Decision: ${report.status === "pass" ? "PASS" : "FAIL"}`,
    `Scanned files: ${report.scannedFiles}`,
  ];

  if (report.findings.length > 0) {
    lines.push("", "Findings:");
    for (const item of report.findings) {
      lines.push(`- ${item.file}:${item.line} ${item.category} - ${item.message}`);
    }
  }

  return lines.join("\n");
}

function main() {
  const json = process.argv.includes("--json");
  const report = scanEvidenceDirectory();
  console.log(json ? JSON.stringify(report, null, 2) : formatReport(report));
  process.exit(report.status === "pass" ? 0 : 1);
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}
