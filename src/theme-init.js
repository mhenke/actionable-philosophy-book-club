(function() {
    try {
        const theme = localStorage.getItem('apbc:theme');
        if (theme === 'dark') {
            document.documentElement.classList.add('dark-theme');
        } else if (theme === 'light') {
            document.documentElement.classList.add('light-theme');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark-theme');
        }
    } catch (e) {
        // Ignore storage access errors
    }
})();
