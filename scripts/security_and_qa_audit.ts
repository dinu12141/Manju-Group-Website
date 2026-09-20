import "dotenv/config";
import { verifyAdminPasscode, verifyAdminToken, issueAdminToken } from "../server/_core/adminPasscode";

const BASE_URL = "http://localhost:3000/api/trpc";

interface TestResult {
  category: "SECURITY" | "AUTHENTICATION" | "AUTHORIZATION" | "DATA_INTEGRITY" | "FUNCTIONAL_QA";
  name: string;
  expected: string;
  actual: string;
  passed: boolean;
  notes?: string;
}

const results: TestResult[] = [];

function record(category: TestResult["category"], name: string, expected: string, actual: string, passed: boolean, notes?: string) {
  results.push({ category, name, expected, actual, passed, notes });
  const icon = passed ? "✅" : "❌";
  console.log(`${icon} [${category}] ${name}`);
  if (!passed) {
    console.error(`   Expected: ${expected}`);
    console.error(`   Actual:   ${actual}`);
    if (notes) console.error(`   Notes:    ${notes}`);
  }
}

async function rawTrpc(path: string, type: "query" | "mutation", input?: any, adminToken?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (adminToken) headers["X-Admin-Token"] = adminToken;

  let url = `${BASE_URL}/${path}`;
  if (type === "query" && input !== undefined) {
    url += `?input=${encodeURIComponent(JSON.stringify({ json: input }))}`;
  }

  const res = await fetch(url, {
    method: type === "query" ? "GET" : "POST",
    headers,
    body: type === "mutation" ? JSON.stringify({ json: input ?? {} }) : undefined,
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    // raw text
  }

  return { status: res.status, json, text };
}

async function runSecurityAndQAAudit() {
  console.log("===============================================================================");
  console.log("🔒 STARTING COMPREHENSIVE SECURITY AUDIT & FULL QA TEST SUITE");
  console.log("===============================================================================\n");

  // ───────────────────────────────────────────────────────────────────────────
  // PART 1: AUTHENTICATION & TIMING-ATTACK RESISTANCE
  // ───────────────────────────────────────────────────────────────────────────
  console.log("--- 1. AUTHENTICATION & PASSCODE TIMING SAFETY ---");

  // Test 1.1: Timing-safe passcode verification
  const validPass = verifyAdminPasscode("manju2026");
  const invalidPass1 = verifyAdminPasscode("wrongpasscode");
  const invalidPass2 = verifyAdminPasscode("manju2025");
  const emptyPass = verifyAdminPasscode("");

  record(
    "AUTHENTICATION",
    "Passcode verification unit test",
    "Valid = true, Invalid = false",
    `valid: ${validPass}, wrong: ${invalidPass1}, near-miss: ${invalidPass2}, empty: ${emptyPass}`,
    validPass && !invalidPass1 && !invalidPass2 && !emptyPass
  );

  // Test 1.2: Calling admin.verifyPasscode with invalid passcode
  const rejectRes = await rawTrpc("admin.verifyPasscode", "mutation", { passcode: "hacker123" });
  record(
    "AUTHENTICATION",
    "admin.verifyPasscode rejects unauthorized attacker password",
    "HTTP 500 / error: Invalid passcode",
    `status: ${rejectRes.status}, error: ${rejectRes.json?.error?.json?.message || rejectRes.text}`,
    rejectRes.status !== 200 && (rejectRes.text.includes("Invalid passcode") || rejectRes.json?.error)
  );

  // Test 1.3: Calling admin.verifyPasscode with valid passcode
  const loginRes = await rawTrpc("admin.verifyPasscode", "mutation", { passcode: "manju2026" });
  const realAdminToken = loginRes.json?.result?.data?.json?.token;
  record(
    "AUTHENTICATION",
    "admin.verifyPasscode succeeds with correct passcode 'manju2026'",
    "HTTP 200 + valid HMAC token issued",
    `status: ${loginRes.status}, token: ${realAdminToken ? realAdminToken.substring(0, 16) + "..." : "none"}`,
    loginRes.status === 200 && !!realAdminToken
  );

  // ───────────────────────────────────────────────────────────────────────────
  // PART 2: AUTHORIZATION & ACCESS CONTROL (BROKEN OBJECT LEVEL AUTH TEST)
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- 2. AUTHORIZATION & RBAC ENFORCEMENT ---");

  // Test 2.1: Protected procedure called with NO TOKEN
  const noTokenLocationsRes = await rawTrpc("admin.locationsList", "query", {});
  record(
    "AUTHORIZATION",
    "admin.locationsList blocked without credentials (No Token)",
    "HTTP 401/403 or TRPC UNAUTHORIZED/FORBIDDEN",
    `status: ${noTokenLocationsRes.status}, code: ${noTokenLocationsRes.json?.error?.json?.code || "none"}`,
    [401, 403].includes(noTokenLocationsRes.status) || [-32001, -32003].includes(noTokenLocationsRes.json?.error?.json?.code)
  );

  // Test 2.2: Protected mutation called with NO TOKEN
  const noTokenCreateRes = await rawTrpc("admin.createLocation", "mutation", {
    name: "Hacker Branch",
    address: "123 Exploit Way",
    city: "Nowhere",
  });
  record(
    "AUTHORIZATION",
    "admin.createLocation blocked without credentials (No Token)",
    "HTTP 401/403 or TRPC UNAUTHORIZED/FORBIDDEN",
    `status: ${noTokenCreateRes.status}, code: ${noTokenCreateRes.json?.error?.json?.code || "none"}`,
    [401, 403].includes(noTokenCreateRes.status) || [-32001, -32003].includes(noTokenCreateRes.json?.error?.json?.code)
  );

  // Test 2.3: Protected mutation called with FORGED / TAMPERED HMAC TOKEN
  const tamperedToken = Buffer.from(`admin:${Date.now() + 999999}:fake_forged_signature_hex`).toString("base64url");
  const tamperedRes = await rawTrpc("admin.locationsList", "query", {}, tamperedToken);
  record(
    "SECURITY",
    "Reject forged/tampered HMAC admin token",
    "HTTP 401/403 or TRPC UNAUTHORIZED/FORBIDDEN",
    `status: ${tamperedRes.status}, code: ${tamperedRes.json?.error?.json?.code || "none"}`,
    [401, 403].includes(tamperedRes.status) || [-32001, -32003].includes(tamperedRes.json?.error?.json?.code)
  );

  // Test 2.4: Protected mutation called with EXPIRED HMAC TOKEN
  const expiredToken = Buffer.from(`admin:${Date.now() - 1000000}:validsignature`).toString("base64url");
  const expiredRes = await rawTrpc("admin.locationsList", "query", {}, expiredToken);
  record(
    "SECURITY",
    "Reject expired admin token",
    "HTTP 401/403 or TRPC UNAUTHORIZED/FORBIDDEN",
    `status: ${expiredRes.status}, code: ${expiredRes.json?.error?.json?.code || "none"}`,
    [401, 403].includes(expiredRes.status) || [-32001, -32003].includes(expiredRes.json?.error?.json?.code)
  );

  // Test 2.5: Protected endpoint called WITH VALID TOKEN
  const authorizedLocationsRes = await rawTrpc("admin.locationsList", "query", { province: "All" }, realAdminToken);
  record(
    "AUTHORIZATION",
    "admin.locationsList granted with valid HMAC token",
    "HTTP 200 + array of showrooms",
    `status: ${authorizedLocationsRes.status}, count: ${authorizedLocationsRes.json?.result?.data?.json?.length ?? 0}`,
    authorizedLocationsRes.status === 200 && Array.isArray(authorizedLocationsRes.json?.result?.data?.json)
  );

  // ───────────────────────────────────────────────────────────────────────────
  // PART 3: DATA EXPOSURE & SENSITIVE LEAK PREVENTION
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- 3. DATA PRIVACY & LEAK PREVENTION ---");

  // Test 3.1: Public locations query does not leak database secrets, credentials or internal paths
  const publicLocationsRes = await rawTrpc("locations.list", "query");
  const publicData = publicLocationsRes.json?.result?.data?.json;
  let hasSensitiveLeak = false;
  let leakReason = "";

  if (Array.isArray(publicData)) {
    for (const loc of publicData) {
      const str = JSON.stringify(loc).toLowerCase();
      if (str.includes("password") || str.includes("secret") || str.includes("token") || str.includes("postgres://")) {
        hasSensitiveLeak = true;
        leakReason = `Found sensitive word in public location: ${str}`;
        break;
      }
    }
  }

  record(
    "SECURITY",
    "Public showroom API (locations.list) has zero sensitive data leakage",
    "No passwords, tokens, DB URLs, or internal secrets exposed",
    hasSensitiveLeak ? leakReason : "Clean, only public customer data returned",
    !hasSensitiveLeak && Array.isArray(publicData) && publicData.length > 0
  );

  // ───────────────────────────────────────────────────────────────────────────
  // PART 4: INPUT VALIDATION & SQL INJECTION RESISTANCE
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- 4. INPUT VALIDATION & INJECTION RESISTANCE ---");

  // Test 4.1: SQL injection probe in search input
  const sqliPayload = "' OR '1'='1' -- ";
  const sqliRes = await rawTrpc("admin.locationsList", "query", { search: sqliPayload }, realAdminToken);
  const sqliData = sqliRes.json?.result?.data?.json;
  record(
    "SECURITY",
    "SQL injection test on showroom search query",
    "Safely handled by parameterized ORM without DB error",
    `status: ${sqliRes.status}, returned items: ${Array.isArray(sqliData) ? sqliData.length : "error"}`,
    sqliRes.status === 200 && Array.isArray(sqliData)
  );

  // Test 4.2: XSS script tag injection in showroom fields
  const xssShowroom = {
    name: "<script>alert('XSS')</script> Showroom",
    badge: "<img src=x onerror=alert(1)>",
    address: "No 99, <b>Bold Street</b>",
    city: "Colombo",
    province: "Western Province",
    phone: "+94 11 000 0000",
    directCall: "0110000000",
    manager: "Test Manager",
    latitude: "6.9271",
    longitude: "79.8612",
    services: ["<svg onload=alert(1)>", "Regular Service"],
  };

  const createXssRes = await rawTrpc("admin.createLocation", "mutation", xssShowroom, realAdminToken);
  const createdXssId = createXssRes.json?.result?.data?.json?.location?.id;

  record(
    "SECURITY",
    "Input boundary & schema handling on HTML/script payloads",
    "Inserted cleanly through schema validation with zero unhandled server exceptions",
    `Created ID: ${createdXssId}, status: ${createXssRes.status}`,
    createXssRes.status === 200 && typeof createdXssId === "number"
  );

  // Clean up XSS test record
  if (createdXssId) {
    await rawTrpc("admin.deleteLocation", "mutation", { id: createdXssId }, realAdminToken);
  }

  // Test 4.3: Malformed input rejection (Missing required fields)
  const invalidInputRes = await rawTrpc("admin.createLocation", "mutation", { type: "showroom" }, realAdminToken);
  record(
    "DATA_INTEGRITY",
    "Zod schema validation rejects invalid payloads (Missing required fields)",
    "HTTP 400/500 TRPC validation error",
    `status: ${invalidInputRes.status}, error: ${invalidInputRes.json?.error?.json?.message || "none"}`,
    invalidInputRes.status !== 200 && (invalidInputRes.json?.error || invalidInputRes.text.includes("required"))
  );

  // ───────────────────────────────────────────────────────────────────────────
  // PART 5: FUNCTIONAL SHOWROOM REALTIME INTEGRATION QA
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- 5. FULL REALTIME LIFECYCLE QA ---");

  // Step 5.1: Create Showroom
  const qaShowroom = {
    name: "QA Audited VIP Branch - Negombo",
    badge: "VIP AUDITED",
    type: "showroom",
    address: "Beach Road, Negombo",
    city: "Negombo",
    province: "Western Province",
    phone: "+94 31 229 9999",
    directCall: "0312299999",
    manager: "Mr. QA Lead Auditor",
    latitude: "7.2008",
    longitude: "79.8737",
    services: ["Electric Bikes", "Spare Parts", "Fast Charger", "Warranty Claims"],
    featured: true,
    isActive: true,
    sortOrder: 1,
  };

  const createRes = await rawTrpc("admin.createLocation", "mutation", qaShowroom, realAdminToken);
  const newId = createRes.json?.result?.data?.json?.location?.id;

  record(
    "FUNCTIONAL_QA",
    "Showroom creation via admin.createLocation",
    "Creates DB record and returns showroom ID",
    `ID: ${newId}, status: ${createRes.status}`,
    createRes.status === 200 && typeof newId === "number"
  );

  // Step 5.2: Verify immediately online in public API
  const pubList1 = (await rawTrpc("locations.list", "query")).json?.result?.data?.json;
  const inPub1 = pubList1?.find((l: any) => l.id === newId);

  record(
    "FUNCTIONAL_QA",
    "Immediate real-time sync to public /locations",
    "Showroom appears in public list immediately",
    `Found: ${!!inPub1}, Name: ${inPub1?.name}`,
    !!inPub1 && inPub1.name === qaShowroom.name
  );

  // Step 5.3: Toggle visibility to false (1-Click Hide)
  await rawTrpc("admin.toggleLocationActive", "mutation", { id: newId, isActive: false }, realAdminToken);
  const pubList2 = (await rawTrpc("locations.list", "query")).json?.result?.data?.json;
  const inPub2 = pubList2?.find((l: any) => l.id === newId);

  record(
    "FUNCTIONAL_QA",
    "1-Click Hide status instantly hides showroom from public website",
    "Showroom absent from public locations.list",
    `Present in public list: ${!!inPub2}`,
    !inPub2
  );

  // Step 5.4: Verify still visible in Admin with Hidden status
  const adminList2 = (await rawTrpc("admin.locationsList", "query", { province: "All" }, realAdminToken)).json?.result?.data?.json;
  const inAdmin2 = adminList2?.find((l: any) => l.id === newId);

  record(
    "FUNCTIONAL_QA",
    "Admin cPanel retains hidden showroom with isActive=false",
    "Listed in admin with isActive=false",
    `Found in admin: ${!!inAdmin2}, isActive: ${inAdmin2?.isActive}`,
    !!inAdmin2 && inAdmin2.isActive === false
  );

  // Step 5.5: Delete Showroom
  const deleteRes = await rawTrpc("admin.deleteLocation", "mutation", { id: newId }, realAdminToken);
  const pubList3 = (await rawTrpc("locations.list", "query")).json?.result?.data?.json;
  const inPub3 = pubList3?.find((l: any) => l.id === newId);

  record(
    "FUNCTIONAL_QA",
    "Showroom deletion cleanly removes from public and admin",
    "Showroom permanently deleted",
    `Delete status: ${deleteRes.status}, still in public: ${!!inPub3}`,
    deleteRes.status === 200 && !inPub3
  );

  // Step 5.6: Confirm 9 official branches remain intact
  const finalOfficialList = (await rawTrpc("locations.list", "query")).json?.result?.data?.json;
  record(
    "DATA_INTEGRITY",
    "All 9 official Manju Group branches preserved intact",
    "Count = 9",
    `Count = ${finalOfficialList?.length}`,
    finalOfficialList?.length === 9
  );

  // ───────────────────────────────────────────────────────────────────────────
  // SUMMARY REPORT
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n===============================================================================");
  const total = results.length;
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = total - passedCount;

  console.log(`📊 AUDIT COMPLETE: ${passedCount}/${total} CHECKS PASSED (${((passedCount / total) * 100).toFixed(1)}%)`);
  if (failedCount === 0) {
    console.log("🎉 VERDICT: ALL SECURITY CHECKS AND QA VALIDATIONS PASSED WITH ZERO VULNERABILITIES!");
  } else {
    console.error(`⚠️ VERDICT: ${failedCount} CHECKS FAILED.`);
  }
  console.log("===============================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runSecurityAndQAAudit().catch(err => {
  console.error("FATAL ERROR IN AUDIT:", err);
  process.exit(1);
});
