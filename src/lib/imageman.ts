class panzoom {

    private container: HTMLElement;
    private image: HTMLImageElement;

    private x: number = 0;
    private y: number = 0;
    private scale: number = 1;
    private isPanning: boolean = false;

    private endTimeout: number = 0;

    constructor(container: HTMLElement, image: HTMLImageElement) {
        this.container = container;
        this.image = image;
        this.container.addEventListener("wheel", this.onWheel.bind(this));
        this.container.addEventListener("mousedown", this.onMouseDown.bind(this));
        this.container.addEventListener("mouseup", this.onMouseUp.bind(this));
        this.container.addEventListener("mousemove", this.onMouseMove.bind(this));
    }

    private onWheel(e: WheelEvent) {
        e.preventDefault();
        e.stopPropagation();
        const delta = e.deltaY > 0 ? 0.1 : -0.1;
        //apply scale(delta, x, y) x-> position x, y-> position y

        //mouse position relative to the image
        const px = e.offsetX;
        const py = e.offsetY;

        this.applyScale(-delta, px, py);
    }

    private onMouseDown(e: MouseEvent) {

    }

    private onMouseUp(e: MouseEvent) {

    }

    private onMouseMove(e: MouseEvent) {

    }

    private applyScale(delta: number, px: number, py: number) {
    
        this.image.style.transformOrigin = `${px}px ${py}px`;


        this.scale += delta;
        //3d transform
        this.image.style.transform = `translate3d(${this.x * this.scale}px, ${this.y * this.scale}px, 0) scale3d(${this.scale}, ${this.scale}, 1)`;
    
        //max scale is 5x
        if (this.scale > 3.2) {
            this.scale = 3.2;
        }

        //min scale is 1x
        if (this.scale < 0.9) {
            this.scale = 0.9;
        }

        //reset timeout
        clearTimeout(this.endTimeout);

        this.endTimeout = setTimeout(() => {
            //reset the scale
            if (this.scale < 1) {
                this.scale = 1;
                //transition 200ms
                this.image.style.transition = "transform 200ms ease-out";
                this.image.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) scale3d(${this.scale}, ${this.scale}, 1)`;
            } else if (this.scale > 3) {
                this.scale = 3;
                //transition 200ms
                this.image.style.transition = "transform 200ms ease-out";
                this.image.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) scale3d(${this.scale}, ${this.scale}, 1)`;
            }

            //set the transform metrics as original position

            this.x = this.x * this.scale;
            this.y = this.y * this.scale;

            this.image.style.top = `${this.y}px`;
            this.image.style.left = `${this.x}px`;

            //remove transition
            this.image.style.transition = "none";
            //reset the transform origin
            this.image.style.transformOrigin = "0 0";
            //reset the transform
            this.image.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) scale3d(${this.scale}, ${this.scale}, 1)`;

        }, 100);
    }
}

export function PanZoom(container: HTMLElement, image: HTMLImageElement) {
    return new panzoom(container, image);
}