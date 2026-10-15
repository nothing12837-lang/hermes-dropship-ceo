/**
 * Curated image fallbacks for catalog items when image_url is missing.
 * 100% Genuine Qikink Print-on-Demand Collection.
 */

export const FALLBACK_IMAGES: Record<string, string> = {
  "qikink-oversized-t-shirt-uc22": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/3/4d542001-463c-416c-86ea-93effc54f669.jpg",
  "qikink-acid-wash-oversized-t-shirt-uc61": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/63/4ca57c05-41a5-45b1-9856-5c6ac1e7f33f.jpg",
  "qikink-terry-oversized-t-shirt-ut27": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/44/df1b411b-46ec-4c8f-aa0d-75b796bcda00.jpg",
  "qikink-supima-cotton-t-shirts-uc23": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/41/d4c73929-12bd-4e79-ad05-ec41d8d14d5f.jpg",
  "qikink-round-neck-t-shirt-classic-uc21": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/6/f787f104-9e35-4cad-acab-05be0c7f322d.jpg",
  "qikink-polo-t-shirts-mp25": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/18/10c8083a-3fff-4839-a473-f6c07cc6b708.jpg",
  "qikink-gym-vest-men-ms36": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/66/84dab9ed-cfbd-4259-b12f-50dc3f96154e.jpg",
  "qikink-crop-top-fc39": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/37/604e613a-23a0-44ff-9c78-8c9711aa4332.jpg",
  "qikink-oversized-hoodie-uh32": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/82/ddc7518f-afc2-4370-8d1a-43db4863d356.jpg",
  "qikink-unisex-fleece-heavyweight-zip-hoodie-uh38": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/76/e8cb03d3-db36-4ffa-8415-682598c26626.jpg",
  "qikink-oversized-sweatshirt-uh35": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/42/e1aabdde-178c-4773-9b54-93df46230600.jpg",
  "qikink-cropped-hoodie-fc32": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/14/905f2760-b428-4095-9427-4e0373b550fd.jpg",
  "qikink-joggers-uj29": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/32/3f45e6d3-837a-461b-9f52-b2c615eb14e4.jpg",
  "qikink-sweatpants-us52": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/320/c87587e9-0faa-4c24-8c3d-a74f012c3eb3.webp",
  "qikink-steel-water-bottle": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/273/d0aa5134-38bf-4c42-9b59-df25de4bf1c2.jpg",
  "qikink-tumbler-bottle": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/57/d42bf518-cd45-411b-8eb0-d0c0384e3fd1.jpg",
  "qikink-sipper-bottle": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/53/39f2c346-c5f8-45dc-918a-08e56b1a90c5.jpg",
  "qikink-desk-mat": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/81/053d5b4d-c93f-4234-9e2b-6bc122a7db0b.jpg",
  "qikink-mouse-pad": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/52/1da2d780-a6a8-4fab-9eb2-c7fbd75c37ef.jpg",
  "qikink-clear-phone-case": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/325/c0b869cd-33d3-4167-a9ec-365dbc0860fd.webp",
  "qikink-tote-bag": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/19/eb4b0c27-02ab-4a23-8c02-e60e9460c4f6.jpg",
  "qikink-large-tote-bag": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/106/ff357000-e9f9-4162-84ce-8603053ba68f.jpg",
  "qikink-notebook": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/280/9d7c853e-f1f6-4e3b-beed-472e9ecda38b.jpg",
  "qikink-die-cut-stickers": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/58/de1e7992-9b6b-4803-8d77-0fbcff706eb3.jpg",
  "qikink-poster-frames": "https://qikink-stores.s3.ap-south-1.amazonaws.com/assets/mockups/62/8fec1804-d535-4b39-a0b7-5ed822944e22.jpg",
};

/** DB image first, curated fallback second, undefined last. */
export function resolveProductImage(id: string, imageUrl?: string | null): string | undefined {
  if (imageUrl && imageUrl.trim().length > 0) return imageUrl;
  return FALLBACK_IMAGES[id];
}
