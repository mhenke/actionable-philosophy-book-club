(function() {
    try {
        const theme = localStorage.getItem('apbc:theme');
        if (theme === 'dark') {
            document.documentElement.classList.add('dark-theme');
        } else if (theme === 'light') {
            document.documentElement.classList.add('light-theme');
        }
    } catch (e) {
        // Ignore storage access errors
    }
})();
