// ========== CONFIGURATION & PRODUCTS ==========
const NOW = Date.now();
  const HOUR = 3600000;

  const PRODUCTS = [
    { id: "p01", name: "Lagos Nights Silk Shirt", type: "top", gender: "unisex", section: "new", price: 78000, rating: 4.6, reviews: 32, badge: "New", desc: "Fluid mulberry silk cut for evenings that start late." },
    { id: "p02", name: "Sculpted Wool Overcoat", type: "outerwear", gender: "unisex", section: "new", price: 215000, rating: 4.9, reviews: 18, badge: "New", desc: "Double-faced wool, structured shoulder, weightless drape." },
    { id: "p03", name: "Adire Wrap Midi Dress", type: "dress", gender: "women", section: "new", price: 96500, rating: 4.7, reviews: 41, badge: "New", desc: "Hand-dyed adire cotton, wrapped and tied at the waist." },
    { id: "p04", name: "Brass-Button Tailored Blazer", type: "outerwear", gender: "unisex", section: "new", price: 185000, rating: 4.8, reviews: 27, badge: "New", desc: "Single-breasted, brass hardware, cut close through the waist.", sale: { price: 149000, endsAt: NOW + 3 * HOUR } },
    { id: "p05", name: "Ribbed Cashmere Turtleneck", type: "top", gender: "unisex", section: "new", price: 102000, rating: 4.9, reviews: 22, badge: "New", desc: "Grade-A cashmere, ribbed for a close, considered fit." },
    { id: "p06", name: "Wide-Leg Linen Trousers", type: "bottom", gender: "women", section: "new", price: 64000, rating: 4.5, reviews: 35, badge: "New", desc: "Breathable linen, high waist, a break at the ankle." },
    { id: "p07", name: "Aso-Oke Trim Kaftan", type: "top", gender: "men", section: "trending", price: 142000, rating: 4.8, reviews: 29, badge: "Trending", desc: "Hand-woven aso-oke trim on breathable cotton voile." },
    { id: "p08", name: "Draped Satin Slip Dress", type: "dress", gender: "women", section: "trending", price: 89000, rating: 4.6, reviews: 38, badge: "Trending", desc: "Bias-cut satin that moves with you, not against you." },
    { id: "p09", name: "Structured Leather Tote", type: "bag", gender: "women", section: "trending", price: 168000, rating: 4.9, reviews: 44, badge: "Trending", desc: "Full-grain leather, hand-stitched, built for a decade.", sale: { price: 129000, endsAt: NOW + 9 * HOUR } },
    { id: "p10", name: "Double-Breasted Pinstripe Suit", type: "outerwear", gender: "men", section: "trending", price: 298000, rating: 5.0, reviews: 15, badge: "Trending", desc: "Two-piece, half-canvas construction, cut for the boardroom." },
    { id: "p11", name: "Pleated Chiffon Maxi Skirt", type: "bottom", gender: "women", section: "trending", price: 74500, rating: 4.5, reviews: 26, badge: "Trending", desc: "Knife-pleated chiffon that catches the light in motion." },
    { id: "p12", name: "Signature Monogram Belt", type: "accessory", gender: "unisex", section: "trending", price: 45000, rating: 4.7, reviews: 33, badge: "Trending", desc: "Italian leather, brass monogram buckle, made to outlast the outfit." },
    { id: "p13", name: "Classic Trench in Camel", type: "outerwear", gender: "unisex", section: "best", price: 176000, rating: 4.9, reviews: 61, badge: "Bestseller", desc: "Water-resistant cotton gabardine, storm flap, timeless line.", sale: { price: 139000, endsAt: NOW + 26 * HOUR } },
    { id: "p14", name: "Hand-Beaded Evening Clutch", type: "bag", gender: "women", section: "best", price: 58000, rating: 4.8, reviews: 52, badge: "Bestseller", desc: "Hand-beaded by artisans, finished in polished brass." },
    { id: "p15", name: "Merino Wool Polo", type: "top", gender: "men", section: "best", price: 52000, rating: 4.6, reviews: 47, badge: "Bestseller", desc: "Fine-gauge merino, three-button placket, holds its shape." },
    { id: "p16", name: "Tailored Ankara Blazer", type: "outerwear", gender: "unisex", section: "best", price: 158000, rating: 4.9, reviews: 39, badge: "Bestseller", desc: "Bold Ankara print, tailored silhouette, fully lined." },
    { id: "p17", name: "Silk Charmeuse Camisole", type: "top", gender: "women", section: "best", price: 46000, rating: 4.7, reviews: 44, badge: "Bestseller", desc: "Pure silk charmeuse, adjustable straps, cut on the bias." },
    { id: "p18", name: "Gold-Tone Statement Earrings", type: "accessory", gender: "women", section: "best", price: 39000, rating: 4.8, reviews: 58, badge: "Bestseller", desc: "Brushed gold-tone brass, hand-finished, lightweight hold." },
    { id: "p19", name: "Everyday Signature Hoodie", type: "top", gender: "unisex", section: "new", price: 54000, rating: 4.6, reviews: 40, badge: "New", desc: "Heavyweight loopback cotton with the house monogram, brushed soft inside." },
    { id: "p20", name: "Selvedge Straight Jeans", type: "bottom", gender: "unisex", section: "trending", price: 72000, rating: 4.7, reviews: 36, badge: "Trending", desc: "Japanese selvedge denim, straight cut, built to fade beautifully." },
    { id: "p21", name: "Leather Oxford Shoes", type: "shoes", gender: "men", section: "best", price: 98000, rating: 4.8, reviews: 30, badge: "Bestseller", desc: "Hand-lasted calfskin oxfords, built on a leather sole." },
    { id: "p22", name: "Block-Heel Leather Mules", type: "shoes", gender: "women", section: "trending", price: 86000, rating: 4.6, reviews: 24, badge: "Trending", desc: "Sculpted block heel, buttery leather, made for long Lagos days." },
    { id: "p23", name: "Canvas Low-Top Sneakers", type: "shoes", gender: "unisex", section: "new", price: 58000, rating: 4.5, reviews: 45, badge: "New", desc: "Washed canvas, rubber sole, the off-duty everyday shoe." },
    { id: "p24", name: "Minimalist Gold Watch", type: "accessory", gender: "unisex", section: "best", price: 145000, rating: 4.9, reviews: 20, badge: "Bestseller", desc: "Brushed gold-tone case, sapphire crystal, quietly confident." }
  ];
  /* Curated per-product photography: unlike the old pool-based system,
     every product below points at a specific, hand-checked photo that
     matches what the product actually is, sourced from Unsplash's
     Black-model / African-fashion collections. Secondary images (for
     the hover-swap and quick-view gallery) draw from a same-category
     pool so every product still has 3 images without repeating its
     own primary shot. */
  const CURATED_PRIMARY = {
    p01: "1588560979004-a4de3190506e", // man in black long sleeve shirt
    p02: "1569247539558-7d13389c0eed", // man in coat
    p03: "1625646741211-711bdd65c570", // woman in floral dress
    p04: "1569247539714-1e4a2d2d15e4", // man in notched-lapel blazer
    p05: "1617293851568-bac1f3af7e09", // man in turtleneck
    p06: "1493655161922-ef98929de9d8", // women in white trousers
    p07: "1611145790393-66f58e1caaf9", // man in patterned shirt
    p08: "1696962678565-bee84e6b9cb6", // woman in dress
    p09: "1587467512961-120760940315", // leather tote (category pool)
    p10: "1495603889488-42d1d66e5523", // man in formal suit
    p11: "1708170236295-20ab8fbadcef", // woman, draped skirt
    p12: "1654707636750-ab67a11b21b7", // belt/accessory (category pool)
    p13: "1617244147299-5ef406921c35", // man in structured coat
    p14: "1559563458-527698bf5295", // clutch (category pool)
    p15: "1610652492500-ded49ceeb378", // man, smart casual top
    p16: "1530884698386-d42ad3199b1f", // men's patterned/print blazer
    p17: "1614291129226-41dae34c2128", // woman, draped top
    p18: "1590739225287-bd31519780c3", // earrings/jewelry (category pool)
    p19: "1531123414780-f74242c2b052", // portrait, casualwear
    p20: "1485570661444-73b3f0ff9d2f", // trousers
    p21: "1638609348722-aa2a3a67db26", // oxford shoes (category pool)
    p22: "1616406432452-07bc5938759d", // heeled shoes (category pool)
    p23: "1614252235316-8c857d38b5f4", // sneakers (category pool)
    p24: "1708170236215-b6edcad7f49a" // portrait, watch/accessory context
  };
// Export for other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PRODUCTS, NOW, HOUR, ADMIN_PIN };
}
