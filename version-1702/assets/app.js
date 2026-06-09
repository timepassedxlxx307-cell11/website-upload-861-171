const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function setupMobileNav() {
  const toggle = $('.nav-toggle');
  const links = $('.nav-links');
  if (!toggle || !links) {
    return;
  }

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

function setupImageFallbacks() {
  $$('img').forEach((image) => {
    image.addEventListener('error', () => {
      image.classList.add('is-missing');
    }, { once: true });
  });
}

function setupHeroSlider() {
  const slider = $('.hero-slider');
  if (!slider) {
    return;
  }

  const slides = $$('.hero-slide', slider);
  const dots = $$('.hero-dot', slider);
  const prev = $('.hero-prev', slider);
  const next = $('.hero-next', slider);
  let current = 0;
  let timer = null;

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  };

  const start = () => {
    timer = window.setInterval(() => show(current + 1), 5000);
  };

  const restart = () => {
    window.clearInterval(timer);
    start();
  };

  prev?.addEventListener('click', () => {
    show(current - 1);
    restart();
  });

  next?.addEventListener('click', () => {
    show(current + 1);
    restart();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.dataset.slideTarget || 0));
      restart();
    });
  });

  if (slides.length > 1) {
    start();
  }
}

async function setupPlayers() {
  const players = $$('[data-hls-player]');
  if (players.length === 0) {
    return;
  }

  let HlsClass = null;

  const getHls = async () => {
    if (HlsClass) {
      return HlsClass;
    }
    const module = await import('./hls-vendor-dru42stk.js');
    HlsClass = module.H;
    return HlsClass;
  };

  for (const player of players) {
    const video = $('video[data-src]', player);
    const overlay = $('.player-overlay', player);
    const status = $('.player-status', player);
    const source = video?.dataset.src;
    let initialized = false;
    let hlsInstance = null;

    const setStatus = (text) => {
      if (status) {
        status.textContent = text;
      }
    };

    const initialize = async () => {
      if (!video || !source || initialized) {
        return;
      }
      initialized = true;
      try {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          setStatus('播放源已就绪');
          return;
        }

        const Hls = await getHls();
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => setStatus('播放源已就绪'));
          hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
            if (!data?.fatal) {
              return;
            }
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus('网络异常，正在重试');
              hlsInstance.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus('媒体异常，正在恢复');
              hlsInstance.recoverMediaError();
            } else {
              setStatus('当前浏览器无法播放该源');
            }
          });
        } else {
          setStatus('当前浏览器不支持 HLS 播放');
        }
      } catch (error) {
        console.error(error);
        setStatus('播放器初始化失败');
      }
    };

    const play = async () => {
      await initialize();
      try {
        await video.play();
        player.classList.add('is-playing');
      } catch (error) {
        setStatus('请再次点击播放按钮开始播放');
      }
    };

    overlay?.addEventListener('click', play);
    video?.addEventListener('play', () => player.classList.add('is-playing'));
    video?.addEventListener('pause', () => player.classList.remove('is-playing'));
    video?.addEventListener('click', () => {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener('pagehide', () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });

    initialize();
  }
}

function createMovieCard(movie) {
  const tags = [movie.genre, ...(movie.tags || [])]
    .filter(Boolean)
    .slice(0, 4)
    .map((tag) => `<span>${escapeHtml(tag)}</span>`)
    .join('');

  return `
      <article class="movie-card">
        <a href="${escapeHtml(movie.url)}" class="movie-card-link">
          <div class="card-poster-wrap">
            <div class="poster-frame">
              <div class="poster-fallback">${escapeHtml(movie.title)}</div>
              <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}封面" loading="lazy">
            </div>
            <span class="year-badge">${escapeHtml(movie.year)}</span>
            <span class="play-badge">▶</span>
          </div>
          <div class="card-body">
            <h3>${escapeHtml(movie.title)}</h3>
            <div class="card-meta">
              <span>${escapeHtml(movie.region)}</span>
              <span>${escapeHtml(movie.type)}</span>
              <span>${escapeHtml(movie.category)}</span>
            </div>
            <p>${escapeHtml(movie.oneLine)}</p>
            <div class="tag-row">${tags}</div>
          </div>
        </a>
      </article>`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function setupSearchPage() {
  const results = $('#searchResults');
  const title = $('#searchTitle');
  const empty = $('#emptySearch');
  const input = $('#searchInput');

  if (!results || !window.MOVIE_INDEX) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const query = (params.get('q') || '').trim();
  if (input) {
    input.value = query;
  }

  const haystack = (movie) => [
    movie.title,
    movie.year,
    movie.region,
    movie.type,
    movie.genre,
    movie.category,
    movie.oneLine,
    ...(movie.tags || [])
  ].join(' ').toLowerCase();

  const matches = query
    ? window.MOVIE_INDEX.filter((movie) => haystack(movie).includes(query.toLowerCase())).slice(0, 120)
    : window.MOVIE_INDEX.slice(0, 60);

  title.textContent = query ? `“${query}” 的搜索结果（${matches.length}）` : '推荐浏览';
  results.innerHTML = matches.map(createMovieCard).join('');
  if (empty) {
    empty.hidden = matches.length > 0;
  }
  setupImageFallbacks();
}

document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  setupImageFallbacks();
  setupHeroSlider();
  setupPlayers();
  setupSearchPage();
});
