let imagesByPath = {};
let currentImageIndex = 0;
let currentPath = '';

function preloadImage(url) {
  const img = new Image();
  img.src = url;
}

function preloadAllImages() {
  const images = imagesByPath[currentPath] || [];
  images.forEach(image => {
    const imgElement = image.querySelector('img');
    const imageUrl = imgElement?.getAttribute('src') || imgElement?.getAttribute('data-src');
    if (imageUrl) {
      preloadImage(imageUrl);
    }
  });
}

function updateCurrentPath() {
  currentPath = publish.currentFilepath;
  if (!imagesByPath[currentPath]) {
    imagesByPath[currentPath] = [];
    preloadAllImages();
  }
}

publish.registerMarkdownPostProcessor(async (el, ctx) => {
  updateCurrentPath();

  const blockImages = Array.from(el.querySelectorAll('.internal-embed'));
  blockImages.forEach((span) => {
    if (!span.classList.contains('processed')) {
      span.classList.add('processed');
      imagesByPath[currentPath].push(span);

      span.addEventListener('click', function() {
        currentImageIndex = imagesByPath[currentPath].indexOf(this);
        const lightboxDiv = document.createElement('div');
        lightboxDiv.classList.add('lightbox');
        const contentToMove = this.cloneNode(true);
        lightboxDiv.appendChild(contentToMove);
        document.body.appendChild(lightboxDiv);

        const removeLightbox = () => {
          document.body.removeChild(lightboxDiv);
          document.removeEventListener('keydown', keyListener);
        };

        lightboxDiv.addEventListener('click', removeLightbox);

        const keyListener = (event) => {
          const images = imagesByPath[currentPath] || [];
          if (event.key === "Escape") {
            removeLightbox();
          } else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            if (event.key === "ArrowRight") {
              currentImageIndex = (currentImageIndex + 1) % images.length;
            } else {
              currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
            }
            lightboxDiv.innerHTML = '';
            const newContent = images[currentImageIndex].cloneNode(true);
            lightboxDiv.appendChild(newContent);
          }
          if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
          }
        };

        document.addEventListener('keydown', keyListener);
        document.body.classList.add('img-grid')
      });
    }
  });
});
