import { Coord, DraggableFactory } from "./Draggable";

class Settings {
    public static FPS = 60;

    public static DraggablePerRow = 5;
    public static DraggablePerColumn = 5;

    //constructor(protected canvas: HTMLCanvasElement) {}
}

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const MAXIMAGESIZE: Coord = [canvas.width - 100, canvas.height / 2];

let lastFrame = 0;

let image: HTMLImageElement;

fetch("https://api.thecatapi.com/v1/images/search")
    .then(res => res.json())
    .then(json => {
        /* let [width, height] = [json[0].width, json[0].height];
        //reduce image size to fit in canvas
        let scale = 1;
        if (width > MAXIMAGESIZE[0]) scale = MAXIMAGESIZE[0] / width;
        if (height > MAXIMAGESIZE[1]) scale = MAXIMAGESIZE[1] / height;
        width *= scale;
        height *= scale;

        image = new Image(width, height);
        image.src = json[0].url; */

        image = new Image(640, 434);
        image.src = "https://cdn2.thecatapi.com/images/afn.jpg";

        afterImageLoaded();
    });
function afterImageLoaded() {
    let factory = new DraggableFactory(
        canvas,
        ctx,
        image,
        [canvas.width / 2 - image.width / 2, 50],
        [image.width, image.height]
    );

    let xEdge = 0;
    let yEdge = 0;

    let draggables: Coord[][] = [];

    let itemWidth = image.width / Settings.DraggablePerRow;
    let itemHeight = image.height / Settings.DraggablePerColumn;

    while (yEdge < image.height) {
        while (xEdge < image.width) {
            let points: Coord[] = [];

            points.push([xEdge, yEdge]);
            points.push([0, itemHeight]);

            points.push([itemWidth, 0]);
            points.push([0, itemHeight * -1]);
            draggables.push(points);
            xEdge += itemWidth;
        }
        console.log(yEdge);
        yEdge += itemHeight;
        xEdge = 0;
    }

    console.log(draggables);
    for (const points of draggables) {
        factory.AddDraggable(points);
    }

    // factory.AddDraggable([
    //     [0, 0],
    //     [100, 0],
    //     [0, 100],
    //     [-100, 0]
    // ]);
    // factory.AddDraggable([
    //     [110, 0],
    //     [100, 0],
    //     [0, 100],
    //     [-100, 0]
    // ]);

    function gameLoop(time: number) {
        requestAnimationFrame(gameLoop);
        if (!((time - lastFrame) / 1000 > 1 / Settings.FPS)) return;
        lastFrame = time;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        factory.Draw();
    }

    requestAnimationFrame(gameLoop);
}
