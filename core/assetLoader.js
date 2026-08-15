// Asset Loader Module
class AssetLoader {
    constructor() {
        this.images = {};
        this.loadedCount = 0;
        this.totalCount = 0;
    }

    async loadImages(imageSources) {
        this.totalCount = Object.keys(imageSources).length;
        this.loadedCount = 0;
        
        const loadPromises = Object.entries(imageSources).map(([key, src]) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.loadedCount++;
                    this.images[key] = img;
                    resolve(img);
                };
                img.onerror = () => {
                    console.error(`Failed to load asset: ${src}`);
                    // Resolve anyway to prevent hanging, just use a broken image
                    this.images[key] = new Image();
                    resolve(this.images[key]);
                };
                img.src = src;
            });
        });

        await Promise.all(loadPromises);
        return this.images;
    }

    getImage(key) {
        return this.images[key];
    }
}

export const assetLoader = new AssetLoader();
