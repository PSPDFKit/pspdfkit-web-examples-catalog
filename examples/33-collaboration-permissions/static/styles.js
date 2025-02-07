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
    padding: 0 16px 16px;
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

  .wrapper {
    height: 100vh;
    background-color: white;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  header {
    background-color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
  }

  header button {
    height: 28px;
    margin-top: 0;
    padding: 0 15px;
    font-weight: normal;
    font-size: 12px;
    color: #4d525d;
  }

  .search-input {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    width: 100%;
    box-sizing: content-box;
    margin: 18px 30px 20px 0;
  }

  .add-permission {
    width: 150px;
    height: 35px;
    margin: 16px 0px;
  }

  span {
    color: blue;
    cursor: pointer;
  }

  span:hover {
    text-decoration: underline;
  }

  input {
    border: 1px solid #c5c5c5;
    height: 22px;
    border-radius: 2px;
    padding: 0 10px;
  }

  pre {
    border-radius: 2px;
    background-color: #fbfbfb;
    padding-left: 10px;
  }

  hl {
    background-color: #f1f1f1;
    height: 1px;
    margin-bottom: 10px;
  }

  label {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 50%;
  }

  label input {
    width: 55%;
    margin-left: 10px;
    margin-right: 10px;
  }

  button {
    background: #f0f3f9;
    border: 1px solid #bec9d9;
    box-sizing: border-box;
    border-radius: 3px;
    font-weight: 600;
    font-size: 14px;
    color: #3d424e;
    height: 32px;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .button-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 40px;
    width: 100%;
  }

  .button-wrapper button {
    flex: 1;
    margin-top: 0;
  }

  .content {
    max-width: 600px;
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 0 20px;
  }

  .params-wrapper {
    display: flex;
    justify-content: space-between;
  }

  .permission-row {
    justify-content: space-between;
    display: flex;
    margin-bottom: 5px;
  }

  .add-permission-wrapper {
    display: flex;
    flex-direction: row;
  }

  ul {
    margin-left: 0;
    margin-block-start: 0;
    padding-left: 15px;
  }

  li {
    font-weight: 500;
    font-size: 12px;
    line-height: 20px;

    color: #4d525d;
  }

  h2 {
    font-weight: 600;
    font-size: 18px;
    color: #2b2e36;
  }

  .button-wrapper button:nth-of-type(2n + 1) {
    margin-right: 14px;
  }

  .bw-mt {
    margin-top: 14px;
  }

  .header-center {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  @media only screen and (max-width: 600px) {
    .mobile {
      display: block;
    }
    .desktop {
      display: none;
    }
  }

  @media only screen and (min-width: 601px) {
    .desktop {
      display: block;
    }
    .mobile {
      display: none;
    }
  }
`;

export const roleSelectorStyles = {
  container: provided => ({
    ...provided,
    height: 28
  }),
  control: (provided, state) => {
    return {
      ...provided,
      backgroundColor: state.menuIsOpen ? "#4636E3" : "#FFEE95",
      border: state.menuIsOpen ? "1px solid #0A0167" : "1px solid #FAD40C",
      borderRadius: 3,
      minHeight: 28,
      color: state.menuIsOpen ? "#ffffff" : "#2B2E36",
      cursor: "pointer"
    };
  },
  singleValue: provided => ({
    ...provided,
    fontSize: 14,
    fontWeight: 600,
    color: "inherit",
    display: "flex",
    alignItems: "center",
    span: {
      display: "inherit"
    }
  }),
  indicatorsContainer: provided => {
    return {
      ...provided,
      "> div": {
        padding: 0,
        color: "inherit",
        width: 15,
        marginRight: 4,
        ":hover": {
          color: "inherit"
        }
      }
    };
  },
  valueContainer: provided => ({
    ...provided,
    minWidth: 120
  }),
  input: provided => ({
    ...provided,
    margin: 0,
    padding: 0,
    pointerEvents: "none"
  }),
  indicatorSeparator: provided => ({
    ...provided,
    display: "none"
  }),
  menu: provided => ({
    ...provided,
    width: 150
  }),
  menuList: provided => ({
    ...provided,
    width: "auto"
  }),
  option: provided => ({
    ...provided,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    "> span": {
      display: "inline-flex"
    }
  })
};

export const modeSelectorStyles = {
  ...roleSelectorStyles,
  menu: provided => ({
    ...roleSelectorStyles.menu(provided),
    right: 0
  }),
  option: provided => ({
    ...roleSelectorStyles.option(provided),
    justifyContent: "inherit",
    svg: {
      marginRight: 6
    }
  }),
  valueContainer: provided => ({
    ...roleSelectorStyles.valueContainer(provided),
    minWidth: 40
  })
};
