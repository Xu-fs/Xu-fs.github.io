(() => {
  const STORAGE_KEY = "garageVehiclesWeb";
  const LEGACY_DEFAULT_IMAGE = "../miniprogram/images/default_lambo_gt3_evo2.jpg";
  const DEFAULT_IMAGE = "./assets/default-lambo-huracan-gt3-evo2.jpg";

  const labels = {
    sortInitial: "首字母排序",
    sortPurchaseDate: "购买时间",
    sortVehicleBrand: "车辆品牌",
    sortModelBrand: "车模品牌",
    fieldVehicleBrand: "车辆品牌",
    fieldModelBrand: "车模品牌",
    fieldColor: "颜色",
    fieldTags: "分类标签",
    all: "全部",
    unnamed: "未命名车辆",
    noModelBrand: "未填写车模品牌",
    cover: "封面",
    metaModelBrand: "车模品牌",
    metaSerialNumber: "编号",
    metaVehicleBrand: "车辆品牌",
    metaSpecificModel: "具体型号",
    metaColor: "颜色",
    metaTags: "分类标签",
    metaPurchaseDate: "购买时间",
    metaPurchasePrice: "购买价格",
    note: "备注",
    edit: "编辑",
    del: "删除",
    needOneField: "至少填写一项内容再保存。"
  };

  const SORTS = [
    { key: "initial", label: labels.sortInitial },
    { key: "purchaseDate", label: labels.sortPurchaseDate },
    { key: "vehicleBrand", label: labels.sortVehicleBrand },
    { key: "modelBrand", label: labels.sortModelBrand }
  ];

  const FIELDS = [
    { key: "vehicleBrand", label: labels.fieldVehicleBrand },
    { key: "modelBrand", label: labels.fieldModelBrand },
    { key: "color", label: labels.fieldColor },
    { key: "tags", label: labels.fieldTags }
  ];

  const defaults = [
    {
      id: 1,
      images: [DEFAULT_IMAGE],
      coverImage: DEFAULT_IMAGE,
      modelBrand: "MINI GT",
      serialNumber: "1064",
      vehicleBrand: "兰博基尼",
      specificModel: "飓风GT3 EVO2",
      colorText: "紫色、绿色",
      colors: ["紫色", "绿色"],
      tagText: "GT3",
      tags: ["GT3"],
      purchaseDate: "2025-11-11",
      purchasePrice: "",
      note: ""
    }
  ];

  const state = {
    currentTab: "garage",
    searchKeyword: "",
    sortKey: "initial",
    categoryField: "vehicleBrand",
    categoryValue: "all",
    vehicles: [],
    addImages: [],
    detailVehicleId: null,
    detailImageIndex: 0,
    editSession: null
  };

  const el = {
    navItems: Array.from(document.querySelectorAll("[data-tab]")),
    pages: Array.from(document.querySelectorAll("[data-page]")),
    searchInput: document.getElementById("searchInput"),
    sortToggle: document.getElementById("sortToggle"),
    sortPanel: document.getElementById("sortPanel"),
    sortCurrentText: document.getElementById("sortCurrentText"),
    categoryToggle: document.getElementById("categoryToggle"),
    categoryPanel: document.getElementById("categoryPanel"),
    categoryCurrentText: document.getElementById("categoryCurrentText"),
    categoryFieldOptions: document.getElementById("categoryFieldOptions"),
    categoryValueOptions: document.getElementById("categoryValueOptions"),
    garageGrid: document.getElementById("garageGrid"),
    garageEmptyState: document.getElementById("garageEmptyState"),
    countText: document.getElementById("countText"),
    vehicleForm: document.getElementById("vehicleForm"),
    imageInput: document.getElementById("imageInput"),
    imagePreviewList: document.getElementById("imagePreviewList"),
    resetVehicleButton: document.getElementById("resetVehicleButton"),
    detailModal: document.getElementById("detailModal"),
    detailContent: document.getElementById("detailContent"),
    editModal: document.getElementById("editModal"),
    editVehicleForm: document.getElementById("editVehicleForm"),
    editorFormTemplate: document.getElementById("editorFormTemplate")
  };

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const unique = (values) => Array.from(new Set(values.map((item) => String(item || "").trim()).filter(Boolean)));
  const splitItems = (input) => unique(String(input || "").split(/[\uFF0C,\u3001\s]+/));
  const joinDisplay = (values) => unique(values).join("、");
  const titleOf = (vehicle) => `${vehicle.vehicleBrand || ""}${vehicle.specificModel || ""}`.trim() || labels.unnamed;
  const compareText = (a, b) => String(a || "").localeCompare(String(b || ""), "zh-Hans-CN-u-co-pinyin");

  function parseStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function saveVehicles() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.vehicles));
  }

  function normalizeImagePath(src) {
    const value = String(src || "").trim();
    return value === LEGACY_DEFAULT_IMAGE ? DEFAULT_IMAGE : value;
  }

  function normalizeVehicle(vehicle, index = 0) {
    const images = unique([...(Array.isArray(vehicle.images) ? vehicle.images : []), vehicle.coverImage || "", vehicle.image || ""].map(normalizeImagePath));
    const colors = Array.isArray(vehicle.colors) && vehicle.colors.length ? unique(vehicle.colors) : splitItems(vehicle.colorText || vehicle.color || "");
    const tags = Array.isArray(vehicle.tags) && vehicle.tags.length ? unique(vehicle.tags) : splitItems(vehicle.tagText || "");

    return {
      id: vehicle.id || Date.now() + index,
      images: images.length ? images : [DEFAULT_IMAGE],
      coverImage: images[0] || DEFAULT_IMAGE,
      modelBrand: String(vehicle.modelBrand || "").trim(),
      serialNumber: String(vehicle.serialNumber || "").trim(),
      vehicleBrand: String(vehicle.vehicleBrand || vehicle.brand || "").trim(),
      specificModel: String(vehicle.specificModel || vehicle.name || "").trim(),
      colorText: colors.join("、"),
      colors,
      tagText: tags.join("、"),
      tags,
      purchaseDate: String(vehicle.purchaseDate || "").trim(),
      purchasePrice: String(vehicle.purchasePrice || "").trim(),
      note: String(vehicle.note || "").trim()
    };
  }

  function loadVehicles() {
    const saved = parseStorage(STORAGE_KEY, null);
    const source = Array.isArray(saved) && saved.length ? saved : defaults;
    return source.map(normalizeVehicle);
  }

  function formVehicle(formData, images, id) {
    const colors = splitItems(formData.get("colorText"));
    const tags = splitItems(formData.get("tagText"));
    return normalizeVehicle({
      id,
      images,
      coverImage: images[0] || DEFAULT_IMAGE,
      modelBrand: formData.get("modelBrand"),
      serialNumber: formData.get("serialNumber"),
      vehicleBrand: formData.get("vehicleBrand"),
      specificModel: formData.get("specificModel"),
      colorText: joinDisplay(colors),
      colors,
      tagText: joinDisplay(tags),
      tags,
      purchaseDate: formData.get("purchaseDate"),
      purchasePrice: formData.get("purchasePrice"),
      note: formData.get("note")
    });
  }

  function hasContent(vehicle) {
    const hasCustomImage = vehicle.images.some((image) => image && image !== DEFAULT_IMAGE);
    return Boolean(
      hasCustomImage ||
      vehicle.modelBrand ||
      vehicle.serialNumber ||
      vehicle.vehicleBrand ||
      vehicle.specificModel ||
      vehicle.colorText ||
      vehicle.tagText ||
      vehicle.purchaseDate ||
      vehicle.purchasePrice ||
      vehicle.note
    );
  }

  function sortLabel(key) {
    return (SORTS.find((item) => item.key === key) || SORTS[0]).label;
  }

  function fieldLabel(key) {
    return (FIELDS.find((item) => item.key === key) || FIELDS[0]).label;
  }

  function sortVehicles(vehicles) {
    const list = [...vehicles];
    list.sort((a, b) => {
      if (state.sortKey === "purchaseDate") return String(b.purchaseDate || "").localeCompare(String(a.purchaseDate || "")) || compareText(titleOf(a), titleOf(b));
      if (state.sortKey === "vehicleBrand") return compareText(a.vehicleBrand, b.vehicleBrand) || compareText(titleOf(a), titleOf(b));
      if (state.sortKey === "modelBrand") return compareText(a.modelBrand, b.modelBrand) || compareText(titleOf(a), titleOf(b));
      return compareText(titleOf(a), titleOf(b));
    });
    return list;
  }

  function matchKeyword(vehicle, keyword) {
    if (!keyword) return true;
    return [titleOf(vehicle), vehicle.modelBrand, vehicle.serialNumber, vehicle.vehicleBrand, vehicle.specificModel, vehicle.colorText, vehicle.tagText, vehicle.purchaseDate, vehicle.purchasePrice, vehicle.note]
      .join(" ")
      .toLowerCase()
      .includes(keyword.toLowerCase());
  }

  function matchCategory(vehicle) {
    if (state.categoryValue === "all") return true;
    if (state.categoryField === "color") return vehicle.colors.includes(state.categoryValue);
    if (state.categoryField === "tags") return vehicle.tags.includes(state.categoryValue);
    return String(vehicle[state.categoryField] || "") === state.categoryValue;
  }

  function filteredVehicles() {
    return sortVehicles(state.vehicles.filter((vehicle) => matchKeyword(vehicle, state.searchKeyword) && matchCategory(vehicle)));
  }

  function categoryValues(field) {
    if (field === "color") return unique(state.vehicles.flatMap((vehicle) => vehicle.colors));
    if (field === "tags") return unique(state.vehicles.flatMap((vehicle) => vehicle.tags));
    return unique(state.vehicles.map((vehicle) => vehicle[field]));
  }

  function filesToDataUrls(fileList) {
    return Promise.all(Array.from(fileList || []).map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    })));
  }

  function switchTab(tab) {
    state.currentTab = tab;
    el.navItems.forEach((item) => item.classList.toggle("nav-item-active", item.dataset.tab === tab));
    el.pages.forEach((page) => page.classList.toggle("page-active", page.dataset.page === tab));
  }

  function renderSortPanel() {
    el.sortCurrentText.textContent = sortLabel(state.sortKey);
    el.sortPanel.innerHTML = SORTS.map((option) => `<button class="chip ${option.key === state.sortKey ? "chip-active" : ""}" type="button" data-sort-key="${option.key}">${escapeHtml(option.label)}</button>`).join("");
  }

  function renderCategoryPanel() {
    const values = categoryValues(state.categoryField);
    const current = state.categoryValue === "all" ? labels.all : state.categoryValue;
    el.categoryCurrentText.textContent = `${fieldLabel(state.categoryField)} / ${current}`;
    el.categoryFieldOptions.innerHTML = FIELDS.map((field) => `<button class="chip ${field.key === state.categoryField ? "chip-active" : ""}" type="button" data-category-field="${field.key}">${escapeHtml(field.label)}</button>`).join("");
    el.categoryValueOptions.innerHTML = [`<button class="chip ${state.categoryValue === "all" ? "chip-active" : ""}" type="button" data-category-value="all">${labels.all}</button>`]
      .concat(values.map((value) => `<button class="chip ${value === state.categoryValue ? "chip-active" : ""}" type="button" data-category-value="${escapeHtml(value)}">${escapeHtml(value)}</button>`))
      .join("");
  }

  function renderGarage() {
    const vehicles = filteredVehicles();
    el.countText.textContent = `${vehicles.length} 辆`;
    el.garageGrid.innerHTML = vehicles.map((vehicle) => `
      <article class="vehicle-card" tabindex="0" role="button" data-vehicle-id="${vehicle.id}">
        <img class="vehicle-card-cover" src="${escapeHtml(vehicle.coverImage)}" alt="${escapeHtml(titleOf(vehicle))}" />
        <div class="vehicle-card-body">
          <h3 class="vehicle-card-title">${escapeHtml(titleOf(vehicle))}</h3>
          ${vehicle.modelBrand ? `<p class="vehicle-card-meta vehicle-card-model-brand">${labels.metaModelBrand}: ${escapeHtml(vehicle.modelBrand)}</p>` : ""}
          ${vehicle.serialNumber ? `<p class="vehicle-card-meta">${labels.metaSerialNumber}: ${escapeHtml(vehicle.serialNumber)}</p>` : ""}
          ${vehicle.purchaseDate ? `<p class="vehicle-card-meta">${labels.metaPurchaseDate}: ${escapeHtml(vehicle.purchaseDate)}</p>` : ""}
          ${vehicle.purchasePrice ? `<p class="vehicle-card-price">${labels.metaPurchasePrice}: ${escapeHtml(vehicle.purchasePrice)}</p>` : ""}
        </div>
      </article>
    `).join("");
    el.garageEmptyState.classList.toggle("hidden", vehicles.length > 0);
  }

  function renderAddImages() {
    el.imagePreviewList.innerHTML = state.addImages.map((src, index) => `
      <div class="thumb-item">
        <img src="${escapeHtml(src)}" alt="车辆图片 ${index + 1}" />
        ${index === 0 ? `<span class="thumb-badge">${labels.cover}</span>` : ""}
        <button class="thumb-remove" type="button" data-remove-add-image="${index}">×</button>
      </div>
    `).join("");
  }

  function metaItem(label, value) {
    if (!value) return "";
    return `<div class="detail-meta-item"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(value)}</span></div>`;
  }

  function renderDetail() {
    const vehicle = state.vehicles.find((item) => String(item.id) === String(state.detailVehicleId));
    if (!vehicle) return;
    const image = vehicle.images[state.detailImageIndex] || vehicle.coverImage || DEFAULT_IMAGE;
    el.detailContent.innerHTML = `
      <div class="detail-layout">
        <div>
          <img class="detail-gallery-main" src="${escapeHtml(image)}" alt="${escapeHtml(titleOf(vehicle))}" />
          <div class="detail-thumbs">
            ${vehicle.images.map((src, index) => `
              <button class="detail-thumb ${index === state.detailImageIndex ? "detail-thumb-active" : ""}" type="button" data-detail-image="${index}">
                <img src="${escapeHtml(src)}" alt="${escapeHtml(titleOf(vehicle))} 图片 ${index + 1}" />
              </button>
            `).join("")}
          </div>
        </div>
        <div>
          <h2 class="detail-title">${escapeHtml(titleOf(vehicle))}</h2>
          <p class="detail-subtitle">${escapeHtml(vehicle.modelBrand || labels.noModelBrand)}</p>
          <div class="detail-meta-list">
            ${metaItem(labels.metaModelBrand, vehicle.modelBrand)}
            ${metaItem(labels.metaSerialNumber, vehicle.serialNumber)}
            ${metaItem(labels.metaVehicleBrand, vehicle.vehicleBrand)}
            ${metaItem(labels.metaSpecificModel, vehicle.specificModel)}
            ${metaItem(labels.metaColor, vehicle.colorText)}
            ${metaItem(labels.metaTags, vehicle.tagText)}
            ${metaItem(labels.metaPurchaseDate, vehicle.purchaseDate)}
            ${metaItem(labels.metaPurchasePrice, vehicle.purchasePrice)}
          </div>
          ${vehicle.note ? `<div class="detail-note"><strong>${labels.note}</strong><p>${escapeHtml(vehicle.note)}</p></div>` : ""}
          <div class="detail-actions">
            <button class="primary-button" type="button" id="detailEditButton">${labels.edit}</button>
            <button class="danger-button" type="button" id="detailDeleteButton">${labels.del}</button>
          </div>
        </div>
      </div>
    `;
  }

  function openDetail(vehicleId) {
    state.detailVehicleId = vehicleId;
    state.detailImageIndex = 0;
    renderDetail();
    el.detailModal.classList.remove("hidden");
  }

  function closeDetail() {
    el.detailModal.classList.add("hidden");
    state.detailVehicleId = null;
  }

  function closeEdit() {
    el.editModal.classList.add("hidden");
    el.editVehicleForm.innerHTML = "";
    state.editSession = null;
  }

  function renderEditImages(previewList) {
    previewList.innerHTML = state.editSession.images.map((src, index) => `
      <div class="thumb-item">
        <img src="${escapeHtml(src)}" alt="编辑图片 ${index + 1}" />
        ${index === 0 ? `<span class="thumb-badge">${labels.cover}</span>` : ""}
        <button class="thumb-remove" type="button" data-remove-edit-image="${index}">×</button>
      </div>
    `).join("");
  }

  function openEdit(vehicleId) {
    const vehicle = state.vehicles.find((item) => String(item.id) === String(vehicleId));
    if (!vehicle) return;
    state.editSession = { id: vehicle.id, images: [...vehicle.images] };
    el.editVehicleForm.innerHTML = el.editorFormTemplate.innerHTML;

    const form = el.editVehicleForm;
    form.elements.modelBrand.value = vehicle.modelBrand;
    form.elements.serialNumber.value = vehicle.serialNumber;
    form.elements.vehicleBrand.value = vehicle.vehicleBrand;
    form.elements.specificModel.value = vehicle.specificModel;
    form.elements.colorText.value = vehicle.colorText;
    form.elements.tagText.value = vehicle.tagText;
    form.elements.purchaseDate.value = vehicle.purchaseDate;
    form.elements.purchasePrice.value = vehicle.purchasePrice;
    form.elements.note.value = vehicle.note;

    const imageInput = form.querySelector("[data-image-input]");
    const previewList = form.querySelector("[data-image-preview-list]");
    renderEditImages(previewList);

    imageInput.addEventListener("change", async (event) => {
      const images = await filesToDataUrls(event.target.files);
      state.editSession.images.push(...images);
      renderEditImages(previewList);
      imageInput.value = "";
    });

    previewList.addEventListener("click", (event) => {
      const target = event.target.closest("[data-remove-edit-image]");
      if (!target) return;
      state.editSession.images.splice(Number(target.dataset.removeEditImage), 1);
      renderEditImages(previewList);
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const updated = formVehicle(new FormData(form), state.editSession.images, state.editSession.id);
      if (!hasContent(updated)) {
        window.alert(labels.needOneField);
        return;
      }
      state.vehicles = state.vehicles.map((item) => String(item.id) === String(updated.id) ? updated : item);
      saveVehicles();
      closeEdit();
      renderAll();
    });

    el.editModal.classList.remove("hidden");
  }

  function resetAddForm() {
    el.vehicleForm.reset();
    state.addImages = [];
    renderAddImages();
  }

  function renderAll() {
    renderSortPanel();
    renderCategoryPanel();
    renderGarage();
    renderAddImages();
  }

  function closePanels(event) {
    if (!event.target.closest("#sortToggle, #sortPanel")) el.sortPanel.classList.add("hidden");
    if (!event.target.closest("#categoryToggle, #categoryPanel")) el.categoryPanel.classList.add("hidden");
  }

  function bindEvents() {
    el.navItems.forEach((item) => item.addEventListener("click", () => switchTab(item.dataset.tab)));

    el.searchInput.addEventListener("input", (event) => {
      state.searchKeyword = event.target.value.trim();
      renderGarage();
    });

    el.sortToggle.addEventListener("click", () => {
      el.sortPanel.classList.toggle("hidden");
      el.categoryPanel.classList.add("hidden");
    });

    el.sortPanel.addEventListener("click", (event) => {
      const target = event.target.closest("[data-sort-key]");
      if (!target) return;
      state.sortKey = target.dataset.sortKey;
      el.sortPanel.classList.add("hidden");
      renderAll();
    });

    el.categoryToggle.addEventListener("click", () => {
      el.categoryPanel.classList.toggle("hidden");
      el.sortPanel.classList.add("hidden");
    });

    el.categoryFieldOptions.addEventListener("click", (event) => {
      const target = event.target.closest("[data-category-field]");
      if (!target) return;
      state.categoryField = target.dataset.categoryField;
      state.categoryValue = "all";
      renderCategoryPanel();
      renderGarage();
    });

    el.categoryValueOptions.addEventListener("click", (event) => {
      const target = event.target.closest("[data-category-value]");
      if (!target) return;
      state.categoryValue = target.dataset.categoryValue;
      renderCategoryPanel();
      renderGarage();
      el.categoryPanel.classList.add("hidden");
    });

    el.imageInput.addEventListener("change", async (event) => {
      const images = await filesToDataUrls(event.target.files);
      state.addImages.push(...images);
      renderAddImages();
      el.imageInput.value = "";
    });

    el.imagePreviewList.addEventListener("click", (event) => {
      const target = event.target.closest("[data-remove-add-image]");
      if (!target) return;
      state.addImages.splice(Number(target.dataset.removeAddImage), 1);
      renderAddImages();
    });

    el.vehicleForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const vehicle = formVehicle(new FormData(el.vehicleForm), state.addImages);
      if (!hasContent(vehicle)) {
        window.alert(labels.needOneField);
        return;
      }
      state.vehicles.unshift(vehicle);
      saveVehicles();
      resetAddForm();
      switchTab("garage");
      renderAll();
    });

    el.resetVehicleButton.addEventListener("click", resetAddForm);

    el.garageGrid.addEventListener("click", (event) => {
      const card = event.target.closest("[data-vehicle-id]");
      if (card) openDetail(card.dataset.vehicleId);
    });

    el.garageGrid.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const card = event.target.closest("[data-vehicle-id]");
      if (!card) return;
      event.preventDefault();
      openDetail(card.dataset.vehicleId);
    });

    el.detailContent.addEventListener("click", (event) => {
      const thumb = event.target.closest("[data-detail-image]");
      if (thumb) {
        state.detailImageIndex = Number(thumb.dataset.detailImage);
        renderDetail();
        return;
      }
      if (event.target.closest("#detailEditButton")) {
        const vehicleId = state.detailVehicleId;
        closeDetail();
        openEdit(vehicleId);
        return;
      }
      if (event.target.closest("#detailDeleteButton")) {
        const vehicle = state.vehicles.find((item) => String(item.id) === String(state.detailVehicleId));
        if (!vehicle || !window.confirm(`确认删除 ${titleOf(vehicle)} 吗？`)) return;
        state.vehicles = state.vehicles.filter((item) => String(item.id) !== String(vehicle.id));
        saveVehicles();
        closeDetail();
        renderAll();
      }
    });

    document.addEventListener("click", closePanels);
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-close-modal]")) closeDetail();
      if (event.target.closest("[data-close-edit]")) closeEdit();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeDetail();
        closeEdit();
      }
    });
  }

  function init() {
    state.vehicles = loadVehicles();
    bindEvents();
    renderAll();
  }

  init();
})();
