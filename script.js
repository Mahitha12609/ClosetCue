document.addEventListener('DOMContentLoaded', () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  let userId = null;

  // All clothing layers arrays
  let shirts = [];
  let pants = [];
  let jackets = [];
  let innerwear = [];
  let accessories = [];

  let savedLooks = [];
  let savedEvents = [];
  let showOnlyClean = false;
  let calendar = null;

  // Inputs
  const shirtInput = document.getElementById('shirtInput');
  const pantInput = document.getElementById('pantInput');
  const jacketInput = document.getElementById('jacketInput');
  const innerwearInput = document.getElementById('innerwearInput');
  const accessoryInput = document.getElementById('accessoryInput');

  // Containers
  const shirtList = document.getElementById('shirtList');
  const pantList = document.getElementById('pantList');
  const jacketList = document.getElementById('jacketList');
  const innerwearList = document.getElementById('innerwearList');
  const accessoryList = document.getElementById('accessoryList');
  const outfitGrid = document.getElementById('outfitGrid');
  const savedLooksGrid = document.getElementById('savedLooksGrid');
  const searchInput = document.getElementById('searchInput');
  const toggleBtn = document.getElementById('toggleClean');

  // Dummy upload function (no real file upload, returns placeholder URL)
  async function uploadImage(_file, type) {
    const nameMap = {
      shirts: "Shirt",
      pants: "Pant",
      jackets: "Jacket",
      innerwear: "Innerwear",
      accessories: "Accessory"
    };
    return `https://via.placeholder.com/100x100?text=${nameMap[type] || "Item"}`;
  }

  // Save all wardrobe data to Firestore
  function saveWardrobe() {
    if (!userId) return;
    db.collection('users').doc(userId).set({
      shirts,
      pants,
      jackets,
      innerwear,
      accessories,
      savedLooks,
      events: savedEvents
    });
  }

  // Generic display function for any layer with Include and Clean checkboxes
  function displayLayerImages(layerArray, containerElement) {
    containerElement.innerHTML = '';
    layerArray.forEach((item, i) => {
      // Initialize isIncluded if missing
      if (item.isIncluded === undefined) item.isIncluded = true;

      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = `
        <img src="${item.url}" width="100" />
        <label><input type="checkbox" class="include-checkbox" ${item.isIncluded ? 'checked' : ''}/> Include</label>
        <label><input type="checkbox" class="clean-checkbox" ${item.isClean ? 'checked' : ''}/> Clean</label>
        <button class="remove-btn">🗑</button>
      `;

      // Include checkbox toggle
      div.querySelector('.include-checkbox').onchange = e => {
        item.isIncluded = e.target.checked;
        saveWardrobe();
        createOutfits();
      };

      // Clean checkbox toggle
      div.querySelector('.clean-checkbox').onchange = e => {
        item.isClean = e.target.checked;
        saveWardrobe();
        createOutfits();
      };

      // Remove button
      div.querySelector('.remove-btn').onclick = () => {
        layerArray.splice(i, 1);
        saveWardrobe();
        displayAllLayers();
        createOutfits();
      };

      containerElement.appendChild(div);
    });
  }

  // Display all layers
  function displayAllLayers() {
    displayLayerImages(shirts, shirtList);
    displayLayerImages(pants, pantList);
    displayLayerImages(jackets, jacketList);
    displayLayerImages(innerwear, innerwearList);
    displayLayerImages(accessories, accessoryList);
  }

  // Recursive function to generate all combos of layers
  function combineLayers(layers, index = 0, currentCombo = [], combos = []) {
    if (index === layers.length) {
      combos.push([...currentCombo]);
      return combos;
    }
    layers[index].forEach(item => {
      currentCombo.push(item);
      combineLayers(layers, index + 1, currentCombo, combos);
      currentCombo.pop();
    });
    return combos;
  }

  // Get selected layers filtered by global layer checkboxes and item inclusion
  function getSelectedLayers() {
    const selectedLayers = [];
    document.querySelectorAll('#layerSelectors input[type=checkbox]').forEach(checkbox => {
      if (checkbox.checked) {
        let layerArray;
        switch (checkbox.dataset.layer) {
          case 'shirts': layerArray = shirts; break;
          case 'pants': layerArray = pants; break;
          case 'jackets': layerArray = jackets; break;
          case 'innerwear': layerArray = innerwear; break;
          case 'accessories': layerArray = accessories; break;
        }
        if (layerArray) {
          const includedItems = layerArray.filter(item => item.isIncluded);
          if (includedItems.length > 0) selectedLayers.push(includedItems);
        }
      }
    });
    return selectedLayers;
  }

  // Create outfit combos dynamically based on selected layers and included items
  function createOutfits() {
    outfitGrid.innerHTML = '';

    const layersToCombine = getSelectedLayers();

    if (layersToCombine.length === 0) {
      outfitGrid.textContent = "Please select at least one clothing layer with included items.";
      return;
    }

    const combos = combineLayers(layersToCombine);

    combos.forEach(combo => {
      const isCleanCombo = combo.every(item => item.isClean);

      if (showOnlyClean && !isCleanCombo) return;

      const comboDiv = document.createElement('div');
      comboDiv.className = 'combo';
      if (!isCleanCombo) comboDiv.style.opacity = '0.5';

      combo.forEach(item => {
        const img = document.createElement('img');
        img.src = item.url;
        img.width = 100;
        comboDiv.appendChild(img);
      });

      const saveBtn = document.createElement('button');
      saveBtn.textContent = '💾 Save Look';
      saveBtn.className = 'save-btn';
      saveBtn.onclick = () => {
        const title = prompt("Name this look:");
        if (!title) return;
        savedLooks.push({
          title,
          layers: combo.map(item => ({ url: item.url, isClean: item.isClean }))
        });
        saveWardrobe();
        renderSavedLooks();
      };

      comboDiv.appendChild(saveBtn);
      outfitGrid.appendChild(comboDiv);
    });
  }

  // Render saved looks with all layers images
  function renderSavedLooks() {
    savedLooksGrid.innerHTML = '';
    const term = searchInput?.value.toLowerCase() || "";

    savedLooks
      .filter(look => look.title.toLowerCase().includes(term))
      .forEach((look, i) => {
        const div = document.createElement('div');
        div.className = 'saved-look';

        look.layers.forEach(layer => {
          const img = document.createElement('img');
          img.src = layer.url;
          img.width = 100;
          div.appendChild(img);
        });

        const titleDiv = document.createElement('div');
        titleDiv.textContent = look.title;
        titleDiv.style.minWidth = '150px';
        titleDiv.style.fontWeight = '600';
        div.appendChild(titleDiv);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = '🗑';
        removeBtn.onclick = () => {
          savedLooks.splice(i, 1);
          saveWardrobe();
          renderSavedLooks();
        };
        div.appendChild(removeBtn);

        savedLooksGrid.appendChild(div);
      });
  }

  // Load wardrobe data from Firestore
  function loadWardrobe() {
    if (!userId) return;
    db.collection('users').doc(userId).get().then(doc => {
      if (doc.exists) {
        const data = doc.data();
        shirts = data.shirts || [];
        pants = data.pants || [];
        jackets = data.jackets || [];
        innerwear = data.innerwear || [];
        accessories = data.accessories || [];
        savedLooks = data.savedLooks || [];
        savedEvents = data.events || [];

        displayAllLayers();
        createOutfits();
        renderSavedLooks();

        if (calendar && savedEvents.length > 0) {
          savedEvents.forEach(e => calendar.addEvent({ title: e.title, date: e.date }));
        }
      }
    });
  }

  // Event listeners for uploads
  shirtInput?.addEventListener('change', async e => {
    for (let file of e.target.files) {
      const url = await uploadImage(file, 'shirts');
      shirts.push({ url, isClean: true, isIncluded: true });
    }
    saveWardrobe();
    displayAllLayers();
    createOutfits();
  });

  pantInput?.addEventListener('change', async e => {
    for (let file of e.target.files) {
      const url = await uploadImage(file, 'pants');
      pants.push({ url, isClean: true, isIncluded: true });
    }
    saveWardrobe();
    displayAllLayers();
    createOutfits();
  });

  jacketInput?.addEventListener('change', async e => {
    for (let file of e.target.files) {
      const url = await uploadImage(file, 'jackets');
      jackets.push({ url, isClean: true, isIncluded: true });
    }
    saveWardrobe();
    displayAllLayers();
    createOutfits();
  });

  innerwearInput?.addEventListener('change', async e => {
    for (let file of e.target.files) {
      const url = await uploadImage(file, 'innerwear');
      innerwear.push({ url, isClean: true, isIncluded: true });
    }
    saveWardrobe();
    displayAllLayers();
    createOutfits();
  });

  accessoryInput?.addEventListener('change', async e => {
    for (let file of e.target.files) {
      const url = await uploadImage(file, 'accessories');
      accessories.push({ url, isClean: true, isIncluded: true });
    }
    saveWardrobe();
    displayAllLayers();
    createOutfits();
  });

  // Search filter for saved looks
  searchInput?.addEventListener('input', renderSavedLooks);

  // Toggle clean outfits display
  toggleBtn?.addEventListener('click', () => {
    showOnlyClean = !showOnlyClean;
    toggleBtn.textContent = showOnlyClean ? "Show All Outfits" : "Show Only Clean Outfits";
    createOutfits();
  });

  // Layer selectors event listeners — update combos on toggle
  document.querySelectorAll('#layerSelectors input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', () => createOutfits());
  });

  // Initialize FullCalendar
  const calendarEl = document.getElementById('calendar');
  if (calendarEl && typeof FullCalendar !== 'undefined') {
    calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      selectable: true,
      dateClick: info => {
        alert("Calendar scheduling will come soon!");
      },
      events: (savedEvents || []).map(e => ({ title: e.title, date: e.date }))
    });
    calendar.render();
  }

  // Firebase auth state change
  auth.onAuthStateChanged(user => {
    if (user) {
      userId = user.uid;
      loadWardrobe();
    } else {
      if (!location.href.includes('index.html')) location.href = 'index.html';
    }
  });
  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  try {
    await firebase.auth().signOut();
    window.location.href = 'index.html';  // Redirect to login after logout
  } catch (error) {
    alert('Logout failed: ' + error.message);
  }
});

});
