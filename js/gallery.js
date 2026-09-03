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

const filterDescriptions = {
  all: "Tap any piece to view details, photos, and pricing. You can order any of these pieces as is, customize, or work with me to commission a new piece.",
  card: "Original handmade cards for birthdays, celebrations, and everyday moments. Each one is designed with a little extra personality and can be customized for your occasion.",
  "felt": "Hand-stitched felt pieces and banners made with layered color, texture, and small details. Many can be customized or adapted into a one-of-a-kind commission."
};

const filterTitles = {
  all: "All Available Works",
  card: "Cards",
  "felt-piece": "Felt Pieces"
};


function setGalleryTitle(filter) {
  const title = document.querySelector(".hero h1");
  if (!title) return;

  title.textContent = filterTitles[filter] || filterTitles.all;
}

function setGallerySubtitle(filter) {
  const subtitle = document.getElementById("gallery-subtitle");
  if (!subtitle) return;

  subtitle.textContent = filterDescriptions[filter] || filterDescriptions.all;
}

function createImageElement(src, alt) {
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  img.loading = "lazy";

  img.addEventListener("error", () => {
    const placeholder = document.createElement("div");
    placeholder.className = "image-placeholder";
    placeholder.textContent = "Add image";
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

  return [...feltData.artworks, ...cardsData.artworks, ...printData.artworks, ...paperData.artworks, ...commissionData.artworks].filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);
}

function renderGallery(artworks) {
  const grid = document.getElementById("gallery-grid");
  grid.innerHTML = "";

  if (artworks.length === 0) {
    grid.innerHTML = '<p class="loading">No artwork listed yet. Add pieces in json</p>';
    return;
  }
  artworks.forEach((artwork) => {
    const card = document.createElement("article");
    card.className = "art-card";

    const link = document.createElement("a");
    link.className = "art-card-link";
    link.href = `piece.html?id=${encodeURIComponent(artwork.id)}`;

    const imageWrap = document.createElement("div");
    imageWrap.className = "art-card-image";
    imageWrap.appendChild(createImageElement(artwork.thumbnail, artwork.title));

    const body = document.createElement("div");
    body.className = "art-card-body";
    body.innerHTML = `
      <div class="art-card-meta">
        <span class="art-card-tag">${getCategoryLabel(artwork.category)}</span>
      </div>
      <h2 class="art-card-title">${artwork.title}</h2>
      <p class="art-card-price">${formatPrice(artwork)}</p>
    `;

    link.appendChild(imageWrap);
    link.appendChild(body);

    const actions = document.createElement("div");
    actions.className = "art-card-actions";

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "secondary-button";
    addButton.textContent = "Add to cart";
    addButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      addToCart(artwork.id, 1);
      addButton.textContent = "Added";
      window.setTimeout(() => {
        addButton.textContent = "Add to cart";
      }, 1200);
    });

    actions.appendChild(addButton);
    card.appendChild(link);
    card.appendChild(actions);
    grid.appendChild(card);
  });
}
function wireSubcategoryButtons(allArtworks) {
  const buttons = document.querySelectorAll(".card-filter-button");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      buttons.forEach((item) => item.classList.toggle("active", item === button));

      if (filter === "all") {
        const cards = allArtworks.filter((artwork) => artwork.category === "cards");
        renderGallery(cards);
        return;
      }
      const filteredArtworks = allArtworks.filter((artwork) => artwork.subcategory === filter);
      renderGallery(filteredArtworks);
    });
  }
  )
}
function toggleSubcategoryToolbar(filter) {
  if (filter === "cards") {
    document.querySelector(".subcategory-toolbar").style.visibility = "visible";
  } else {
    document.querySelector(".subcategory-toolbar").style.visibility = "hidden";

  }
}
function wireFilterButtons(allArtworks) {
  const buttons = document.querySelectorAll(".filter-button");
  const grid = document.getElementById("gallery-grid");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      const url = new URL(window.location.href);
      url.searchParams.set('filter', filter);
      window.history.pushState({}, '', url);
      buttons.forEach((item) => item.classList.toggle("active", item === button));
      setGalleryTitle(filter);
      setGallerySubtitle(filter);

      if (filter === "all") {
        renderGallery(allArtworks);
        return;
      }
      toggleSubcategoryToolbar(filter);


      const filteredArtworks = allArtworks.filter((artwork) => artwork.category === filter);
      renderGallery(filteredArtworks);

      if (filteredArtworks.length === 0) {
        grid.innerHTML = `<p class="loading">No ${getCategoryLabel(filter).toLowerCase()} pieces available right now.</p>`;
      }
    });
  });
}

async function initGallery() {
  const grid = document.getElementById("gallery-grid");

  try {
    const artworks = await loadArtworks();

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const filter = urlParams.get('filter');

    if (filter) {
      const filteredArtworks = artworks.filter((artwork) => artwork.category === filter);
      toggleSubcategoryToolbar(filter);

      setGalleryTitle(filter);
      setGallerySubtitle("filter");
      renderGallery(filteredArtworks);
      const buttons = document.querySelectorAll(".filter-button");
      buttons.forEach((item) => item.dataset.filter === filter ? item.classList.add("active") : item.classList.remove("active"))
    } else {
      setGalleryTitle("all");
      setGallerySubtitle("all");
      renderGallery(artworks);
    }
    wireFilterButtons(artworks);
    wireSubcategoryButtons(artworks);
  } catch (error) {
    grid.innerHTML = `<p class="error-message">${error.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", initGallery);
