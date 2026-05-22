/**
 * Blog index: loads posts from blog-posts/index.json and renders list/grid views.
 */
(function () {
  'use strict';

  let currentView = 'grid';
  let blogPosts = [];

  function asset(path) {
    if (window.ElementoI18n?.assetUrl) {
      return window.ElementoI18n.assetUrl(path);
    }
    return path;
  }

  function postHref(filename) {
    return `blog-posts/${filename}`;
  }

  function postImage(thumbnailPath) {
    return asset(`blog-posts/${thumbnailPath}`);
  }

  function uiBlog() {
    return window.__I18N__?.ui?.blog ?? {};
  }

  function localizedTitle(post) {
    const locale = window.ElementoI18n?.getPageLocale?.() ?? 'en';
    if (locale !== 'it') return post.title;
    const key = `blog-posts_${post.filename.replace(/\.html$/, '')}`;
    const page = window.__I18N__?.ui?.pages?.[key];
    if (page?.title) {
      return page.title.replace(/\s*\|\s*Blog dell'Elemento\s*$/i, '').trim();
    }
    return post.title;
  }

  function formatDate(dateString) {
    const locale = window.ElementoI18n?.getPageLocale?.() === 'it' ? 'it-IT' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function labels() {
    const b = uiBlog();
    return {
      loading: b.loading ?? 'Loading articles…',
      errorTitle: b.errorTitle ?? 'Error Loading Articles',
      errorBody: b.errorBody ?? 'Unable to load blog posts. Please try again later.',
      emptyTitle: b.emptyTitle ?? 'No Articles Yet',
      emptyBody: b.emptyBody ?? 'Check back soon for new articles and insights.',
      read: b.readMore ?? 'Read more',
      articles: b.articlesLabel ?? 'articles',
      by: b.byAuthor ?? 'By',
    };
  }

  function switchView(view) {
    const viewToggleBtns = document.querySelectorAll('.view-toggle-btn');
    const blogList = document.getElementById('blog-list');
    const blogGrid = document.getElementById('blog-grid');
    if (!blogList || !blogGrid) return;

    viewToggleBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === view);
    });

    if (view === 'list') {
      blogList.style.display = 'block';
      blogGrid.style.display = 'none';
      currentView = 'list';
    } else {
      blogList.style.display = 'none';
      blogGrid.style.display = 'grid';
      currentView = 'grid';
    }

    renderBlogPosts();
  }

  function updateBlogCount(count) {
    const blogCount = document.getElementById('blog-count');
    if (blogCount) blogCount.textContent = String(count);
    const stats = document.querySelector('.blog-stats');
    if (stats && !stats.dataset.i18nReady) {
      const lbl = labels();
      stats.innerHTML = `<span id="blog-count">${count}</span> ${lbl.articles}`;
      stats.dataset.i18nReady = '1';
    }
  }

  function renderBlogPosts() {
    const listContainer = document.getElementById('blog-list');
    const gridContainer = document.getElementById('blog-grid');
    if (!listContainer || !gridContainer) return;

    const lbl = labels();

    if (!blogPosts.length) {
      const empty = `<div class="blog-empty"><i class="fas fa-newspaper"></i><h3>${lbl.emptyTitle}</h3><p>${lbl.emptyBody}</p></div>`;
      listContainer.innerHTML = empty;
      gridContainer.innerHTML = empty;
      return;
    }

    listContainer.innerHTML = `
      <table class="blog-table">
        <thead>
          <tr>
            <th>Article</th>
            <th>Author</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${blogPosts
            .map((post) => {
              const title = localizedTitle(post);
              const href = postHref(post.filename);
              return `
            <tr>
              <td>
                <div class="blog-title"><a href="${href}">${title}</a></div>
                <div class="blog-summary">${post.summary}</div>
              </td>
              <td>${post.author}</td>
              <td>${formatDate(post.date)}</td>
              <td class="blog-actions"><a href="${href}" class="btn btn-secondary">${lbl.read}</a></td>
            </tr>`;
            })
            .join('')}
        </tbody>
      </table>`;

    gridContainer.innerHTML = blogPosts
      .map((post) => {
        const title = localizedTitle(post);
        const href = postHref(post.filename);
        const thumb = postImage(post.thumbnail_image);
        return `
      <article class="blog-card">
        <div class="blog-thumbnail">
          <img src="${thumb}" alt="${title}" loading="lazy">
        </div>
        <div class="blog-content">
          <h2><a href="${href}">${title}</a></h2>
          <p class="blog-meta">${lbl.by} ${post.author} &mdash; ${formatDate(post.date)}</p>
          <a href="${href}" class="btn btn-secondary">${lbl.read}</a>
        </div>
      </article>`;
      })
      .join('');
  }

  function loadBlogPosts() {
    const blogList = document.getElementById('blog-list');
    const blogGrid = document.getElementById('blog-grid');
    if (!blogList || !blogGrid) return;

    const lbl = labels();
    const loading = `<div class="blog-loading"><i class="fas fa-spinner"></i><p>${lbl.loading}</p></div>`;
    blogList.innerHTML = loading;
    blogGrid.innerHTML = loading;

    fetch(asset('blog-posts/index.json'))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((posts) => {
        blogPosts = posts;
        updateBlogCount(posts.length);
        renderBlogPosts();
      })
      .catch((error) => {
        console.error('Error loading blog posts:', error);
        const err = `<div class="blog-empty"><i class="fas fa-exclamation-triangle"></i><h3>${lbl.errorTitle}</h3><p>${lbl.errorBody}</p></div>`;
        blogList.innerHTML = err;
        blogGrid.innerHTML = err;
      });
  }

  function init() {
    document.querySelectorAll('.view-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', function () {
        switchView(this.getAttribute('data-view'));
      });
    });
    loadBlogPosts();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
