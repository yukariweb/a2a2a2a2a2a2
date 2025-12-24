// -------------------------------------------------------------
// tour.js — Viewer用：順路特化版（ホットスポット無し）
// -------------------------------------------------------------

(async () => {
  const res = await fetch("tour.json");
  const TOUR = await res.json();

  const pano = document.getElementById("pano");
  const viewer = new Marzipano.Viewer(pano);

  const sceneTitle = document.getElementById("sceneTitle");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");
  const prevLabel = document.getElementById("prevLabel");
  const nextLabel = document.getElementById("nextLabel");

  let currentIndex = 0;
  let currentScene = null;

  function getSceneByIndex(index) {
    if (!TOUR?.scenes?.length) return null;
    if (index < 0 || index >= TOUR.scenes.length) return null;
    return TOUR.scenes[index];
  }

  function updateNavUI() {
    const cur = getSceneByIndex(currentIndex);
    const prev = getSceneByIndex(currentIndex - 1);
    const next = getSceneByIndex(currentIndex + 1);

    if (sceneTitle) sceneTitle.textContent = cur?.name || cur?.filename || "";

    if (btnPrev) btnPrev.disabled = !prev;
    if (btnNext) btnNext.disabled = !next;

    if (prevLabel) prevLabel.textContent = prev?.name || "最初";
    if (nextLabel) nextLabel.textContent = next ? `次：${next.name || next.filename}` : "最後";
  }

  function loadSceneByIndex(index) {
  const data = getSceneByIndex(index);
  if (!data) return;

  currentIndex = index;

  // --------------------------------------------------
  // 🖼 パノラマ画像ソース
  // --------------------------------------------------
  const source = Marzipano.ImageUrlSource.fromString(
    `scenes/${data.filename}`
  );

  const geometry = new Marzipano.EquirectGeometry([
    { width: 4000 }
  ]);

  // --------------------------------------------------
  // 🧭 初期視点の決定（Viewer用・読み取り専用）
  // 優先順位：
  //   1. initialView（案内用）
  //   2. view（従来互換）
  //   3. フォールバック
  // --------------------------------------------------
  const startView =
    data.initialView ||
    data.view ||
    { yaw: 0, pitch: 0, fov: Math.PI / 2 };

  const limiter = Marzipano.RectilinearView.limit.traditional(
    1024,
    100 * Math.PI / 180
  );

  const view = new Marzipano.RectilinearView(
    startView,
    limiter
  );

  // --------------------------------------------------
  // 🟢 Scene 作成 & 切り替え
  // --------------------------------------------------
  currentScene = viewer.createScene({
    source,
    geometry,
    view,
    pinFirstLevel: true
  });

  currentScene.switchTo();

  // --------------------------------------------------
  // 🔄 順路UI更新
  // --------------------------------------------------
  updateNavUI();
}


  // ナビイベント
  btnPrev?.addEventListener("click", (e) => {
    e.stopPropagation();
    loadSceneByIndex(currentIndex - 1);
  });

  btnNext?.addEventListener("click", (e) => {
    e.stopPropagation();
    loadSceneByIndex(currentIndex + 1);
  });

  // 起動
  if (TOUR?.scenes?.length) {
    loadSceneByIndex(0);
  } else {
    if (sceneTitle) sceneTitle.textContent = "シーンがありません";
    if (btnPrev) btnPrev.disabled = true;
    if (btnNext) btnNext.disabled = true;
  }
})();



