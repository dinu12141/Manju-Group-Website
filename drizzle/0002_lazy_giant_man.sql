ALTER TABLE `cart_items` MODIFY COLUMN `productId` varchar(256) NOT NULL;--> statement-breakpoint
ALTER TABLE `cart_items` MODIFY COLUMN `variantId` varchar(256);--> statement-breakpoint
ALTER TABLE `order_items` MODIFY COLUMN `productId` varchar(256) NOT NULL;--> statement-breakpoint
ALTER TABLE `order_items` MODIFY COLUMN `variantId` varchar(256);--> statement-breakpoint
ALTER TABLE `reviews` MODIFY COLUMN `productId` varchar(256) NOT NULL;--> statement-breakpoint
ALTER TABLE `wishlists` MODIFY COLUMN `productId` varchar(256) NOT NULL;