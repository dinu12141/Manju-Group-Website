import "dotenv/config";
import { getDb } from "../server/db";
import { orders, orderItems } from "../drizzle/schema";
import { nanoid } from "nanoid";

async function testOrderCreate() {
  console.log("Testing order creation on Supabase...");
  const db = await getDb();
  if (!db) {
    console.error("DB not available");
    return;
  }

  const orderNumber = `MG-TEST-${nanoid(4).toUpperCase()}`;
  try {
    const [inserted] = await db
      .insert(orders)
      .values({
        orderNumber,
        userId: null,
        status: "pending",
        subtotal: "150000.00",
        shippingFee: "0.00",
        discount: "0.00",
        total: "150000.00",
        currency: "LKR",
        paymentMethod: "cod",
        paymentStatus: "pending",
        shippingAddress: {
          firstName: "Dinusha",
          lastName: "K",
          email: "dinushaud12@gmail.com",
          phone: "0771234567",
          address: "Colombo",
          city: "Colombo",
        },
        billingAddress: null,
        notes: "Test order",
      })
      .returning({ id: orders.id, orderNumber: orders.orderNumber });

    console.log("✅ Order inserted successfully! ID:", inserted.id, "Number:", inserted.orderNumber);

    await db.insert(orderItems).values([
      {
        orderId: inserted.id,
        productId: "1",
        variantId: null,
        productName: "Dew EM005 2400W Electric Bike",
        variantName: null,
        sku: "DEM005-2400",
        quantity: 1,
        unitPrice: "150000.00",
        subtotal: "150000.00",
      },
    ]);
    console.log("✅ Order items inserted successfully!");

    // Clean up test order
    await db.delete(orderItems).where(eq(orderItems.orderId, inserted.id));
    await db.delete(orders).where(eq(orders.id, inserted.id));
    console.log("✅ Test order cleaned up successfully!");
  } catch (e: any) {
    console.error("❌ Order Creation Error:", e);
  }
}

import { eq } from "drizzle-orm";
testOrderCreate();
