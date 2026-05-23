/**
 * Post-processes rendered markdown to turn "## Meeting Materials" lists into a styled file tree.
 *
 * Public API:
 * - _applyMeetingMaterialsTree(container): finds Meeting Materials ULs and converts them to file tree panels
 *
 * Side-effects: mutates DOM under the provided container.
 */
function _applyMeetingMaterialsTree(container) {
    container.querySelectorAll('h2').forEach(h2 => {
        if (!/meeting materials/i.test(h2.textContent)) return;
        let el = h2.nextElementSibling;
        while (el && el.tagName !== 'H2') {
            if (el.tagName === 'UL') {
                el.classList.add('materials-panel');
                _renderFileTree(el, '');
            }
            el = el.nextElementSibling;
        }
    });
}

/** Prepends tree connectors (├──/└──) to list items. Recursively processes nested ULs. */
function _renderFileTree(ul, prefix) {
    const items = Array.from(ul.children);
    for (const [i, li] of items.entries()) {
        if (li.querySelector(':scope > .tree-connector')) continue;
        const firstAnchor = li.querySelector(':scope > a');
        if (firstAnchor) {
            const href = firstAnchor.getAttribute('href') || '';
            if (href.endsWith('/') || !href) {
                const span = document.createElement('span');
                span.className = firstAnchor.className || '';
                span.innerHTML = firstAnchor.innerHTML;
                li.replaceChild(span, firstAnchor);
            }
        }
        const isLast = i === items.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        const childPrefix = prefix + (isLast ? '\u00a0   ' : '\u2502   ');
        const pre = document.createElement('span');
        pre.className = 'tree-connector';
        pre.textContent = prefix + connector;
        li.insertBefore(pre, li.firstChild);
        const nested = li.querySelector(':scope > ul');
        if (nested) _renderFileTree(nested, childPrefix);
        li.classList.add(nested ? 'tree-folder' : 'tree-file');
    }
}
