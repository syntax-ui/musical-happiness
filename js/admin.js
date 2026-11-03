  /* ---------------------------------------------------
     ADMIN DASHBOARD
  --------------------------------------------------- */
  const ADMIN_PIN = "7877";
  const STATUS_OPTIONS = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];
  function mapDbOrderToApp(row) {
    return {
      orderNumber: row.order_number, name: row.name, phone: row.phone, email: row.email || "",
      address: row.address, items: row.items, paymentMethod: row.payment_method,
      discount: row.discount || 0, total: row.total, status: row.status, createdAt: row.created_at
    };
  }
  async function refreshOrdersFromDb() {
    if (!db) return;
    try {
      const { data, error } = await db.from("orders").select("*").order("created_at", { ascending: false });
      if (error) { console.warn("Could not load orders from Supabase:", error); return; }
      state.orders = (data || []).map(mapDbOrderToApp);
    } catch (e) { console.warn("Order load threw:", e); }
  }
  async function renderAdminTable() {
    await refreshOrdersFromDb();
    const search = ($("#adminSearch").value || "").trim().toLowerCase();
    const statusFilter = $("#adminStatusFilter").value;
    let list = state.orders.filter((o) => {
      const matchesSearch = !search || o.name.toLowerCase().includes(search) || o.phone.toLowerCase().includes(search) || o.orderNumber.toLowerCase().includes(search);
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    $("#adminEmpty").hidden = list.length !== 0;
    $("#adminEmpty").textContent = state.orders.length === 0 ? "No orders yet. Orders placed on the storefront will appear here." : "No orders match your search or filter.";
    $("#adminTableBody").innerHTML = list.map((o) => `
      <tr data-order="${o.orderNumber}">
        <td>${escapeHtml(o.orderNumber)}</td>
        <td>${escapeHtml(o.name)}</td>
        <td>${escapeHtml(o.phone)}</td>
        <td>${formatNaira(o.total)}</td>
        <td>
          <select class="status-select" data-status-for="${o.orderNumber}">
            ${STATUS_OPTIONS.map((s) => `<option value="${s}" ${s === o.status ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </td>
        <td>${new Date(o.createdAt).toLocaleString()}</td>
        <td><button class="admin-icon-btn" data-view="${o.orderNumber}" aria-label="View">👁</button><button class="admin-icon-btn" data-delete="${o.orderNumber}" aria-label="Delete">🗑</button></td>
      </tr>`).join("");
  }
  function adminThumbHtml(p) {
    const url = imgUrl(p.image_id, 100);
    return url
      ? `<img class="admin-photo-thumb" src="${url}" alt="">`
      : `<div class="admin-photo-thumb empty">No photo</div>`;
  }
  const PRODUCT_TYPES = ["top", "bottom", "outerwear", "dress", "shoes", "bag", "accessory"];
  const PRODUCT_GENDERS = ["men", "women", "unisex"];
  const PRODUCT_SECTIONS = ["flash", "new", "trending", "best"];
  function selectHtml(field, id, current, options, label) {
    return `<select class="product-edit-input" data-field="${field}" data-id="${id}" aria-label="${label}">${options.map((o) => `<option value="${o}" ${o === current ? "selected" : ""}>${o}</option>`).join("")}</select>`;
  }
  async function renderAdminProductsTable() {
    const body = $("#adminProductsBody");
    const empty = $("#adminProductsEmpty");
    if (!db) { empty.hidden = false; body.innerHTML = ""; return; }
    try {
      const { data, error } = await db.from("products").select("*").order("name");
      if (error) { empty.hidden = false; empty.textContent = "Couldn't load products. Check your connection and try again."; return; }
      empty.hidden = true;
      body.innerHTML = (data || []).map((p) => `
        <tr data-product="${p.id}">
          <td>
            <div class="admin-photo-cell">
              ${adminThumbHtml(p)}
              <label class="btn btn-ghost-tiny admin-photo-upload-label">Change<input type="file" accept="image/*" data-photo-for="${p.id}"></label>
            </div>
          </td>
          <td><input class="product-edit-input product-name-input" type="text" value="${escapeHtml(p.name)}" data-field="name" data-id="${p.id}" aria-label="Name"></td>
          <td>${selectHtml("type", p.id, p.type, PRODUCT_TYPES, "Category")}</td>
          <td>${selectHtml("gender", p.id, p.gender, PRODUCT_GENDERS, "Gender")}</td>
          <td>${selectHtml("section", p.id, p.section, PRODUCT_SECTIONS, "Section")}</td>
          <td><input class="product-edit-input" type="number" min="0" step="500" value="${p.price}" data-field="price" data-id="${p.id}" aria-label="Price for ${escapeHtml(p.name)}"></td>
          <td><input class="product-edit-input" type="number" min="0" step="1" value="${p.stock_count}" data-field="stock_count" data-id="${p.id}" aria-label="Stock for ${escapeHtml(p.name)}"></td>
          <td><input class="product-active-toggle" type="checkbox" ${p.active ? "checked" : ""} data-field="active" data-id="${p.id}" aria-label="Visible on store: ${escapeHtml(p.name)}"></td>
          <td><button class="admin-icon-btn" data-remove-product="${p.id}" aria-label="Remove ${escapeHtml(p.name)}">🗑</button></td>
        </tr>`).join("");
    } catch (e) {
      empty.hidden = false;
      empty.textContent = "Couldn't load products. Check your connection and try again.";
    }
  }
  async function addNewProduct() {
    if (!db) return;
    const id = "p-" + Date.now();
    const { error } = await db.from("products").insert({
      id, name: "New Product", type: "top", gender: "unisex", section: "new",
      price: 0, stock_count: 0, active: false, description: "", rating: 4.8, reviews: 0
    });
    if (error) { showToast("Couldn't create new product — try again."); console.warn(error); return; }
    showToast("New product added below — fill in its details.");
    await renderAdminProductsTable();
    const nameInput = $(`tr[data-product="${id}"] .product-name-input`);
    if (nameInput) { nameInput.focus(); nameInput.select(); }
  }
  async function uploadProductPhoto(productId, file) {
    if (!db) return;
    if (file.size > 5 * 1024 * 1024) { showToast("That photo is over 5MB — try a smaller one."); return; }
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${productId}-${Date.now()}.${ext}`;
    showToast("Uploading photo…");
    try {
      const { error: uploadError } = await db.storage.from("product-images").upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) { showToast("Upload failed — check the product-images storage bucket is set up."); console.warn(uploadError); return; }
      const { data: urlData } = db.storage.from("product-images").getPublicUrl(path);
      const publicUrl = urlData && urlData.publicUrl;
      if (!publicUrl) { showToast("Upload succeeded but couldn't get the photo's link."); return; }
      const { error: updateError } = await db.from("products").update({ image_id: publicUrl }).eq("id", productId);
      if (updateError) { showToast("Photo uploaded but couldn't save it to the product — try again."); console.warn(updateError); return; }
      showToast("Photo updated.");
      renderAdminProductsTable();
    } catch (e) {
      showToast("Something went wrong uploading that photo.");
      console.warn(e);
    }
  }
  function wireAdminProductEdits() {
    const NUMERIC_FIELDS = ["price", "stock_count"];
    $("#adminProductsBody").addEventListener("change", async (e) => {
      const fileInput = e.target.closest("[data-photo-for]");
      if (fileInput) {
        const file = fileInput.files && fileInput.files[0];
        if (file) uploadProductPhoto(fileInput.dataset.photoFor, file);
        return;
      }
      const el = e.target.closest("[data-field]");
      if (!el || !db) return;
      const id = el.dataset.id;
      const field = el.dataset.field;
      let value;
      if (field === "active") value = el.checked;
      else if (NUMERIC_FIELDS.indexOf(field) !== -1) {
        value = Number(el.value);
        if (isNaN(value) || value < 0) return;
      } else {
        value = el.value.trim();
        if (field === "name" && !value) { showToast("Name can't be empty."); renderAdminProductsTable(); return; }
      }
      const { error } = await db.from("products").update({ [field]: value }).eq("id", id);
      if (error) {
        console.warn("Could not save product change:", error);
        showToast("Couldn't save that change — try again.");
      } else if (el.classList) {
        el.classList.add("saved");
        setTimeout(() => el.classList.remove("saved"), 1200);
      }
    });
    $("#adminProductsBody").addEventListener("click", async (e) => {
      const removeBtn = e.target.closest("[data-remove-product]");
      if (!removeBtn || !db) return;
      const id = removeBtn.dataset.removeProduct;
      const row = removeBtn.closest("tr");
      const name = row ? row.querySelector(".product-name-input").value : "this product";
      if (!window.confirm(`Remove "${name}" from your catalog? This can't be undone.`)) return;
      const { error } = await db.from("products").delete().eq("id", id);
      if (error) { showToast("Couldn't remove that product — try again."); console.warn(error); return; }
      showToast("Product removed.");
      renderAdminProductsTable();
    });
    $("#adminAddProduct").addEventListener("click", addNewProduct);
  }
  async function loadChatbotTraining() {
    const el = $("#chatbotTrainingInput");
    const statusEl = $("#chatbotTrainingStatus");
    if (!db) { statusEl.textContent = "Supabase isn't connected."; return; }
    statusEl.textContent = "Loading…";
    try {
      const { data, error } = await db.from("chatbot_settings").select("business_info").eq("id", 1).single();
      if (error) { statusEl.textContent = "Couldn't load — has the chatbot_settings table been created?"; return; }
      el.value = (data && data.business_info) || "";
      statusEl.textContent = "";
    } catch (e) {
      statusEl.textContent = "Couldn't load saved info.";
    }
  }
  async function saveChatbotTraining() {
    const el = $("#chatbotTrainingInput");
    const statusEl = $("#chatbotTrainingStatus");
    const btn = $("#chatbotTrainingSave");
    if (!db) { statusEl.textContent = "Supabase isn't connected."; return; }
    btn.disabled = true;
    btn.textContent = "Saving…";
    try {
      const { error } = await db.from("chatbot_settings").update({ business_info: el.value, updated_at: new Date().toISOString() }).eq("id", 1);
      btn.disabled = false;
      btn.textContent = "Save & Train Chatbot";
      statusEl.textContent = error ? "Couldn't save — try again." : "Saved. The chatbot will use this from now on.";
      if (!error) setTimeout(() => { statusEl.textContent = ""; }, 4000);
    } catch (e) {
      btn.disabled = false;
      btn.textContent = "Save & Train Chatbot";
      statusEl.textContent = "Couldn't save — check your connection.";
    }
  }
  function findOrder(orderNumber) {
    return state.orders.find((o) => o.orderNumber === orderNumber);
  }
  function openAdminDetail(orderNumber) {
    const o = findOrder(orderNumber);
    if (!o) return;
    $("#adminDetailContent").innerHTML = `
      <h3>${escapeHtml(o.orderNumber)}</h3>
      <p><strong>${escapeHtml(o.name)}</strong> · ${escapeHtml(o.phone)} ${o.email ? "· " + escapeHtml(o.email) : ""}</p>
      <p>${escapeHtml(o.address)}</p>
      <p>Payment: ${escapeHtml(o.paymentMethod)} · Status: ${escapeHtml(o.status)}</p>
      <p>Placed: ${new Date(o.createdAt).toLocaleString()}</p>
      <div class="admin-items">${o.items.map((it) => `<div class="checkout-line"><span>${it.name} × ${it.qty}</span><span>${formatNaira(it.price * it.qty)}</span></div>`).join("")}</div>
      ${o.discount ? `<div class="checkout-line"><span>Discount</span><span>-${formatNaira(o.discount)}</span></div>` : ""}
      <div class="checkout-line total"><span>Total</span><span>${formatNaira(o.total)}</span></div>`;
    $("#adminDetailOverlay").classList.add("show");
    $("#adminDetail").classList.add("open");
    if (adminDetailTrap) adminDetailTrap.activate();
  }
  function closeAdminDetail() {
    $("#adminDetailOverlay").classList.remove("show");
    $("#adminDetail").classList.remove("open");
    if (adminDetailTrap) adminDetailTrap.deactivate();
  }
  function wireAdmin() {
    adminDetailTrap = createFocusTrap($("#adminDetail"));
    const adminConfirmTrap = createFocusTrap($("#adminConfirmDelete"));
    const adminTabs = [
      { tab: "adminTabOrders", panel: "adminOrdersPanel", onShow: null },
      { tab: "adminTabProducts", panel: "adminProductsPanel", onShow: renderAdminProductsTable },
      { tab: "adminTabChatbot", panel: "adminChatbotPanel", onShow: loadChatbotTraining }
    ];
    adminTabs.forEach(({ tab, panel, onShow }) => {
      $("#" + tab).addEventListener("click", () => {
        adminTabs.forEach(({ tab: t, panel: p }) => {
          const isActive = t === tab;
          $("#" + t).classList.toggle("active", isActive);
          $("#" + t).setAttribute("aria-selected", String(isActive));
          $("#" + p).hidden = !isActive;
        });
        if (onShow) onShow();
      });
    });
    wireAdminProductEdits();
    $("#chatbotTrainingSave").addEventListener("click", saveChatbotTraining);
    $("#adminPinSubmit").addEventListener("click", async () => {
      const errorEl = $("#adminPinError");
      const submitBtn = $("#adminPinSubmit");
      if (db) {
        const email = $("#adminEmailInput").value.trim();
        const password = $("#adminPinInput").value;
        if (!email || !password) { errorEl.textContent = "Enter your email and password."; return; }
        submitBtn.disabled = true;
        submitBtn.textContent = "Signing in…";
        try {
          const { error } = await db.auth.signInWithPassword({ email, password });
          submitBtn.disabled = false;
          submitBtn.textContent = "Sign In";
          if (error) { errorEl.textContent = "Incorrect email or password."; return; }
          state.adminUnlocked = true;
          errorEl.textContent = "";
          document.getElementById('adminDashboard').classList.add('admin-authenticated');
          showAdminDashboard();
        } catch (e) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Sign In";
          errorEl.textContent = "Couldn't reach the server. Please check your connection.";
        }
      } else {
        // Supabase not configured yet — temporary fallback so admin access
        // still works before setup is finished.
        if ($("#adminPinInput").value === ADMIN_PIN) {
          state.adminUnlocked = true;
          errorEl.textContent = "";
          document.getElementById('adminDashboard').classList.add('admin-authenticated');
          showAdminDashboard();
        } else {
          errorEl.textContent = "Incorrect PIN. (Set up Supabase for real email/password login.)";
        }
      }
    });
    $("#adminPinInput").addEventListener("keydown", (e) => { if (e.key === "Enter") $("#adminPinSubmit").click(); });
    $("#adminSearch").addEventListener("input", debounce(renderAdminTable, 150));
    $("#adminStatusFilter").addEventListener("change", renderAdminTable);
    $("#adminTableBody").addEventListener("click", (e) => {
      const view = e.target.closest("[data-view]");
      const del = e.target.closest("[data-delete]");
      if (view) openAdminDetail(view.dataset.view);
      if (del) { pendingDelete = del.dataset.delete; $("#adminConfirmOverlay").classList.add("show"); $("#adminConfirmDelete").classList.add("open"); adminConfirmTrap.activate(); }
    });
    $("#adminTableBody").addEventListener("change", async (e) => {
      const sel = e.target.closest("[data-status-for]");
      if (sel) {
        const o = findOrder(sel.dataset.statusFor);
        if (o) o.status = sel.value;
        if (db) {
          const { error } = await db.from("orders").update({ status: sel.value }).eq("order_number", sel.dataset.statusFor);
          if (error) console.warn("Could not save status to Supabase:", error);
        }
      }
    });
    let pendingDelete = null;
    $("#adminConfirmYes").addEventListener("click", async () => {
      if (db) {
        const { error } = await db.from("orders").delete().eq("order_number", pendingDelete);
        if (error) console.warn("Could not delete order in Supabase:", error);
      }
      state.orders = state.orders.filter((o) => o.orderNumber !== pendingDelete);
      $("#adminConfirmOverlay").classList.remove("show");
      $("#adminConfirmDelete").classList.remove("open");
      adminConfirmTrap.deactivate();
      closeAdminDetail();
      renderAdminTable();
    });
    $("#adminConfirmNo").addEventListener("click", () => {
      $("#adminConfirmOverlay").classList.remove("show");
      $("#adminConfirmDelete").classList.remove("open");
      adminConfirmTrap.deactivate();
    });
    $("#adminDetailClose").addEventListener("click", closeAdminDetail);
    $("#adminDetailOverlay").addEventListener("click", closeAdminDetail);
  }
  function showAdminGate() {
    $("#adminGate").hidden = false;
    $("#adminDashboard").hidden = true;
  }
  function showAdminDashboard() {
    $("#adminGate").hidden = true;
    $("#adminDashboard").hidden = false;
    renderAdminTable();
  }
  function checkRoute() {
    const onAdmin = location.hash === "#admin";
    document.body.classList.toggle("admin-mode", onAdmin);
    $("#adminRoot").hidden = !onAdmin;
    if (onAdmin) {
      ["welcomeOverlay", "exitOverlay", "checkoutOverlay", "confirmOverlay", "searchOverlay", "quickViewOverlay", "scrim"].forEach((id) => { const el = document.getElementById(id); if (el) { el.classList.remove("show"); el.classList.remove("open"); } });
      ["welcomeModal", "exitModal", "checkoutModal", "confirmModal", "quickViewModal", "cartDrawer", "mobileNav"].forEach((id) => { const el = document.getElementById(id); if (el) el.classList.remove("open"); });
      if ($("#chatPanel")) { $("#chatPanel").hidden = true; $("#chatToggle").setAttribute("aria-expanded", "false"); }
      window.scrollTo(0, 0);
      if (state.adminUnlocked) { showAdminDashboard(); return; }
      if (db) {
        db.auth.getSession().then(({ data }) => {
          if (data && data.session) { state.adminUnlocked = true; showAdminDashboard(); }
          else showAdminGate();
        });
      } else {
        showAdminGate();
      }
    }
                    }
