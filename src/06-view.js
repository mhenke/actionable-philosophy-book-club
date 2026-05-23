        function setView(view) {
            if (view !== 'dashboard') view = 'reader';
            const isDashboard = view === 'dashboard';
            dashboard.classList.toggle('hidden-view', !isDashboard);
            reader.classList.toggle('hidden-view', isDashboard);


            const skipLink = document.querySelector('a[href^="#"]');
            if (skipLink) {
                skipLink.setAttribute('href', isDashboard ? '#main-content' : '#markdown-content');
            }
        }

        function navigateToDashboard() {
            closeVideoPlayer();
            document.title = 'Actionable Philosophy Book Club Dashboard';
            const readerDocLabel = document.getElementById('reader-doc-label');
            if (readerDocLabel) readerDocLabel.textContent = 'Session Notes';
            setView('dashboard');
            readerStatus.textContent = '';
            content.innerHTML = '';
            window.scrollTo(0, 0);
            const mainEl = document.getElementById('main-content');
            if (mainEl) mainEl.focus({ preventScroll: true });
            if (readerStatus) {
                readerStatus.textContent = 'Dashboard';
                setTimeout(() => { if (readerStatus) readerStatus.textContent = ''; }, CONFIG.STATUS_RESET_MS);
            }
        }
