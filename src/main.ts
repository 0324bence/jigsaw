import { DraggableFactory } from "./Draggable";

class Settings {
    public static FPS = 60;

    //constructor(protected canvas: HTMLCanvasElement) {}
}

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

let lastFrame = 0;

let image: HTMLImageElement;

fetch("https://api.thecatapi.com/v1/images/search")
    .then(res => res.json())
    .then(json => {
        let [width, height] = [json[0].width, json[0].height];
        //reduce image size to fit in canvas
        let scale = 1;
        if (width > canvas.width - 100) scale = (canvas.width - 100) / width;
        if (height > canvas.height / 2) scale = canvas.height / 2 / height;
        width *= scale;
        height *= scale;

        image = new Image(width, height);
        image.src = json[0].url;

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
