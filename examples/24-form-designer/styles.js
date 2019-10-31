import css from "styled-jsx/css";

export default css`
  @keyframes phase-active {
    from {
      transform: translateX(48px);
      opacity: 0;
    }

    to {
      transform: none;
      opacity: 1;
    }
  }

  @keyframes phase-prev {
    from {
      transform: none;
      opacity: 1;
    }

    to {
      transform: translateX(-32px);
      opacity: 0;
    }
  }

  .phases {
    position: relative;
    height: 100%;
    background: white;
  }

  .phases__phase {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    pointer-events: none;
    overflow: auto;

    animation-fill-mode: forwards;
  }

  .phases__phase--active {
    pointer-events: initial;

    animation-delay: 180ms;

    /* Ease out cubic */
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);

    animation-duration: 480ms;
    animation-name: phase-active;
  }

  .phases__phase--prev {
    /* Ease in quad */
    animation-timing-function: cubic-bezier(0.55, 0.085, 0.68, 0.53);

    animation-name: phase-prev;
    animation-duration: 180ms;
  }

  .intro {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: 16px;
  }

  .intro__icon {
    align-self: flex-start;
    width: 48px;
    height: 48px;
    color: #4636e3;
  }

  :global(.intro__icon svg) {
    width: 48px;
    height: 48px;
  }

  .intro__copy {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 380px;
  }

  .intro p {
    margin: 8px 0;
  }

  .intro__continue {
    margin-top: 48px;
    align-self: flex-end;
    background: #4636e3;
    color: white;
    padding: 8px 24px;
    border-radius: 3px;
  }

  :global(.form-designer-spacer) {
    flex: 1;
  }

  .design-phase__actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .design-phase__reset,
  .design-phase__continue {
    margin: 0;
    border-radius: 3px;
  }

  .design-phase__reset {
    margin-left: 8px;
  }

  .design-phase__continue {
    background: #4636e3;
    color: white;
    margin: 0 20px;
  }

  .prompt-area {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .prompt-area__icon {
    color: #4636e3;
  }

  :global(.prompt-area__icon svg) {
    width: 48px;
    height: 48px;
  }

  .prompt-area__copy {
    width: 100%;
    max-width: 360px;
  }

  .prompt-area__actions {
    margin-top: 24px;
    display: flex;
  }

  .prompt-area__action {
    flex: 1;
    border-radius: 3px;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .prompt-area__action:not(:last-child) {
    margin-right: 16px;
  }

  .toolbar {
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    position: relative;
    box-shadow: 0 1px rgba(0, 0, 0, 0.1);
  }

  .toolbar__text {
    display: flex;
    align-items: center;
    font-size: 13px;
    font-weight: 500;
    height: 28px;
    padding: 0 32px;
    border-radius: 3px;
    font-weight: normal;

    /* Absolute center ignoring other siblings */
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .toolbar__text--emphasized {
    background: #fdf0aa;
    color: rgba(0, 0, 0, 0.8);
  }

  .toolbar__text-signer {
    text-transform: capitalize;
    font-weight: bold;
  }

  .toolbar__button {
    margin: 0 8px;
    height: 28px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #4636e3;
    color: white;
    border-radius: 3px;
  }

  .signing-complete-info {
    display: flex;
    height: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .signing-complete-info__continue {
    margin: 24px 0 0;
  }

  .pspdf-container {
    width: 100%;

    /* Conteract the toolbar height */
    height: calc(100% - 44px);
  }

  :global(.color-input) {
    border-radius: 6px;
  }

  :global(.number-input) {
    max-width: 50px;
  }

  .design-phase {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }

  .design-phase__side {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 80px;
    background: white;
    flex: 0 0 auto;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    z-index: 1;
  }

  .design-phase__side-icon {
    margin: 16px 16px 0;
    color: #4636e3;
    display: none;
  }

  :global(.design-phase__side-icon svg) {
    width: 48px;
    height: 48px;
  }

  .design-phase__side-title {
    display: none;
    margin: 16px 0 0 16px;
  }

  .design-phase__side-subtitle {
    display: none;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.6);
    margin: 8px 16px 16px 16px;
  }

  .design-phase__side-annotations {
    display: flex;
    flex-direction: row;
    height: 100%;
    width: 100%;
    overflow: auto;
    flex: 1;
  }

  .design-phase__side-annotation-heading {
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
  }

  .design-phase__side-annotation-description {
    display: none;
  }

  .design-phase__side-annotation {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: transparent;
    border-radius: 0;
    width: 120px;
    height: 100%;
    padding: 0;
    flex-shrink: 0;
    margin: 0;
    text-align: center;
  }

  .design-phase__side-start-designing {
    margin: 16px;
    background: #4636e3;
    color: white;
    border-radius: 3px;
  }

  .design-phase__side-annotation-button {
    display: none;
    border: 1px solid rgba(0, 0, 0, 0.07);
    margin: 0;
    padding: 0;
    width: 48px;
    height: 34px;
    background: rgba(0, 0, 0, 0.02);
  }

  .design-phase__side-annotation-button-icon {
    width: 24px;
    height: 24px;
  }

  .design-phase__side-annotation-button {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .properties {
    padding-bottom: 4px;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    overflow: auto;
    flex: 1;
  }

  .properties__header {
    padding: 0 16px;
  }

  .properties__none-selected-info {
    padding: 0 16px;
    display: block;
  }

  .design-phase__main {
    width: 100%;
    height: 100%;
  }

  @media (min-width: 1200px) {
    .design-phase {
      flex-direction: row;
    }

    .design-phase__side {
      height: 100%;
      width: 320px;
      flex-direction: column;
      align-items: initial;
      border-right: 1px solid rgba(0, 0, 0, 0.1);
    }

    .design-phase__side-title {
      margin-top: 8px;
    }

    .design-phase__side-title,
    .design-phase__side-subtitle {
      display: initial;
    }

    .design-phase__side-annotations {
      flex-direction: column;
    }

    .design-phase__continue {
      margin: 0 16px 16px;
      align-self: flex-end;
    }

    .design-phase__side-icon {
      display: initial;
    }

    .design-phase__side-annotation {
      flex-direction: column;
      justify-content: initial;
      align-items: initial;
      height: initial;
      width: initial;
      padding: 10px 16px;
    }

    .design-phase__side-annotation:not(:first-of-type) {
      border-top: 1px solid rgba(0, 0, 0, 0.05);
    }

    .design-phase__side-annotation-heading {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }

    .design-phase__side-annotation-label {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.7);
      font-weight: 500;
    }

    .design-phase__side-annotation-label::after {
      content: ":";
    }

    .design-phase__side-annotation-icon {
      width: 24px;
      height: 24px;
      opacity: 0.4;
    }

    .design-phase__side-annotation-description {
      display: initial;
      margin: 8px 0;
      text-align: start;
      font-weight: normal;
    }

    .design-phase__side-annotation .design-phase__actions {
      margin: 16px;
    }

    .design-phase__reset,
    .design-phase__continue {
      margin: 0;
    }
  }
`;

export const property = css.resolve`
  .properties__category {
    font-weight: bold;
    padding: 0 16px;
    opacity: 0.8;
  }

  .properties__property {
    margin: 4px 0;
    padding: 0 16px;
    display: flex;
    height: 38px;
    align-items: center;
    flex-direction: row;
  }

  .properties__property:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .properties__property-icon {
    margin-right: 16px;
    opacity: 0.8;
  }

  .properties__property-radio-label:not(:last-child) {
    margin-right: 48px;
  }

  .properties__property-radio {
    margin-right: 8px;
  }
`;
