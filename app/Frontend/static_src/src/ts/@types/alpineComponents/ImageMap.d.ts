interface ImageMap {
    $el: HTMLElement;
    map?: L.Map;
    init(): void
    changeImage(imageUrl: string | null): void;
    overlay: L.ImageOverlay | null;
    custom(): void;
}

export {
    ImageMap
}