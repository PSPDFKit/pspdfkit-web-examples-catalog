import PSPDFKit from "pspdfkit";
import $ from "jquery";

export async function load(defaultConfiguration) {
  const [instance] = await Promise.all([
    PSPDFKit.load({
      ...defaultConfiguration,
      headless: true
    }),
    loadTurnJs()
  ]);

  const { totalPageCount } = instance;
  const magazine = document.getElementById("magazine");

  // set magazine dimensions
  const { width: pageWidth, height: pageHeight } = instance.pageInfoForIndex(0);
  const ratio = pageHeight / pageWidth;
  const magazineWrapper = document.getElementById("magazineWrapper");
  const { clientWidth, clientHeight } = magazineWrapper;
  // To keep the distance from magazine to controls, we need to include
  // wrapperPadding in the calculation of the magazine's dimensions.
  const wrapperPadding = parseInt(
    window
      .getComputedStyle(magazineWrapper, null)
      .getPropertyValue("padding-bottom")
  );

  const wrapperRatio = clientHeight / clientWidth;

  const isDouble = ratio > wrapperRatio;
  const scaleFactor = isDouble ? 0.5 : 1;

  // Define maximum dimensions so controls still fit
  const minMargin = 10;
  const controlsHeight = $("#controls").height();
  const maxWidth =
    (clientHeight - controlsHeight - minMargin - wrapperPadding) /
    ratio /
    scaleFactor;
  const padding = 0.03; // percent
  const magazineWidth = Math.min(clientWidth * (1 - padding), maxWidth);
  const magazineHeight = magazineWidth * ratio * scaleFactor;

  magazine.style.width = `${magazineWidth}px`;
  magazine.style.height = `${magazineHeight}px`;

  // For each page we create a canvas element, render the page's content into it
  // and append it to our magazine container.
  for (let pageIndex = 0; pageIndex < totalPageCount; pageIndex++) {
    const { width, height } = instance.pageInfoForIndex(pageIndex);

    const canvas = document.createElement("canvas");
    canvas.width = pageWidth * window.devicePixelRatio;
    canvas.height = Math.round((canvas.width * height) / width);

    magazine.appendChild(canvas);

    instance
      .renderPageAsArrayBuffer({ width: canvas.width }, pageIndex)
      .then(buffer => loadBufferIntoCanvas(buffer, canvas));
  }

  // Turn the magazin container into a browsable magazine
  $("#loading").hide();
  $("#totalPages").text(totalPageCount);

  $(magazine)
    .turn({ display: isDouble ? "double" : "single" })
    .fadeIn()
    .bind("turn", (event, page) => $("#currentPage").text(page));

  $("#controls").fadeIn();

  return instance;
}

// This will asynchronously import turn.js so that it is only loaded when this
// catalog example is opened.
async function loadTurnJs() {
  if (typeof window === "undefined") {
    return;
  }
  window.jQuery = $;

  // The turn.js version we're using is having an issue when detecting to touch
  // event support. To fix this we will temporarily remove the touch constructor
  // while the script is loading.
  const originalTouch = window.Touch;
  try {
    const isTouchDevice =
      "ontouchstart" in window || navigator.msMaxTouchPoints;
    if (!isTouchDevice) {
      delete window.Touch;
    }

    await import("./static/turn.js");
  } finally {
    window.Touch = originalTouch;
  }
}

function loadBufferIntoCanvas(buffer, canvas) {
  const imageView = new Uint8Array(buffer);
  const ctx = canvas.getContext("2d");

  const imageData = ctx.createImageData(canvas.width, canvas.height);
  imageData.data.set(imageView);
  ctx.putImageData(imageData, 0, 0);
}

// By exporting a CustomContainer, we can customize the HTML structure that is
// used by the catalog app.
// We do this so that we can provide the magazine container and custom styles.
export const CustomContainer = React.forwardRef(() => (
  <>
    <div id="magazineWrapper">
      <div id="loading">
        <div />
        <div />
        <div />
        <div />
      </div>
      <div id="magazine" />
      <div id="controls">
        <button onClick={() => $("#magazine").turn("previous")}>
          Previous
        </button>
        <span id="pageIndicator">
          Page&nbsp;
          <span id="currentPage">1</span>
          &nbsp;of&nbsp;
          <span id="totalPages">1</span>
        </span>
        <button onClick={() => $("#magazine").turn("next")}>Next</button>
      </div>
    </div>
    <style jsx>{`
      #magazineWrapper {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        background: #edf0f4;
        padding-bottom: 30px;
      }

      #magazine {
        display: none;
        margin-bottom: 50px;
      }

      #magazine canvas {
        transform: scale(0.5);
      }

      #pageIndicator {
        color: #999;
        padding: 10px 15px;
      }

      #controls {
        margin-top: 1.5rem;
        background: black;
        opacity: 0.8;
        border-radius: 5px;
        display: none;
        position: absolute;
        z-index: 10000;
        bottom: 15px;
        left: 50%;
        transform: translateX(-50%);
      }

      #controls button {
        background: black;
        color: white;
        margin: 0.5rem;
      }

      #loading {
        display: inline-block;
        position: relative;
        width: 64px;
        height: 64px;
      }

      #loading div {
        position: absolute;
        top: 27px;
        width: 11px;
        height: 11px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.1);
        animation-timing-function: cubic-bezier(0, 1, 1, 0);
      }

      #loading div:nth-child(1) {
        left: 6px;
        animation: loading1 0.6s infinite;
      }

      #loading div:nth-child(2) {
        left: 6px;
        animation: loading2 0.6s infinite;
      }

      #loading div:nth-child(3) {
        left: 26px;
        animation: loading2 0.6s infinite;
      }

      #loading div:nth-child(4) {
        left: 45px;
        animation: loading3 0.6s infinite;
      }

      @keyframes loading1 {
        0% {
          transform: scale(0);
        }
        100% {
          transform: scale(1);
        }
      }

      @keyframes loading3 {
        0% {
          transform: scale(1);
        }
        100% {
          transform: scale(0);
        }
      }

      @keyframes loading2 {
        0% {
          transform: translate(0, 0);
        }
        100% {
          transform: translate(19px, 0);
        }
      }
    `}</style>
    <style jsx global>{`
      .turn-page-wrapper canvas {
        box-shadow: 4px 4px 10px 0px rgba(0, 0, 0, 0.1);
      }
    `}</style>
  </>
));
