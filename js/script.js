// ============ 共通設定オブジェクト ============
const CONFIG = {
  SPLASH_DISPLAY_TIME: 100 + 800,
  SPLASH_FADEIN_TIME: 0,
  SPLASH_FADEOUT_TIME: 700,
  ELEMENT_STAGGER_DELAY: 500,
  HEADER_BUBBLE_FADEIN_TIME: 5000
};

CONFIG.CONTENT_START_DELAY =
  CONFIG.SPLASH_DISPLAY_TIME + CONFIG.SPLASH_FADEOUT_TIME;

// ============ メニュー制御関数 ============
const closeMenu = (hamburgerBtn, navMenu, menuOverlay) => {
  hamburgerBtn.classList.remove("active");
  navMenu.classList.remove("active");
  menuOverlay.classList.remove("active");
};

const toggleMenu = (hamburgerBtn, navMenu, menuOverlay) => {
  hamburgerBtn.classList.toggle("active");
  navMenu.classList.toggle("active");
  menuOverlay.classList.toggle("active");
};

// ============ メイン処理 ============
document.addEventListener("DOMContentLoaded", () => {
  // 泡生成の共通関数
  const createBubbles = (container, className, count) => {
    if (!container) return;

    const isDesktop = window.matchMedia("(min-width: 769px)").matches;
    const minSize = isDesktop ? 28 : 18;
    const maxSize = isDesktop ? 180 : 66;

    for (let i = 0; i < count; i += 1) {
      const bubble = document.createElement("div");
      bubble.className = className;

      const size = minSize + Math.random() * (maxSize - minSize);
      const left = Math.random() * 100;
      const top = -20 + Math.random() * 140;
      const duration = 16 + Math.random() * 10;
      const delay = Math.random() * 0.5;

      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${left}%`;
      bubble.style.top = `${top}%`;
      bubble.style.setProperty("--bubble-duration", `${duration}s`);
      bubble.style.setProperty("--bubble-delay", `${delay}s`);

      container.appendChild(bubble);
    }
  };

  // スプラッシュ画面の泡を生成
  createBubbles(document.querySelector(".splash-bubbles"), "splash-bubble", 25);

  // ヘッダー画像の泡を生成
  createBubbles(document.querySelector(".header-bubbles"), "header-bubble", 25);

  // ヘッダーの泡を5秒後に削除
  const headerBubbles = document.querySelector(".header-bubbles");
  if (headerBubbles) {
    setTimeout(() => {
      headerBubbles.classList.add("fade-out");
      setTimeout(() => {
        headerBubbles.remove();
      }, 800);
    }, CONFIG.HEADER_BUBBLE_FADEIN_TIME);
  }

  // CSSカスタムプロパティにセット
  const root = document.documentElement;
  root.style.setProperty(
    "--splash-fadein-time",
    `${CONFIG.SPLASH_FADEIN_TIME / 1000}s`
  );
  root.style.setProperty(
    "--splash-fadeout-time",
    `${CONFIG.SPLASH_FADEOUT_TIME / 1000}s`
  );
  root.style.setProperty(
    "--content-fade-time",
    `${CONFIG.CONTENT_START_DELAY / 1000}s`
  );

  // スプラッシュスクリーン制御
  const body = document.body;
  const splashScreen = document.getElementById("splash-screen");

  body.style.overflow = "hidden";

  setTimeout(() => {
    splashScreen.classList.add("hidden");
  }, CONFIG.SPLASH_DISPLAY_TIME);

  setTimeout(
    () => {
      splashScreen.style.display = "none";
      window.scrollTo(0, 0);
    },
    CONFIG.SPLASH_DISPLAY_TIME + CONFIG.SPLASH_FADEOUT_TIME + 50
  );

  // Intersection Observerでフェードインアニメーション
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1
  };

  const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        fadeInObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // ヘッダーは最初に表示
  const header = document.querySelector("header.fade-in");
  if (header) {
    setTimeout(() => {
      header.classList.add("show");

      // ヘッダー表示後、少し遅延してからセクションの監視を開始
      setTimeout(() => {
        document.querySelectorAll(".section.fade-in").forEach((element) => {
          fadeInObserver.observe(element);
        });
      }, 300);
    }, CONFIG.CONTENT_START_DELAY);
  }

  // クリック時の泡演出
  document.addEventListener("click", (e) => {
    // スプラッシュ画面表示中はスキップ
    if (splashScreen && !splashScreen.classList.contains("hidden")) {
      return;
    }

    // 5個の泡を生成
    for (let i = 0; i < 5; i += 1) {
      const bubble = document.createElement("div");
      bubble.className = "click-bubble";

      const size = 15 + Math.random() * 30;
      // 上方向中心60度範囲（60度～120度）
      const minAngle = Math.PI / 3; // 60度（右上）
      const maxAngle = (Math.PI * 2) / 3; // 120度（左上）
      const angle = minAngle + (i / 4) * (maxAngle - minAngle);
      const distance = 15 + Math.random() * 20;
      const offsetX = Math.cos(angle) * distance;
      const offsetY = Math.sin(angle) * distance;
      const xDirection = Math.cos(angle);
      const yDirection = Math.sin(angle);

      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${e.clientX + offsetX - size / 2}px`;
      bubble.style.top = `${e.clientY + offsetY - size / 2}px`;
      bubble.style.setProperty("--bubble-x", xDirection);
      bubble.style.setProperty("--bubble-y", yDirection);

      document.body.appendChild(bubble);

      // アニメーション終了後に削除
      setTimeout(() => {
        bubble.remove();
      }, 2000);
    }
  });

  // ハンバーガーメニュー
  const hamburgerBtn = document.querySelector(".hamburger-menu");
  const navMenu = document.querySelector(".nav-menu");
  const menuOverlay = document.querySelector(".menu-overlay");

  if (hamburgerBtn && navMenu && menuOverlay) {
    hamburgerBtn.addEventListener("click", () => {
      toggleMenu(hamburgerBtn, navMenu, menuOverlay);
    });

    menuOverlay.addEventListener("click", () => {
      closeMenu(hamburgerBtn, navMenu, menuOverlay);
    });

    // ナビゲーションリンク
    document.querySelectorAll(".nav-menu a").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          closeMenu(hamburgerBtn, navMenu, menuOverlay);
          setTimeout(() => {
            targetElement.scrollIntoView({ behavior: "smooth" });
          }, 300);
        }
      });
    });
  }

  // アコーディオン機能
  document.querySelectorAll(".accordion-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const isActive = this.classList.contains("active");
      const content = this.parentElement.querySelector(".accordion-content");

      // すべて閉じる
      document.querySelectorAll(".accordion-item").forEach((item) => {
        item.querySelector(".accordion-btn").classList.remove("active");
        item.querySelector(".accordion-content").classList.remove("show");
      });

      // クローズされていた場合のみ開く
      if (!isActive) {
        this.classList.add("active");
        content.classList.add("show");
      }
    });
  });

  // カテゴリーフィルタリング機能
  const categoryBtns = document.querySelectorAll(".category-btn");
  const workCards = document.querySelectorAll(".work-card");

  if (categoryBtns.length && workCards.length) {
    categoryBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const selectedCategory = btn.dataset.category;

        // アクティブボタン切り替え
        categoryBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        // カード表示/非表示
        workCards.forEach((card) => {
          const shouldShow =
            selectedCategory === "all" ||
            card.dataset.category === selectedCategory;
          const cardLink =
            card.closest(".work-card-link") || card.parentElement;

          card.classList.toggle("hidden", !shouldShow);
          if (cardLink?.classList) {
            cardLink.classList.toggle("hidden", !shouldShow);
          }
        });
      });
    });
  }

  // トップに戻るボタン
  const scrollToTopBtn = document.getElementById("scroll-to-top");

  // スクロール時の表示/非表示
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      scrollToTopBtn.classList.add("visible");
    } else {
      scrollToTopBtn.classList.remove("visible");
    }
  });

  // クリック時にトップへスクロール
  scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
});
