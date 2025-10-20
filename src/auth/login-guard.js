(async () => {
    const email = sessionStorage.getItem('email');
    if (email) {
        window.location.replace('/pages/posts.html');
    }
})();