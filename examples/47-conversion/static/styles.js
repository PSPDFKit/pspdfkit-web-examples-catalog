import css from "styled-jsx/css";

export default css`
  .phases__phase {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    animation-fill-mode: forwards;
    background-color: #fff;
  }

  .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: 16px;
  }

  .intro__continue {
    margin-top: 48px;
    align-self: flex-end;
    background: #4636e3;
    color: white;
    padding: 8px 24px;
    border-radius: 3px;
    cursor: pointer;
  }

  .info-content {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 380px;
  }

  .info-icon {
    align-self: flex-start;
    width: 48px;
    height: 48px;
    color: #000;
  }

  :global(.info-icon svg) {
    width: 48px;
    height: 48px;
  }

  .customContainer {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .topBar {
    width: 100%;
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    background: #32373d;
    color: white;
    font-family: Indivisible, -apple-system, BlinkMacSystemFont, "Segoe UI",
      Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
      sans-serif;
  }

  .topBar fieldset {
    border: none;
    margin: 0 10px;
    display: flex;
    flex-direction: column;
    border: 1px solid gray !important;
    border-radius: 0.25rem;
    padding: 0 0.5rem;
  }

  fieldset[data-control-type="processorEngine"] > div {
    flex: 1;
  }

  .topBar fieldset div {
    display: flex;
    flex-direction: row;
    justify-content: center;
    padding: 0 0 0.5rem;
    gap: 0.5rem;
  }

  .topBar legend {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 5px;
    color: white;
    padding: 0.25rem 0;
  }

  .topBar button {
    display: block;
    margin: 0;
    padding: 5px 10px;
    border: 1px solid #ddd;
    border-radius: 3px;
    background: #eee;
    cursor: pointer;
  }

  .topBar button:hover {
    background: #ddd;
  }

  .viewerContainer {
    height: 100%;
    flex-grow: 1;
  }

  @media (prefers-color-scheme: light) {
    .topBar {
      background: #fdf8f2;
      color: black;
    }

    .topBar legend {
      color: black;
    }

    .topBar button {
      background: #fdf8f2;
      border: 1px solid #222222;
    }

    .topBar button:hover {
      background: #222222;
    }
  }
`;
