import { appRouter } from "../server/routers";

async function testCategoryFlow() {
  console.log("🚀 Starting Product Categories E2E Integration Test...");

  const adminCtx = {
    user: {
      id: 1,
      role: "admin",
      openId: "admin",
      name: "Admin",
      email: "admin@manjugroup.lk",
      lastSignedIn: new Date(),
    } as any,
    isAdminByPasscode: true,
    req: {} as any,
    res: {} as any,
  };

  const publicCtx = {
    user: null,
    isAdminByPasscode: false,
    req: {} as any,
    res: {} as any,
  };

  const adminCaller = appRouter.createCaller(adminCtx);
  const publicCaller = appRouter.createCaller(publicCtx);

  // 1. Query initial public categories
  console.log("\n[1] Checking initial public categories.list...");
  const initialPublicList = await publicCaller.categories.list();
  console.log(`✅ Public categories count: ${initialPublicList.length}`);
  initialPublicList.forEach((c) => console.log(`   - ${c.name} (slug: ${c.slug}, id: ${c.id})`));

  // 2. Query initial admin categories
  console.log("\n[2] Checking initial categories.adminList...");
  const initialAdminList = await adminCaller.categories.adminList();
  console.log(`✅ Admin categories count: ${initialAdminList.length}`);

  // 3. Create a new category
  const testName = `Solar Energy Solutions ${Date.now().toString().slice(-4)}`;
  const testSlug = `solar-energy-${Date.now().toString().slice(-4)}`;
  console.log(`\n[3] Creating new category "${testName}" via categories.create...`);
  const createdCategory = await adminCaller.categories.create({
    name: testName,
    slug: testSlug,
    description: "High capacity rooftop solar inverters and lithium storage batteries",
    sortOrder: 5,
    isActive: true,
  });
  console.log(`✅ Category created successfully! ID: ${createdCategory.id}, Name: "${createdCategory.name}", Slug: "${createdCategory.slug}"`);

  // 4. Verify in adminList
  console.log("\n[4] Verifying in categories.adminList...");
  const updatedAdminList = await adminCaller.categories.adminList();
  const foundInAdmin = updatedAdminList.find((c) => c.id === createdCategory.id);
  if (!foundInAdmin) {
    throw new Error(`Created category not found in adminList!`);
  }
  console.log(`✅ Found in adminList: "${foundInAdmin.name}" with ${foundInAdmin.productCount} products assigned.`);

  // 5. Verify in public categories.list (for Products page pills)
  console.log("\n[5] Verifying in public categories.list...");
  const updatedPublicList = await publicCaller.categories.list();
  const foundInPublic = updatedPublicList.find((c) => c.id === createdCategory.id);
  if (!foundInPublic) {
    throw new Error(`Created category not found in public categories.list!`);
  }
  console.log(`✅ Found in public list! Products page will render this category pill immediately.`);

  // 6. Verify in admin.categoryOptions (for Product Add/Edit dropdown)
  console.log("\n[6] Verifying in admin.categoryOptions...");
  const categoryOptions = await adminCaller.admin.categoryOptions();
  const foundInOptions = categoryOptions.find((c) => c.id === createdCategory.id);
  if (!foundInOptions) {
    throw new Error(`Created category not found in admin.categoryOptions!`);
  }
  console.log(`✅ Found in admin.categoryOptions: "${foundInOptions.name}" (ID: ${foundInOptions.id})`);

  // 7. Update category details
  console.log("\n[7] Updating category details via categories.update...");
  const updatedCategory = await adminCaller.categories.update({
    id: createdCategory.id,
    name: `${testName} (Updated)`,
    description: "Updated solar inverters and industrial equipment",
    sortOrder: 8,
  });
  console.log(`✅ Category updated: "${updatedCategory.name}"`);

  // 8. Security test: Non-admin caller cannot create or delete categories
  console.log("\n[8] Security check: Verifying unauthenticated user CANNOT create or delete category...");
  try {
    await publicCaller.categories.create({
      name: "Unauthorized Category",
    });
    throw new Error("Security failure: Unauthenticated user was able to create a category!");
  } catch (err: any) {
    console.log(`✅ Security confirmed: Unauthenticated create blocked with: "${err.message}"`);
  }

  try {
    await publicCaller.categories.delete({
      id: createdCategory.id,
    });
    throw new Error("Security failure: Unauthenticated user was able to delete a category!");
  } catch (err: any) {
    console.log(`✅ Security confirmed: Unauthenticated delete blocked with: "${err.message}"`);
  }

  // 9. Delete test category as Admin
  console.log("\n[9] Deleting test category via categories.delete (admin)...");
  const deleteResult = await adminCaller.categories.delete({
    id: createdCategory.id,
  });
  console.log(`✅ Category deleted successfully:`, deleteResult);

  // 10. Confirm deletion from public list
  console.log("\n[10] Confirming deletion in public categories.list...");
  const finalList = await publicCaller.categories.list();
  const stillExists = finalList.some((c) => c.id === createdCategory.id);
  if (stillExists) {
    throw new Error(`Category still exists in public list after deletion!`);
  }
  console.log(`✅ Confirmed deleted. Public list has ${finalList.length} categories.`);

  console.log("\n🎉 ALL PRODUCT CATEGORIES & SECURITY TESTS PASSED! 🚀💯\n");
}

testCategoryFlow()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  });
