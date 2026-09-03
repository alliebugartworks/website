function getArtworkId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function formatPrice(artwork) {
  if (artwork.priceDisplay) return artwork.priceDisplay;
  if (typeof artwork.price === "number") {
    return `$${artwork.price.toLocaleString()}`;
  }
  return "";
}

function getCategoryLabel(category) {
  if (category === "felt") return "Felt";
  if (category === "card") return "Card";
  return "Artwork";
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount || 0));
}

function getAddonSummary(addons) {
  const selected = [];
  if (addons?.name) selected.push("Name");
  if (addons?.ribbon) selected.push("Ribbon");
  if (addons?.stars) selected.push("Stars");
  if (addons?.hearts) selected.push("Hearts");
  if (addons?.other) selected.push("Other");
  return selected.join(", ");
}

function createImageElement(src, alt) {
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;

  img.addEventListener("error", () => {
    const placeholder = document.createElement("div");
    placeholder.className = "image-placeholder";
    placeholder.textContent = "Add image to images folder";
    img.replaceWith(placeholder);
  });

  return img;
}
async function loadArtworks() {
  const cardsResponse = await fetch("data/cards.json");
  const feltResponse = await fetch("data/felt.json");
  const printResponse = await fetch("data/prints.json");
  const paperResponse = await fetch("data/paper.json");
  const commissionResponse = await fetch("data/commissions.json");

  if (!cardsResponse.ok && !feltResponse.ok && !printResponse.ok && !paperResponse.ok && !commissionResponse.ok) {
    throw new Error("Could not load artworks.");
  }

  const cardsData = await cardsResponse.json();
  const feltData = await feltResponse.json();
  const printData = await printResponse.json();
  const paperData = await paperResponse.json();
  const commissionData = await commissionResponse.json();

  return [...cardsData.artworks, ...feltData.artworks, ...printData.artworks, ...paperData.artworks, ...commissionData.artworks].filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);
}

function renderPiece(artwork, siteConfig) {
  const container = document.getElementById("piece-content");
  const images = artwork.images?.length ? artwork.images : [artwork.thumbnail];
  const basePrice = Number(artwork.price) || 0;
  const supportedIds = new Set(["casey-name", "name-banner", "custom-commission"]);
  const isCustomOptionsProduct = supportedIds.has(String(artwork.id));
  const isCustomCommission = String(artwork.id) === "custom-commission";

  document.title = `${artwork.title} — ${siteConfig?.siteTitle || "Allie Bug Studio"}`;

  container.innerHTML = `
    <div class="piece-layout">
      <div class="piece-gallery">
        <div class="piece-main-image" id="piece-main-image"></div>
        <div class="piece-thumbnails" id="piece-thumbnails"></div>
      </div>
      <div class="piece-info">
        <p class="piece-category">${getCategoryLabel(artwork.category)}</p>
        <p class="timetoship-category">Ships in ${artwork.timetoship}!</p>
        <h1>${artwork.title}</h1>
        <p class="piece-price" data-base-price="${basePrice}">${formatPrice(artwork)}</p>
        <p class="piece-description">${artwork.description}</p>
        <div class="order-box">
          <h2>Place an order</h2>
          <p>Customize your piece and add it to your cart to start the order process.</p>
          ${isCustomOptionsProduct ? `
            <div class="addon-selector">
              ${isCustomCommission ? `
                <label class="checkbox-row">
                  <input type="checkbox" data-addon="name" aria-label="Include a name in the commission">
                  <span>Name</span>
                </label>
              ` : ""}
              <label class="checkbox-row">
                <input type="checkbox" data-addon="ribbon" aria-label="Add ribbon for $5">
                <span>Ribbon ${isCustomCommission ? "" : "(+$5)"}</span>
              </label>
              <label class="checkbox-row">
                <input type="checkbox" data-addon="stars" aria-label="Add stars for $10">
                <span>Stars ${isCustomCommission ? "" : "(+$10)"}</span>
              </label>
              <label class="checkbox-row">
                <input type="checkbox" data-addon="hearts" aria-label="Include hearts in the commission">
                <span>Hearts</span>
              </label>
              <label class="checkbox-row">
                <input type="checkbox" data-addon="other" aria-label="Include other details in the commission">
                <span>Other</span>
              </label>
            </div>
          ` : ""}
          <label class="customization-field" for="customization-input">
            <span>${isCustomCommission ? "What are you looking for?" : "Customization details"}</span>
            ${isCustomCommission ? `
              <textarea
                id="customization-input"
                rows="4"
                maxlength="250"
                placeholder="Describe the piece you want, colors you love, names, dates, size, or any details you want included. We will work together to create a custom piece just for you!"
              ></textarea>
            ` : `
              <input
                id="customization-input"
                type="text"
                maxlength="120"
                value=""
                placeholder="Add a name, date, or note"
              >
            `}
          </label>
          <button type="button" class="primary-button" id="add-to-cart" data-artwork-id="${artwork.id}">Add to cart</button>
        </div>
      </div>
    </div>
  `;

  const addToCartButton = document.getElementById("add-to-cart");
  const customizationInput = document.getElementById("customization-input");
  const priceLabel = document.querySelector(".piece-price");
  const addonInputs = Array.from(document.querySelectorAll("[data-addon]"));

  function updateDisplayedPrice() {
    if (!priceLabel) return;

    const selectedAddons = {
      name: document.querySelector('[data-addon="name"]')?.checked || false,
      ribbon: document.querySelector('[data-addon="ribbon"]')?.checked || false,
      stars: document.querySelector('[data-addon="stars"]')?.checked || false,
      hearts: document.querySelector('[data-addon="hearts"]')?.checked || false,
      other: document.querySelector('[data-addon="other"]')?.checked || false,
    };
    const addonTotal = (selectedAddons.ribbon ? 5 : 0) + (selectedAddons.stars ? 10 : 0);
    const total = basePrice + addonTotal;
    priceLabel.textContent = formatMoney(total);
  }

  addonInputs.forEach((input) => input.addEventListener("change", updateDisplayedPrice));
  updateDisplayedPrice();

  if (addToCartButton) {
    addToCartButton.addEventListener("click", () => {
      const customization = customizationInput ? customizationInput.value : "";
      const selectedAddons = {
        name: document.querySelector('[data-addon="name"]')?.checked || false,
        ribbon: document.querySelector('[data-addon="ribbon"]')?.checked || false,
        stars: document.querySelector('[data-addon="stars"]')?.checked || false,
        hearts: document.querySelector('[data-addon="hearts"]')?.checked || false,
        other: document.querySelector('[data-addon="other"]')?.checked || false,
      };
      addToCart(artwork.id, 1, customization, selectedAddons);
      addToCartButton.textContent = "Added to cart";
      addToCartButton.disabled = true;
      if (customizationInput) customizationInput.value = "";
    });
  }

  const mainImage = document.getElementById("piece-main-image");
  const thumbnails = document.getElementById("piece-thumbnails");

  function setMainImage(src, index) {
    mainImage.innerHTML = "";
    mainImage.appendChild(createImageElement(src, `${artwork.title} — photo ${index + 1}`));

    thumbnails.querySelectorAll(".piece-thumb").forEach((thumb, i) => {
      thumb.classList.toggle("active", i === index);
    });
  }

  images.forEach((src, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `piece-thumb${index === 0 ? " active" : ""}`;
    button.setAttribute("aria-label", `View photo ${index + 1}`);
    button.appendChild(createImageElement(src, `${artwork.title} thumbnail ${index + 1}`));
    button.addEventListener("click", () => setMainImage(src, index));
    thumbnails.appendChild(button);
  });

  setMainImage(images[0], 0);
}

async function initPiece() {
  const container = document.getElementById("piece-content");
  const id = getArtworkId();

  if (!id) {
    container.innerHTML = '<p class="error-message">No artwork selected. <a href="index.html">Return to gallery</a></p>';
    return;
  }

  try {
    const [artworks, siteResponse] = await Promise.all([
      loadArtworks(),
      fetch("data/site.json"),
    ]);

    const siteConfig = siteResponse.ok ? await siteResponse.json() : null;
    const artwork = artworks.find((item) => item.id === id);

    if (!artwork) {
      container.innerHTML = '<p class="error-message">Artwork not found. <a href="index.html">Return to gallery</a></p>';
      return;
    }

    renderPiece(artwork, siteConfig);
  } catch (error) {
    container.innerHTML = `<p class="error-message">${error.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", initPiece);
