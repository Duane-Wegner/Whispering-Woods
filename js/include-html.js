// Simple ES module to inject external HTML fragments into placeholders.
// Usage: add an element with `data-include="./components/header.html"`.
// Works on static hosting (GitHub Pages) because it uses fetch and relative URLs.

export async function includeFragments(root = document) {
  // Collect all placeholders that request a fragment include
  const nodes = Array.from(root.querySelectorAll('[data-include]'));

  // Parallelize fetches but allow each to handle its own errors gracefully
  await Promise.all(nodes.map(async (node) => {
    const url = node.getAttribute('data-include');
    if (!url) return;

    try {
      // Development-focused: bypass any local cache so edits appear immediately.
      // For production, you may want to remove this option or control it via
      // a build-time flag to leverage browser caching.
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);

      const text = await res.text();

      // Insert content. Intentionally do a straight innerHTML injection; keep
      // content trusted and static.
      node.innerHTML = text;

      // Remove the attribute to signal inclusion is done and prevent re-insert.
      node.removeAttribute('data-include');

      // Optional: run microtasks or small initialization if the fragment needs it.
      // e.g., if fragments contain widgets that expect to run on DOMContentLoaded,
      // call their init functions here (prefer exported modules instead).
    } catch (err) {
      // Keep a visible, non-intrusive marker for debugging/integration testing
      // and log the error for developers. Do not surface raw error messages
      // to end users in production UI.
      console.error('include-html error:', err);
      node.innerHTML = `<!-- include failed: ${url} -->`;
    }
  }));
}

// Auto-run convenience: if this module is imported in a page, start inclusion
// right away. This keeps page markup simple: import the module and add
// `data-include` attributes where you want fragments.
if (typeof document !== 'undefined') {
  if (document.readyState !== 'loading') {
    includeFragments().catch(e => console.error('includeFragments failed:', e));
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      includeFragments().catch(e => console.error('includeFragments failed:', e));
    });
  }
}
