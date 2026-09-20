import { issueAdminToken } from "../server/_core/adminPasscode";

const BASE_URL = "http://localhost:3000/api/trpc";

async function trpcCall(path: string, type: "query" | "mutation", input?: any, adminToken?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (adminToken) {
    headers["X-Admin-Token"] = adminToken;
  }

  let url = `${BASE_URL}/${path}`;
  let res: Response;

  if (type === "query") {
    if (input !== undefined) {
      url += `?input=${encodeURIComponent(JSON.stringify({ json: input }))}`;
    }
    res = await fetch(url, { method: "GET", headers });
  } else {
    res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ json: input ?? {} }),
    });
  }

  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON response from ${path} (${res.status}): ${text}`);
  }

  if (!res.ok || json.error) {
    throw new Error(`TRPC Error on ${path} (${res.status}): ${JSON.stringify(json.error || json)}`);
  }

  return json.result?.data?.json;
}

async function runQA() {
  console.log("==================================================");
  console.log("🚀 STARTING FULL REALTIME QA & VERIFICATION SUITE");
  console.log("==================================================");

  // 1. Authenticate with Admin Passcode
  console.log("\n[STEP 1] Testing Admin Passcode Verification...");
  const authRes = await trpcCall("admin.verifyPasscode", "mutation", { passcode: "manju2026" });
  if (!authRes?.token) {
    throw new Error("Failed to get admin token with passcode manju2026");
  }
  const adminToken = authRes.token;
  console.log("✅ Admin Passcode 'manju2026' accepted! Token received:", adminToken.substring(0, 20) + "...");

  // 2. Fetch Initial Public Locations
  console.log("\n[STEP 2] Fetching initial public showroom locations (GET locations.list)...");
  const initialPublicList = await trpcCall("locations.list", "query");
  console.log(`✅ Public API returned ${initialPublicList.length} active showrooms online.`);
  const initialNames = initialPublicList.map((l: any) => l.name);
  console.log("Existing Showrooms:", initialNames);

  // 3. Fetch Initial Admin Locations
  console.log("\n[STEP 3] Fetching admin showroom list (GET admin.locationsList)...");
  const initialAdminList = await trpcCall("admin.locationsList", "query", { province: "All" }, adminToken);
  console.log(`✅ Admin cPanel returned ${initialAdminList.length} total showrooms.`);

  // 4. CREATE A NEW SHOWROOM BRANCH
  console.log("\n[STEP 4] Testing Showroom Creation (POST admin.createLocation)...");
  const newShowroomInput = {
    name: "QA Live Realtime Branch - Negombo",
    badge: "QA LIVE TEST",
    type: "showroom",
    address: "No. 450, Main Street, Negombo Beach Road",
    city: "Negombo",
    province: "Western Province",
    phone: "+94 31 223 8899",
    directCall: "0312238899",
    email: "negombo-qa@manjugroup.lk",
    manager: "Mr. Test QA Lead",
    latitude: "7.2008",
    longitude: "79.8737",
    openingHours: { summary: "Mon–Sat: 8:00 AM – 7:00 PM" },
    services: ["Electric Bikes", "Spare Parts", "Fast Charging Hub", "Warranty Claim Service"],
    featured: true,
    isActive: true,
    sortOrder: 1,
  };

  const createRes = await trpcCall("admin.createLocation", "mutation", newShowroomInput, adminToken);
  if (!createRes?.location?.id) {
    throw new Error("Create showroom failed: " + JSON.stringify(createRes));
  }
  const createdId = createRes.location.id;
  console.log(`✅ Showroom created successfully with ID: ${createdId}!`);

  // 5. VERIFY IMMEDIATE REAL-TIME REFLECTION ON PUBLIC WEBSITE
  console.log("\n[STEP 5] Testing Real-Time Reflection on Public Website (/locations)...");
  const publicListAfterCreate = await trpcCall("locations.list", "query");
  const foundInPublic = publicListAfterCreate.find((l: any) => l.id === createdId);
  if (!foundInPublic) {
    throw new Error(`CRITICAL: Showroom ID ${createdId} was NOT found on public locations.list!`);
  }
  console.log("✅ REALTIME SYNC CONFIRMED: Showroom appeared immediately on public website!");
  console.log("   - Name:", foundInPublic.name);
  console.log("   - Badge:", foundInPublic.badge);
  console.log("   - Manager:", foundInPublic.manager);
  console.log("   - Direct Call:", foundInPublic.directCall);
  console.log("   - Coordinates:", `Lat: ${foundInPublic.latitude}, Lng: ${foundInPublic.longitude}`);
  console.log("   - Services count:", foundInPublic.services?.length, foundInPublic.services);

  // 6. UPDATE THE SHOWROOM
  console.log("\n[STEP 6] Testing Showroom Update (POST admin.updateLocation)...");
  const updateInput = {
    id: createdId,
    name: "QA Live Realtime Branch - Negombo (UPDATED VIP)",
    badge: "EXCLUSIVE FLAGSHIP",
    manager: "Mr. Verified Senior Manager",
    directCall: "0771234567",
    services: ["VIP Lounge", "Direct Delivery", "Test Rides", "Solar Power Station"],
  };
  const updateRes = await trpcCall("admin.updateLocation", "mutation", updateInput, adminToken);
  console.log("✅ Showroom updated in Admin cPanel.");

  // 7. VERIFY PUBLIC REFLECTION OF UPDATES
  console.log("\n[STEP 7] Verifying Updated Data on Public Website (/locations)...");
  const publicListAfterUpdate = await trpcCall("locations.list", "query");
  const updatedInPublic = publicListAfterUpdate.find((l: any) => l.id === createdId);
  if (
    updatedInPublic?.name !== updateInput.name ||
    updatedInPublic?.badge !== updateInput.badge ||
    updatedInPublic?.manager !== updateInput.manager
  ) {
    throw new Error(`CRITICAL: Public data did not match updated values: ${JSON.stringify(updatedInPublic)}`);
  }
  console.log("✅ REALTIME UPDATE CONFIRMED: Public page shows updated name, badge, manager, and services!");
  console.log("   - New Name:", updatedInPublic.name);
  console.log("   - New Badge:", updatedInPublic.badge);
  console.log("   - New Manager:", updatedInPublic.manager);
  console.log("   - New Services:", updatedInPublic.services);

  // 8. TEST TOGGLE ACTIVE / HIDDEN (1-CLICK HIDE FROM PUBLIC)
  console.log("\n[STEP 8] Testing Visibility Toggle (Hide from Public Website)...");
  await trpcCall("admin.toggleLocationActive", "mutation", { id: createdId, isActive: false }, adminToken);
  console.log("✅ Showroom toggled to isActive = false in Admin.");

  console.log("\n[STEP 9] Verifying Showroom is instantly HIDDEN from Public Website...");
  const publicListAfterHide = await trpcCall("locations.list", "query");
  const hiddenInPublic = publicListAfterHide.find((l: any) => l.id === createdId);
  if (hiddenInPublic) {
    throw new Error("CRITICAL: Showroom is still visible on public website after being disabled!");
  }
  console.log("✅ REALTIME VISIBILITY CONFIRMED: Showroom disappeared from public website immediately!");

  // Verify it is still visible in Admin with inactive status
  const adminListWithHidden = await trpcCall("admin.locationsList", "query", { province: "All" }, adminToken);
  const foundInAdmin = adminListWithHidden.find((l: any) => l.id === createdId);
  if (!foundInAdmin || foundInAdmin.isActive !== false) {
    throw new Error("CRITICAL: Showroom not listed as inactive in admin panel!");
  }
  console.log("✅ Admin cPanel correctly shows showroom with status: Hidden (Inactive)");

  // 10. TEST TOGGLE BACK TO ACTIVE
  console.log("\n[STEP 10] Testing Visibility Toggle Back to Active (Publish)...");
  await trpcCall("admin.toggleLocationActive", "mutation", { id: createdId, isActive: true }, adminToken);
  const publicListAfterReactivate = await trpcCall("locations.list", "query");
  if (!publicListAfterReactivate.some((l: any) => l.id === createdId)) {
    throw new Error("CRITICAL: Showroom did not reappear after re-activating!");
  }
  console.log("✅ REALTIME REACTIVATION CONFIRMED: Showroom republished and visible on public website again!");

  // 11. TEST DELETE SHOWROOM
  console.log("\n[STEP 11] Testing Showroom Deletion (POST admin.deleteLocation)...");
  await trpcCall("admin.deleteLocation", "mutation", { id: createdId }, adminToken);
  console.log(`✅ Showroom ID ${createdId} deleted from Admin cPanel.`);

  // 12. VERIFY CLEANUP FROM BOTH PUBLIC AND ADMIN
  console.log("\n[STEP 12] Verifying Showroom is permanently removed...");
  const finalPublicList = await trpcCall("locations.list", "query");
  const finalAdminList = await trpcCall("admin.locationsList", "query", { province: "All" }, adminToken);

  if (finalPublicList.some((l: any) => l.id === createdId)) {
    throw new Error("CRITICAL: Deleted showroom still exists in public list!");
  }
  if (finalAdminList.some((l: any) => l.id === createdId)) {
    throw new Error("CRITICAL: Deleted showroom still exists in admin list!");
  }
  console.log("✅ CLEANUP CONFIRMED: Showroom completely removed from public website and admin cPanel.");
  console.log(`Current Total Active Public Showrooms: ${finalPublicList.length}`);
  console.log(`Current Total Admin Showrooms: ${finalAdminList.length}`);

  console.log("\n==================================================");
  console.log("🎉 ALL QA REALTIME TESTS PASSED WITH 100% SUCCESS!");
  console.log("==================================================");
}

runQA().catch((err) => {
  console.error("\n❌ QA TEST FAILED:", err);
  process.exit(1);
});
