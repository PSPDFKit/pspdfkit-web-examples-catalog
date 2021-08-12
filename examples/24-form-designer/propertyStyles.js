import css from "styled-jsx/css";

export default css`
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
