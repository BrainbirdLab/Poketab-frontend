
type Options = {
	minScale: number;
	maxScale: number;
	increment: number;
	liner: boolean;
}

type TransformMatrix = {
	scale: number;
	transX: number;
	transY: number;
}

// Inital method to call to apply PanZoom to elements given a selector
export function PanZoom(element: HTMLElement, opts: Options) {
	opts = opts || {};
	const minScale = (opts.minScale ? opts.minScale : 1);
	const maxScale = (opts.maxScale ? opts.maxScale : 3);
	const increment = (opts.increment ? opts.increment  : 0.05);
	const liner = (opts.liner ? opts.liner  : false);
	new AttachPanZoom(element, minScale , maxScale, increment, liner);
}

// Appy PanZoom functionality to a given element, allow user defined zoom min and inc per scroll
class AttachPanZoom {

	increment: number;
	minScale: number;
	maxScale: number;
	liner: boolean;
	panning: boolean;
	oldX: number;
	oldY: number;
	currentScale: number;
	initialDistance: number;
	initialScale: number;
	element: HTMLElement;

	constructor(ele: HTMLElement, minScale: number, maxScale: number, increment: number, liner: any) {
		this.increment = increment;
		this.minScale = minScale;
		this.maxScale = maxScale;
		this.liner = liner;
		this.panning = false;
		this.oldX = this.oldY = 0;
		this.currentScale = 1;
		this.initialDistance = 0;
		this.initialScale = 1;
		this.element = ele;
		const self = this;
		this.element.style.transform = 'matrix(1, 0, 0, 1, 0, 0)';

		// Capture when the mouse is down on the element or not
		this.element.addEventListener('mousedown', function (e) {
			e.preventDefault();
			//grab panning from the parent scope
			self.panning = true;
			self.oldX = e.clientX;
			self.oldY = e.clientY;
			this.style.transition = '0ms';
			this.style.cursor = 'grabbing';
		});

		this.element.addEventListener('mouseup', function () { 
			self.panning = false; 
			this.style.transition = '100ms';
		});
		this.element.addEventListener('mouseleave', function () { 
			self.panning = false; 
			this.style.transition = '100ms';
		});

		this.element.addEventListener('mousemove', function (e) {
			if (self.panning) {
				const deltaX = e.clientX - self.oldX;
				const deltaY = e.clientY - self.oldY;
				applyTranslate(deltaX, deltaY);
				self.oldX = e.clientX;
				self.oldY = e.clientY;
			}
		});

		function reset() {
			const newTrans = getTransformMatrix();
			newTrans.scale = 1;
			newTrans.transX = 0;
			newTrans.transY = 0;
			setTransformMatrix(newTrans);
		}

		//double tap to reset
		this.element.addEventListener('dblclick', reset);


		this.element.addEventListener('touchstart', function (e) {
			e.preventDefault();
			if (e.touches.length === 1) {
				self.panning = true;
				self.oldX = e.touches[0].clientX;
				self.oldY = e.touches[0].clientY;
			} else if (e.touches.length === 2) {
				// store initial distance for continuous zoom
				const point1 = e.touches[0];
				const point2 = e.touches[1];
				self.initialDistance = Math.sqrt(Math.pow(point1.clientX - point2.clientX, 2) + Math.pow(point1.clientY - point2.clientY, 2));
				self.initialScale = self.currentScale;
			}
		});

		this.element.addEventListener('touchmove', function (e) {
			if (self.panning) {
				e.preventDefault();
				const deltaX = e.touches[0].clientX - self.oldX;
				const deltaY = e.touches[0].clientY - self.oldY;
				applyTranslate(deltaX, deltaY);
				self.oldX = e.touches[0].clientX;
				self.oldY = e.touches[0].clientY;
			}
			if (e.touches.length === 2) {
				const point1 = e.touches[0];
				const point2 = e.touches[1];
				const dist = Math.sqrt(Math.pow(point1.clientX - point2.clientX, 2) + Math.pow(point1.clientY - point2.clientY, 2));
				const centerX = (point1.clientX + point2.clientX) / 2;
				const centerY = (point1.clientY + point2.clientY) / 2;
				const dscale = (dist - self.initialDistance) / 10000;
				applyScale(dscale, centerX, centerY);
			}
		});

		this.element.addEventListener('touchend', function (e) {
			if (e.touches.length === 1) {
				self.panning = true;
				self.oldX = e.touches[0].clientX;
				self.oldY = e.touches[0].clientY;
			} else if (e.touches.length === 0) {
				self.panning = false;
				self.initialDistance = 0;
			}
		});

		this.element.addEventListener('touchcancel', function () {
			self.panning = false;
		});

		/*
		this.element.addEventListener('DOMMouseScroll', getScrollDirection, false);
		this.element.addEventListener('mousewheel', getScrollDirection, false);
		*/
		this.element.addEventListener('wheel', getScrollDirection, false);

		// Gets the current Scale, along with transX and transY
		function getScrollDirection(e: WheelEvent) {
			const delta = Math.max(-1, Math.min(1, (e.deltaY || -e.detail)));
			if (delta < 0){
				applyScale(-self.increment, e.offsetX, e.offsetY);
			}
			else{
				applyScale(self.increment, e.offsetX, e.offsetY);
			}
		};

		function getTransformMatrix (): TransformMatrix {
			const trans = self.element.style.transform;
			const start = trans.indexOf('(') + 1;
			const end = trans.indexOf(')');
			const matrix = trans.slice(start, end).split(',');
			return {
				scale: +matrix[0],
				transX: +matrix[4],
				transY: +matrix[5]
			};
		};
	
		// Given the scale, translateX and translateY apply to CSSS transform
		function setTransformMatrix(o: TransformMatrix) {
			self.element.style.transform = 'matrix(' + o.scale + ', 0, 0, ' + o.scale + ', ' + o.transX + ', ' + o.transY + ')';
		};
	
		function applyTranslate(dx: number, dy: number) {
			const newTrans = getTransformMatrix();
			newTrans.transX += dx;
			newTrans.transY += dy;
			setTransformMatrix(newTrans);
		};
	
		// Applying Deltas to Scale and Translate transformations
		function applyScale(dscale: number, x: number, y: number) {
			const newTrans = getTransformMatrix();
			const width = self.element.style.width ? Number(self.element.style.width) : self.element.offsetWidth;
			const height = self.element.style.height ? Number(self.element.style.height) : self.element.offsetHeight;
			const tranX = x - (width / 2);
			const tranY = y - (height / 2);
			dscale = (self.liner ? dscale : dscale * (newTrans.scale)); // scale either liner or non-liner 
			newTrans.scale += dscale;
			const maxOrMinScale = (newTrans.scale <= self.minScale || newTrans.scale >= self.maxScale);
			if (newTrans.scale < self.minScale)
				newTrans.scale = self.minScale;
			if (newTrans.scale > self.maxScale)
				newTrans.scale = self.maxScale;
			if (!maxOrMinScale) {
				applyTranslate(tranX, tranY);
				setTransformMatrix(newTrans);
				applyTranslate(-(tranX * dscale), -(tranY * dscale));
			}
		};
	}
}