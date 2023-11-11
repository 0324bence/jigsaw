type Coord = [number, number];

class Draggable {
    private doesIntersect: boolean = false;
    private intersectX: number = 0;
    private intersectY: number = 0;
    private originalPoints: Coord[];
    constructor(
        public points: Coord[],
        private image: HTMLImageElement,
        private ctx: CanvasRenderingContext2D,
        private base: Coord
    ) {
        this.originalPoints = [...points];
    }
    Intersects(x: number, y: number): boolean {
        //ctx ispointinpath
        this.intersectX = x;
        this.intersectY = y;
        return this.doesIntersect;
    }
    BoundingBox(): { width: number; height: number } {
        let width = 0;
        let height = 0;

        let maxWidth = 0;
        let maxHeight = 0;

        for (let i = 1; i < this.points.length; i++) {
            width += this.points[i][0];
            height += this.points[i][1];
            if (width > maxWidth) maxWidth = width;
            if (height > maxHeight) maxHeight = height;
        }

        return {
            width: maxWidth,
            height: maxHeight
        };
    }
    Draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.points[0][0] + this.base[0], this.points[0][1] + this.base[1]);
        // for (const point of this.points) {
        //     ctx.lineTo(point[0] + this.base[0], point[1] + this.base[1]);
        // }
        ctx.lineTo(this.points[0][0] + this.base[0], this.points[0][1] + this.base[1]);
        let currpoint = this.points[0];
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(
                currpoint[0] + this.points[i][0] + this.base[0],
                currpoint[1] + this.points[i][1] + this.base[1]
            );
            currpoint = [currpoint[0] + this.points[i][0], currpoint[1] + this.points[i][1]];
        }
        ctx.lineTo(this.points[0][0] + this.base[0], this.points[0][1] + this.base[1]);
        this.doesIntersect = ctx.isPointInPath(this.intersectX, this.intersectY);
        ctx.stroke();
        ctx.closePath();
        ctx.clip();
        let imagePos = this.originalPoints[0];
        //console.log(imagePos[0], imagePos[1]);
        ctx.drawImage(
            this.image,
            imagePos[0],
            imagePos[1],
            100,
            100,
            this.base[0] + this.points[0][0],
            this.base[1] + this.points[0][1],
            100,
            100
        );
        ctx.restore();
    }
}

class DraggableFactory {
    public draggables: Draggable[] = [];
    private currentDraggable: Draggable | undefined;
    private isDragging: boolean = false;
    private dragOrigin: Coord = [0, 0];
    private elementOrigin: Coord = [0, 0];
    constructor(
        private canvas: HTMLCanvasElement,
        private ctx: CanvasRenderingContext2D,
        private image: HTMLImageElement,
        private base: Coord = [0, 0],
        private size: Coord
    ) {
        this.canvas.addEventListener("mousemove", event => {
            if (this.isDragging && this.currentDraggable) {
                //if (event.offsetX - this.dragOrigin[0] == 0 && event.offsetY - this.dragOrigin[1] == 0) return;
                let [x, y] = this.elementOrigin;
                let box = this.currentDraggable.BoundingBox();
                console.log(box);
                let newX = x + (this.dragOrigin[0] - event.offsetX) * -1;
                let newY = y + (this.dragOrigin[1] - event.offsetY) * -1;
                if (newX < 0) newX = 0;
                if (newY < 0) newY = 0;
                if (newX > this.size[0] - box.width) newX = this.size[0] - box.width;
                if (newY > this.size[1] - box.height) newY = this.size[1] - box.height;

                this.currentDraggable.points[0] = [newX, newY];
            }
        });
        this.canvas.addEventListener("mousedown", event => {
            for (const draggable of this.draggables) {
                if (draggable.Intersects(event.offsetX, event.offsetY)) {
                    this.currentDraggable = draggable;
                    this.isDragging = true;
                    this.dragOrigin = [event.offsetX, event.offsetY];
                    this.elementOrigin = draggable.points[0];
                    this.draggables.splice(this.draggables.indexOf(draggable), 1);
                    this.draggables.push(draggable);
                    return;
                }
            }
        });
        this.canvas.addEventListener("mouseup", () => {
            this.isDragging = false;
            this.currentDraggable = undefined;
        });
    }
    public Draw() {
        //Draw drag area border
        for (const draggable of this.draggables) {
            draggable.Draw(this.ctx);
        }
        this.ctx.save();
        this.ctx.rect(this.base[0], this.base[1], this.size[0], this.size[1]);
        this.ctx.stroke();
        this.ctx.restore();
    }
    public AddDraggable(points: Coord[]) {
        this.draggables.push(new Draggable(points, this.image, this.ctx, this.base));
    }
}

export { DraggableFactory };
export type { Coord };
