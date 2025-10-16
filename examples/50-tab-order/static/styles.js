import css from "styled-jsx/css";

export default css`
  .customContainer {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .topBar {
    width: 100%;
    padding: 1.5rem;
    display: flex;
    flex-direction: row;
    justify-content: center;
    background: #32373d;
    color: white;
    font-family: Indivisible, -apple-system, BlinkMacSystemFont, "Segoe UI",
      Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
      sans-serif;
  }

  .topBar label {
    font-size: 1rem;
    line-height: 2rem;
    padding: 0 1rem;
  }

  .topBar select {
    height: 2rem;
    display: block;
    margin: 0;
    padding: 5px 10px;
    border: 1px solid #ddd;
    border-radius: 3px;
    background: #eee;
    cursor: pointer;
    font-size: 1rem;
  }

  @media (prefers-color-scheme: light) {
    .topBar {
      background: #fdf8f2;
      color: black;
    }
  }
`;
