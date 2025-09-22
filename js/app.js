const normalisePrice = value => Number(String(value || 0).replace(/[^0-9.]/g, "")) || 0;
const loadCart = () => {
  try {
    const stored = localStorage.getItem("cart");
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Failed to parse cart from storage", err);
    return [];
  }
};
const saveCart = items => {
  localStorage.setItem("cart", JSON.stringify(items));
};

/* =============================
   SHOP: Product Selection + Cart
   ============================= */
(function initShop(){
  const sizeButtons = document.querySelectorAll(".size-option");
  const addToCartButtons = document.querySelectorAll(".add-to-cart");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const productCards = document.querySelectorAll(".product-grid .product");

  const applyFilter = (filterValue = "all") => {
    const target = (filterValue || "all").toLowerCase();
    productCards.forEach(card => {
      const categories = (card.dataset.category || "")
        .split(",")
        .map(cat => cat.trim().toLowerCase())
        .filter(Boolean);
      const match = target === "all" || categories.includes(target);
      card.style.display = match ? "" : "none";
    });
  };

  if (filterButtons.length) {
    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        applyFilter(btn.dataset.filter);
      });
    });
    const activeButton = Array.from(filterButtons).find(btn => btn.classList.contains("active")) || filterButtons[0];
    applyFilter(activeButton?.dataset.filter);
  }

  // Size selection highlight
  sizeButtons.forEach(btn=>{
    btn.addEventListener("click", ()=>{
      btn.parentElement.querySelectorAll(".size-option")
        .forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // Add to Cart
  addToCartButtons.forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const productEl = btn.closest(".product");
      if(!productEl) return;

      const productName = productEl.dataset.name || "Unknown item";
      const productPrice = normalisePrice(productEl.dataset.price);
      const cart = loadCart();

      cart.push({ name: productName, price: productPrice });
      saveCart(cart);
      alert(`${productName} added to cart!`);
    });
  });
})();

/* =============================
   BADGES: Auto-generate
   ============================= */
(function initBadges(){
  document.querySelectorAll(".product").forEach(p=>{
    const status = p.dataset.status;
    const badgeClass = p.dataset.badgeClass;
    if(status && badgeClass){
      const badge = document.createElement("span");
      badge.className = `badge ${badgeClass}`;
      badge.textContent = status.toUpperCase();
      p.querySelector(".product-img-wrap")?.appendChild(badge);
    }
  });
})();

/* =============================
   CART PAGE
   ============================= */
(function initCartPage(){
  const cartList = document.querySelector(".cart-list");
  const totalEl = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkout-whatsapp");

  if(!cartList) return;

  let cart = loadCart();

  function formatCurrency(value) {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function renderCart(){
    cartList.innerHTML = "";
    let total = 0;

    if(cart.length === 0){
      cartList.innerHTML = '<p class="empty">Your cart is empty.</p>';
    }

    cart.forEach((item, idx)=>{
      const itemPrice = normalisePrice(item.price);
      total += itemPrice;
      const li = document.createElement("div");
      li.className = "cart-item";
      li.innerHTML = `
        <p><strong>${item.name}</strong></p>
        <p>NGN ${formatCurrency(itemPrice)}</p>
        <button class="remove-btn" data-idx="${idx}">Remove</button>
      `;
      cartList.appendChild(li);
    });
    totalEl.textContent = `Total: NGN ${formatCurrency(total)}`;
  }

  renderCart();

  // Remove item
  cartList.addEventListener("click", e=>{
    if(e.target.classList.contains("remove-btn")){
      const idx = parseInt(e.target.dataset.idx, 10);
      cart.splice(idx,1);
      saveCart(cart);
      renderCart();
    }
  });

  // Checkout via WhatsApp
  checkoutBtn?.addEventListener("click", ()=>{
    if(cart.length===0){ alert("Cart is empty!"); return; }
    let msg = "Hello, I'd like to order:\n";
    cart.forEach(item=>{
      const itemPrice = normalisePrice(item.price);
      msg += `- ${item.name} - NGN ${itemPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
    });
    const total = cart.reduce((sum,i)=>sum+normalisePrice(i.price),0);
    msg += `\nTotal: NGN ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const phone = "+2348122781860"; // <-- your WhatsApp number here
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.location.href = url;
  });
})();

/* =============================
   CONTACT PAGE WhatsApp Button
   ============================= */
(function initContactPage(){
  const btn = document.getElementById("whatsapp-btn");
  if(!btn) return;
  btn.addEventListener("click", ()=>{
    const phone = "+2348122781860"; // <-- your WhatsApp number here
    const url = `https://wa.me/${phone}?text=Hi, I'll like to buy these products!`;
    window.location.href = url;
  });
})();


