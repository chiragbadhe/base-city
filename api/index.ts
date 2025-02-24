import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHash } from "crypto";
import nodeHtmlToImage from "node-html-to-image";

type BaseParams = {
  address: `0x${string}`;
  data?: string;
};

class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed ^= this.seed << 13;
    this.seed ^= this.seed >> 17;
    this.seed ^= this.seed << 5;
    return Math.abs(this.seed % 1000) / 1000;
  }

  nextRange(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

function generateSeed(address: string, data?: string): number {
  const input = data ? `${address}-${data}` : address;
  const hash = createHash("sha256").update(input).digest("hex");
  return parseInt(hash.slice(0, 8), 16);
}

// Helper functions for city generation
function generateRandomNumber(random: SeededRandom, min: number, max: number) {
  return random.nextRange(min, max);
}

function chooseColorPalette(random: SeededRandom) {
  const colors = [
    [
      [196, 41, 95],
      [15, 8, 91],
      [22, 12, 53],
      [228, 5, 20],
      [210, 12, 62],
      [194, 101, 43],
    ],
    [
      [196, 41, 95],
      [226, 100, 94],
      [30, 16, 75],
      [292, 21, 43],
      [274, 45, 24],
      [249, 59, 13],
    ],
    [
      [196, 41, 95],
      [29, 71, 89],
      [15, 68, 67],
      [330, 39, 54],
      [267, 51, 14],
      [285, 80, 2],
    ],
    [
      [196, 41, 95],
      [212, 30, 89],
      [193, 38, 17],
      [9, 29, 42],
      [15, 31, 54],
      [191, 14, 53],
    ],
    [
      [196, 41, 95],
      [29, 52, 87],
      [21, 60, 73],
      [8, 12, 62],
      [280, 4, 15],
      [12, 24, 24],
    ],
    [
      [196, 41, 95],
      [202, 35, 85],
      [28, 56, 79],
      [34, 70, 61],
      [300, 5, 29],
      [292, 16, 10],
    ],
    [
      [39, 52, 6],
      [20, 14, 17],
      [229, 19, 34],
      [224, 36, 56],
      [233, 47, 74],
      [39, 47, 74],
    ],
    [
      [194, 100, 28],
      [36, 99, 47],
      [198, 33, 76],
      [81, 49, 53],
      [192, 67, 55],
      [28, 99, 72],
    ],
  ];
  return colors[generateRandomNumber(random, 0, colors.length - 1)];
}

function generateWindows(random: SeededRandom, min: number, max: number) {
  const windowColors = [
    "#fff",
    "#effcff",
    "#e2eef1",
    "#ebe4d4",
    "#eae9eb",
    "#e5edfd",
  ];
  const windowColor =
    windowColors[generateRandomNumber(random, 0, windowColors.length - 1)];
  const windowNumber = generateRandomNumber(random, min, max);
  let string = "";
  for (let w = 0; w < windowNumber; w++) {
    string += `<div class="window" style="background: ${windowColor}"></div>`;
  }
  return string;
}

function chooseBuildingStyle(random: SeededRandom) {
  const stylesArray = [
    "-style1",
    "-style2",
    "-style3",
    "-style4",
    "-style5",
    "-style6",
    "-style7",
    "-style8",
    "-style9",
    "-style10",
    "-style11",
  ];
  return stylesArray[generateRandomNumber(random, 0, stylesArray.length - 1)];
}

function generateCityHtml(random: SeededRandom) {
  let cityWidth = 19;
  let cityHeight = 32;
  let rows = 8;

  const minimumBuildingHeight = cityHeight / rows;
  const colorsArray = chooseColorPalette(random);

  let buildingsHtml = "";

  // Generate rows and buildings
  for (let r = 1; r <= rows; r++) {
    const decrement = 100 / rows;
    let counter = 0 - decrement;
    counter = counter + decrement * r;
    const bottom = counter + "%";

    let rowHtml = `<div class="row${r}" style="bottom: ${bottom}">`;

    // Generate buildings for each row
    for (
      let b = 1;
      b < generateRandomNumber(random, rows + rows / 3, rows * 2);
      b++
    ) {
      const theColor = colorsArray[generateRandomNumber(random, 0, 5)];
      const height =
        minimumBuildingHeight +
        minimumBuildingHeight / generateRandomNumber(random, 3, 10);

      rowHtml += `
        <div class="building${chooseBuildingStyle(random)}" 
             style="background-color: hsl(${theColor[0]}, ${theColor[1]}%, ${
        theColor[2]
      }%);
                    border-left: 0.5rem solid hsl(${theColor[0]}, ${
        theColor[1] - 30
      }%, ${theColor[2] - 30}%);
                    border-top: 0.2rem solid hsl(${theColor[0]}, ${
        theColor[1] - 30
      }%, ${theColor[2] - 30}%);
                    border-right: 1px solid hsl(${theColor[0]}, ${
        theColor[1] - 30
      }%, ${theColor[2] - 30}%);
                    height: ${height}rem;">
          ${generateWindows(random, 70, 90)}
        </div>`;
    }

    rowHtml += "</div>";
    buildingsHtml += rowHtml;
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <style>
          :root {
            font-size: calc(0.5em + 1vw);
            --city-width: ${cityWidth}rem;
            --city-height: ${cityHeight}rem;
            --rows: ${rows};
          }
                #wrapper {
        margin: auto;
        text-align: center;
      }
      #city {
        width: var(--city-height);
        height: var(--city-height);
        margin: 0 auto;
        transform: scale(1, -1);
        position: relative;
        overflow: hidden;
        outline: 1.5rem solid white;
      }
      /* ROW, BUILDING AND WINDOW STYLES */
      div[class*="row"] {
        height: calc(var(--city-height) / var(--rows));
        overflow: hidden;
        display: flex;
        overflow: visible;
        position: absolute;
        bottom: 0;
        left: -2rem;
        background: grey;
      }
      div[class*="building"] {
        display: grid;
        transform: scale(1, -1);
        border-radius: 2px;
        margin-left: 0.2rem;
        overflow: hidden;
      }
      div[class*="window"] {
        width: calc(var(--city-width) / 80);
        height: calc(var(--city-height) / 50);
        border: 1px solid #554e50;
      }
      .building-style1 {
        grid-template-columns: repeat(10, 1fr);
        grid-gap: 0.5rem;
        padding: 0.8rem 0.5rem;
      }
      .building-style1 .window {
        width: calc(var(--city-width) / 25);
        border-bottom: 0.2rem double;
        opacity: 0.7;
      }
      .building-style1 > div:nth-of-type(3n) {
        opacity: 1 !important;
      }
      .building-style2 {
        grid-template-columns: repeat(15, 1fr);
        grid-gap: 0.05rem;
        padding: 0.1rem 0.1rem;
      }
      .building-style2 > div:nth-of-type(11n) {
        opacity: 0.5 !important;
      }
      .building-style2 > div:nth-of-type(5n) {
        opacity: 1 !important;
      }
      .building-style3 {
        grid-template-columns: repeat(5, 1fr);
        grid-gap: 1rem;
        padding: 1rem 1rem;
      }
      .building-style3 > div:nth-of-type(13n) {
        background-color: transparent !important;
        border: none;
      }
      .building-style3 .window {
        border-top-left-radius: 50rem;
        border-top-right-radius: 50rem;
        border-top: 0.3rem solid #c1c1c1;
        border-right: 0.3rem solid #c1c1c1;
        border-left: 0.3rem solid #c1c1c1;
        border-bottom: 0.3rem double grey;
        border-width: 0.1rem;
        height: calc(var(--city-height) / 22);
      }
      .building-style4 {
        grid-template-columns: repeat(22, 1fr);
        padding: 1.1rem 0.8rem;
      }
      .building-style4 > div:nth-of-type(11n),
      .building-style4 > div:nth-of-type(12n) {
        background-color: transparent !important;
        border: none;
      }
      .building-style4 .window {
        border: 1px solid grey;
      }
      .building-style5 {
        grid-template-columns: repeat(11, 1fr);
        grid-gap: 0.05rem;
        padding: 0.8rem 0.2rem;
      }
      .building-style5 .window {
        opacity: 0.8;
      }
      .building-style5 > div:nth-of-type(5n) {
        opacity: 1 !important;
      }
      .building-style5 > div:nth-of-type(27n) {
        opacity: 0.5 !important;
      }
      .building-style6 {
        grid-template-columns: repeat(7, 1fr);
        grid-gap: 0.1rem;
        padding: 0.5rem 0.4rem;
      }
      .building-style6 .window {
        border-bottom: 0.3rem double grey;
      }
      .building-style7 {
        grid-template-columns: repeat(30, 1fr);
        grid-gap: 0.3rem;
        padding: 1rem;
      }
      .building-style7 .window {
        height: calc(var(--city-height) / 28);
      }
      .building-style7 > div:nth-of-type(5n) {
        opacity: 0.5 !important;
      }
      .building-style8 {
        grid-template-columns: repeat(8, 1fr);
        grid-gap: 0.1rem;
        padding: 0.5rem 1rem;
      }
      .building-style8 > div:nth-of-type(13n) {
        background-color: transparent !important;
      }
      .building-style8 > div:nth-of-type(3n) {
        opacity: 0.5;
      }
      .building-style8 > div:nth-of-type(35n) {
        background-color: lightgrey;
      }
      .building-style8 > div:nth-of-type(27n) {
        opacity: 0.5 !important;
      }
      .building-style9 {
        grid-template-columns: repeat(6, 1fr);
        grid-gap: 0.05rem;
        padding: 1rem;
      }
      .building-style10 {
        grid-template-columns: repeat(18, 1fr);
        grid-gap: 0.05rem;
        padding: 0.5rem 1rem;
      }
      .building-style10 > div:nth-of-type(35n) {
        background-color: transparent !important;
        border: none;
      }
      .building-style10 > div:nth-of-type(3n) {
        opacity: 1 !important;
      }
      .building-style10 .window {
        border-top-left-radius: 50%;
        opacity: 0.7;
      }
      .building-style11 {
        grid-template-columns: repeat(13, 1fr);
        grid-gap: 0.05rem;
        padding: 0.5rem 0.2rem;
      }
      .building-style11 .window {
        border-style: double;
        border: 0.1rem double #554e50;
      }
        </style>
      </head>
      <body>
        <section id="wrapper">
          <div id="city">
            ${buildingsHtml}
          </div>
        </section>
      </body>
    </html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { address, data } = req.query as BaseParams;

    if (!address) {
      return res
        .status(400)
        .json({ error: "Valid Ethereum address is required" });
    }

    const seed = generateSeed(address, data);
    const random = new SeededRandom(seed);

    // Generate random number of rows (6-12)
    const rows = random.nextRange(6, 12);

    // Generate the complete HTML content
    const htmlContent = generateCityHtml(random);

    // Generate image from HTML
    const image = await nodeHtmlToImage({
      html: htmlContent,
      quality: 100,
      type: "png",
      puppeteerArgs: {
        defaultViewport: {
          width: 400,
          height: 500,
        },
      },
    });

    res.setHeader("Content-Type", "image/png");
    res.send(image);
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
