import fs from "node:fs";
import path from "node:path";

type RawLeadCandidate = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  sector?: unknown;
  website?: unknown;
  notes?: unknown;
};

type NormalizedLeadCandidate = {
  name: string;
  email: string;
  phone?: string;
  sector: string;
  website?: string;
  notes?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const websitePattern = /^https:\/\/[^\s]+\.[^\s]+$/;

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validateCandidate(candidate: RawLeadCandidate, index: number) {
  const name = asString(candidate.name);
  const email = asString(candidate.email).toLowerCase();
  const sector = asString(candidate.sector);
  const phone = asString(candidate.phone);
  const website = asString(candidate.website);
  const notes = asString(candidate.notes);
  const errors: string[] = [];

  if (name.length < 2) errors.push("name is required");
  if (!emailPattern.test(email)) errors.push("valid email is required");
  if (sector.length < 2) errors.push("sector is required");
  if (website && !websitePattern.test(website)) errors.push("website must be https");

  return {
    index,
    ok: errors.length === 0,
    errors,
    candidate: {
      name,
      email,
      ...(phone ? { phone } : {}),
      sector,
      ...(website ? { website } : {}),
      ...(notes ? { notes } : {}),
    } satisfies NormalizedLeadCandidate,
  };
}

function readCandidates(inputPath: string) {
  const fullPath = path.resolve(process.cwd(), inputPath);
  const parsed = JSON.parse(fs.readFileSync(fullPath, "utf8")) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("Lead candidate file must be a JSON array.");
  }

  return parsed as RawLeadCandidate[];
}

function main() {
  const inputIndex = process.argv.indexOf("--input");

  if (inputIndex === -1 || !process.argv[inputIndex + 1]) {
    console.log(
      JSON.stringify(
        {
          status: "dry-run-only",
          writesPerformed: 0,
          message:
            "Provide --input path/to/leads.json to validate user-supplied lead candidates. This script never writes to Payload/CRM.",
          requiredFields: ["name", "email", "sector"],
          optionalFields: ["phone", "website", "notes"],
        },
        null,
        2,
      ),
    );
    return;
  }

  const candidates = readCandidates(process.argv[inputIndex + 1]);
  const results = candidates.map(validateCandidate);
  const invalid = results.filter((item) => !item.ok);

  console.log(
    JSON.stringify(
      {
        status: invalid.length === 0 ? "ready-for-manual-review" : "needs-correction",
        writesPerformed: 0,
        validCount: results.length - invalid.length,
        invalid,
        candidates: results.filter((item) => item.ok).map((item) => item.candidate),
      },
      null,
      2,
    ),
  );

  if (invalid.length > 0) process.exit(1);
}

main();
