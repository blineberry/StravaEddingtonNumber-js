function handleShare(e) {
    navigator.share({
        url: e.target.dataset.url,
        title: e.target.dataset.title,
        text: e.target.dataset.text
    });
}

function shareButtonInit() {
    let shareButton = document.getElementById('share-button');
    shareButton.className = shareButton.className + ' share-supported';

    shareButton.addEventListener('click', handleShare);
};

if (navigator.share) {
    shareButtonInit();
}