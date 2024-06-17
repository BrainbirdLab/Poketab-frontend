
type Options = {
	minScale: number;
	maxScale: number;
	increment: number;
	linear: boolean;
}

type TransformMatrix = {
	scale: number;
	transX: number;
	transY: number;
}

// Inital method to call to apply PanZoom to elements given a selector
// Inital method to call to apply PanZoom to elements given a selector
export function PanZoom(element: HTMLImageElement, opts: Options = {
	minScale: 0.6,
	maxScale: 3,
	increment: 0.05,
	linear: false
}) {
	const minScale = opts.minScale;
	const maxScale = opts.maxScale;
	const increment = opts.increment;
	const liner = opts.linear;
	new AttachPanZoom(element, minScale, maxScale, increment, liner);
}

// Appy PanZoom functionality to a given element, allow user defined zoom min and inc per scroll
class AttachPanZoom {

	element: HTMLImageElement;
	increment: number;
	minScale: number;
	maxScale: number;
	liner: boolean;
	panning: boolean;
	oldX: number;
	oldY: number;
	currentScale: number;
	initialDistance: number;
	lastTouchTime: number;
	touchTimer: number;

	wheelEndTimeout: number;
	
	// Gets the current Scale, along with transX and transY
	getTransformMatrix: () => TransformMatrix;
	// Sets the current Scale, along with transX and transY
	setTransformMatrix: (matrix: TransformMatrix) => void;
	// Applies a translation to the current Scale, along with transX and transY
	applyTranslate: (transX: number, transY: number) => void;
	// Applies a scale to the current Scale, along with transX and transY
	applyScale: (scale: number, x: number, y: number) => void;
	//scroll direction
	getScrollDirection: EventListener;

	constructor(ele: HTMLImageElement, minScale: number, maxScale: number, increment: number, liner: boolean) {
		this.increment = increment;
		this.minScale = minScale;
		this.maxScale = maxScale;
		this.liner = liner;
		this.panning = false;
		this.oldX = this.oldY = 0;
		this.currentScale = 1;
		this.initialDistance = 0;
		this.lastTouchTime = 0;
		this.touchTimer = 0;
		this.wheelEndTimeout = 0;

		const self = this;
		this.element = ele;

		ele.style.transform = 'matrix(1, 0, 0, 1, 0, 0)';

		// Gets the current Scale, along with transX and transY
		this.getTransformMatrix = function () {
			const trans = ele.style.transform;
			const start = trans.indexOf('(') + 1;
			const end = trans.indexOf(')');
			const matrix = trans.slice(start, end).split(',');
			return {
				'scale': +matrix[0],
				'transX': +matrix[4],
				'transY': +matrix[5]
			};
		};

		// Given the scale, translateX and translateY apply to CSSS transform
		this.setTransformMatrix = function (o) {
			ele.style.transform = 'matrix(' + o.scale + ', 0, 0, ' + o.scale + ', ' + o.transX + ', ' + o.transY + ')';
		};

		this.applyTranslate = function (dx, dy) {
			const newTrans = this.getTransformMatrix();
			newTrans.transX += dx;
			newTrans.transY += dy;
			this.setTransformMatrix(newTrans);
		};

		// Applying Deltas to Scale and Translate transformations
		this.applyScale = function (dscale, x, y) {
			const newTrans = this.getTransformMatrix();
			const width = ele.width ? ele.width : ele.offsetWidth;
			const height = ele.height ? ele.height : ele.offsetHeight;
			const tranX = x - (width / 2);
			const tranY = y - (height / 2);
			dscale = (this.liner ? dscale : dscale * (newTrans.scale)); // scale either liner or non-liner 
			newTrans.scale += dscale;
			this.currentScale = newTrans.scale;

			const maxOrMinScale = (newTrans.scale <= this.minScale || newTrans.scale >= this.maxScale);
			if (newTrans.scale < this.minScale)
				newTrans.scale = this.minScale;
			if (newTrans.scale > this.maxScale)
				newTrans.scale = this.maxScale;
			if (!maxOrMinScale) {
				this.applyTranslate(tranX, tranY);
				this.setTransformMatrix(newTrans);
				this.applyTranslate(-(tranX * dscale), -(tranY * dscale));
			}
		};

		// Capture when the mouse is down on the element or not
		ele.addEventListener('mousedown', function (e) {
			e.preventDefault();
			self.panning = true;
			self.oldX = e.clientX;
			self.oldY = e.clientY;
			self.element.style.transition = 'none';
			self.element.style.cursor = 'grabbing';
		});

		ele.addEventListener('mouseup', function () {
			self.panning = false;

			self.element.style.cursor = 'grab';

			//if scale is less than 1, reset to 1
			if (self.currentScale < 1) {
				reset();
			}
		});
		ele.addEventListener('mouseleave', function () {
			self.panning = false;
			self.element.style.cursor = 'grab';

			//if scale is less than 1, reset to 1
			if (self.currentScale < 1) {
				reset();
			}
		});

		ele.addEventListener('mousemove', function (e) {
			if (self.panning) {
				const deltaX = e.clientX - self.oldX;
				const deltaY = e.clientY - self.oldY;
				self.applyTranslate(deltaX, deltaY);
				self.oldX = e.clientX;
				self.oldY = e.clientY;
			}
		});

		function reset() {
			const newTrans = self.getTransformMatrix();
			newTrans.scale = 1;
			newTrans.transX = 0;
			newTrans.transY = 0;

			self.element.style.transition = '200ms';

			self.setTransformMatrix(newTrans);
		}

		//double tap to reset
		ele.addEventListener('dblclick', reset);


		ele.addEventListener('touchstart', function (e) {
			e.preventDefault();
			e.stopPropagation();
			if (e.touches.length === 1) {
				self.panning = true;
				self.oldX = e.touches[0].clientX;
				self.oldY = e.touches[0].clientY;
			} else if (e.touches.length === 2) {
				// store initial distance for continuous zoom
				const point1 = e.touches[0];
				const point2 = e.touches[1];
				self.initialDistance = Math.sqrt(Math.pow(point1.clientX - point2.clientX, 2) + Math.pow(point1.clientY - point2.clientY, 2));
			}

			const currentTime = new Date().getTime();
			const tapLength = currentTime - self.lastTouchTime;
			clearTimeout(self.touchTimer);
			if (tapLength < 500 && tapLength > 0) {
				reset();
			} else {
				self.lastTouchTime = currentTime;
				self.touchTimer = setTimeout(function () {
					clearTimeout(self.touchTimer);
				}, 500);
			}
		});

		ele.addEventListener('touchmove', function (e) {
			e.preventDefault();
			e.stopPropagation();
			if (self.panning) {
				const deltaX = e.touches[0].clientX - self.oldX;
				const deltaY = e.touches[0].clientY - self.oldY;
				self.applyTranslate(deltaX, deltaY);
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
				self.applyScale(dscale, centerX, centerY);
			}
		});

		ele.addEventListener('touchend', function (e) {
			if (e.touches.length === 1) {
				self.panning = true;
				self.oldX = e.touches[0].clientX;
				self.oldY = e.touches[0].clientY;
			} else if (e.touches.length === 0) {
				self.panning = false;
				self.initialDistance = 0;
			}

			//if scale is less than 1, reset to 1
			if (self.currentScale < 1) {
				reset();
			}
		});

		ele.addEventListener('touchcancel', function () {
			self.panning = false;

			//if scale is less than 1, reset to 1
			if (self.currentScale < 1) {
				reset();
			}
		});


		this.getScrollDirection = function (evt: Event) {

			const e: WheelEvent = evt as WheelEvent;

			if (e.deltaY < 0) {
				self.applyScale(self.increment, e.offsetX, e.offsetY);
			}
			else {
				self.applyScale(-self.increment, e.offsetX, e.offsetY);
			}

			clearTimeout(self.wheelEndTimeout);

			self.wheelEndTimeout = setTimeout(() => {
				if (self.currentScale < 1) {
					reset();
				}
			}, 120);
		};

		ele.addEventListener('DOMMouseScroll', self.getScrollDirection, false);
		ele.addEventListener('mousewheel', self.getScrollDirection, false);
	}
}