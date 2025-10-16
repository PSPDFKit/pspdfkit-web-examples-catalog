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

  .comparison-icon {
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
