function _scrollToElement(el) {
    const rect = el.getBoundingClientRect();
    const offset = 96;
    window.scrollTo({
        top: window.scrollY + rect.top - offset,
        behavior: 'smooth'
    });
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
}

function buildTableOfContents(h2Elements) {
    if (h2Elements.length < 2) return null;
    const tocItems = Array.from(h2Elements).map((h2, idx) => {
        if (!h2.id) {
            h2.id = h2.textContent.trim().toLowerCase()
                .replace(/[^a-z0-9_-]+/g, '-')
                .replace(/^-+|-+$/g, '') || `section-${idx}`;
        }
        return `<li><a href="#${h2.id}" class="text-spectrum-2 hover:underline flex items-center gap-2" style="font-size:0.8125rem; font-weight:400;"><span style="opacity:0.6;font-size:0.75rem;">\u21b3</span> ${h2.textContent.trim()}</a></li>`;
    }).join('');

    return `
                <nav class="toc-container mb-8 p-5 rounded border-l-2" style="background: var(--materials-panel-bg); border-color: var(--spectrum-3);" aria-label="Table of contents">
                    <p class="text-[0.6875rem] font-bold uppercase tracking-[0.2em] mb-3" style="color: var(--text-muted); margin-top:0;">Contents</p>
                    <ul class="space-y-2" style="margin: 0; padding: 0; list-style-type: none;">
                        ${tocItems}
                    </ul>
                </nav>`;
}
