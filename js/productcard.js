function renderProductCard(p) {
    const onSale = isOnSale(p);
    const price = effectivePrice(p);
    const wished = state.wishlist.includes(p.id);
    const img0 = imgUrl(p.imgIds[0], 700);
    const img1 = imgUrl(p.imgIds[1] || p.imgIds[0], 700);
    return `
    <article class="product-card" data-id="${p.id}">
      <div class="product-media img-shimmer" data-quickview="${p.id}">
        <img class="img-a" src="${img0}" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async">
        <img class="img-b" src="${img1}" alt="" loading="lazy" decoding="async" aria-hidden="true">
        ${p.badge ? `<span class="card-badge">${p.badge}</span>` : ""}
        ${onSale ? `<span class="card-badge sale">Sale ends <span class="countdown" data-ends="${p.sale.endsAt}">--:--:--</span></span>` : ""}
        <button class="wish-btn ${wished ? "active" : ""}" data-wish="${p.id}" aria-label="Toggle wishlist">
          <svg viewBox="0 0 24 24" fill="${wished ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.3l-1.1-1C5.1 14.6 2 11.8 2 8.4 2 5.6 4.2 3.5 7 3.5c1.6 0 3.1.8 4 2 .9-1.2 2.4-2 4-2 2.8 0 5 2.1 5 4.9 0 3.4-3.1 6.2-8.9 11l-1.1.9z"/></svg>
        </button>
        <div class="card-hover-actions">
          <button class="btn btn-tiny btn-block" data-quickview="${p.id}" type="button">Quick View</button>
        </div>
      </div>
      <div class="product-info">
        <h3 class="product-name">${escapeHtml(p.name)}</h3>
        <div class="product-rating">
          <span class="stars" style="--pct:${((p.rating / 5) * 100).toFixed(0)}%">★★★★★</span>
          <span class="rating-num">${p.rating.toFixed(1)} (${p.reviews})</span>
        </div>
        <div class="product-price-row">
          ${onSale ? `<span class="price-old">${formatNaira(p.price)}</span><span class="price-sale">${formatNaira(price)}</span>` : `<span class="price">${formatNaira(price)}</span>`}
        </div>
        <button class="btn btn-add" data-addcart="${p.id}" type="button">Add to Cart</button>
      </div>
    </article>`;
  }
  function renderGrid(elId, products) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.innerHTML = products.map(renderProductCard).join("");
    initImageLoaders(el);
  }
  function renderCuratedGrids() {
    renderGrid("grid-new", PRODUCTS.filter((p) => p.section === "new"));
    renderGrid("grid-trending", PRODUCTS.filter((p) => p.section === "trending"));
    renderGrid("grid-best", PRODUCTS.filter((p) => p.section === "best"));
    renderGrid("grid-flash", PRODUCTS.filter(isOnSale));
                                           }
