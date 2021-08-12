import css from "styled-jsx/css";

export default css`
  .phases__phase {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
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
    color: #4636e3;
  }

  :global(.info-icon svg) {
    width: 48px;
    height: 48px;
  }
`;
