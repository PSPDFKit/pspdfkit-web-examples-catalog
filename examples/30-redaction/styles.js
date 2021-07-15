import css from "styled-jsx/css";

export default css`
  .container-wrapper {
    display: block;
    position: relative;
    height: 100%;
  }

  .sidebar {
    width: 17.5rem;
    height: 100%;
    background-color: #fff;
    flex-direction: column;
    padding-top: 10px;
    padding-bottom: 10px;
    position: absolute;
    top: 0;
    left: 0;
    transition: transform ease 0.2s;
    box-shadow: 6px 0px 8px 0px rgba(77, 82, 93, 0.35);
    user-select: none;
  }

  .container {
    display: flex;
    flex: 1;
    height: 100%;
  }

  .scroller {
    height: 100%;
    overflow-y: auto;
  }

  .section-header {
    height: 2.5rem;
    width: 100%;
    background: #f0f3f9;
    font-weight: bold;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 10px;
  }

  header,
  section {
    padding-left: 10px;
    padding-right: 10px;
  }

  .section-header {
    margin-top: 1.5rem;
  }

  .preview-section {
    margin-top: 0.75rem;
  }

  h2 {
    margin-top: 0.5rem;
    font-size: 0.875rem;
  }

  p {
    color: #4d525d;
    font-size: 0.75rem;
    line-height: 1.5;
  }

  button {
    user-select: none;
  }

  .img-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    border-radius: 3px;
    box-shadow: 0px 1.5px 1.5px rgba(0, 0, 0, 0.45);
    width: 2.25rem;
    height: 2rem;
    cursor: pointer;
  }

  .img-btn:hover {
    background: #f0f3f9;
  }

  .btn-bar .img-btn {
    border-radius: 0;
  }

  .btn-bar .img-btn:first-of-type {
    border-radius: 3px 0px 0px 3px;
  }

  .btn-bar .img-btn:last-of-type {
    border-radius: 0px 3px 3px 0px;
  }

  .btn-active {
    background: #4636e3;
    color: white;
  }

  .img-btn.btn-active:hover {
    background: #4636e3;
  }

  input:focus + .img-btn {
    outline: 1px solid blue;
  }

  .btn-plain {
    border: 1px solid #d8dfeb;
    border-radius: 3px;
    padding: 0.5rem 1rem;
    background: transparent;
  }

  .btn-plain:hover {
    border: 1px solid #bec9d9;
  }

  .btn-primary {
    background: #4636e3;
    border: 1px solid #2b1cc1;
    border-radius: 3px;
    padding: 0.5rem 1rem;
    color: white;
    font-weight: bold;
  }

  .btn-primary:hover {
    border: 1px solid #0a0167;
  }

  .large-btn {
    background: #f0f3f9;
    border: 1px solid #bec9d9;
    border-radius: 3px;
    font-weight: bold;
    display: block;
  }

  .large-btn:hover {
    border: 1px solid rgba(132, 140, 154, 0.5);
    background: #d8dfeb;
  }

  .mark-btn {
    margin-top: 1rem;
  }

  .btn-bar {
    display: flex;
  }

  .form-section-bar {
    display: flex;
    justify-content: space-between;
  }

  .form-section-desc {
    user-select: none;
  }

  fieldset {
    border: none;
    margin: 0;
    margin-bottom: 0.875rem;
    padding: 0;
  }

  fieldset {
    margin-top: 0.75rem;
  }

  input[type="checkbox"] {
    margin-left: 0;
    padding-left: 0;
    margin-top: 0.75rem;
  }

  .search-input {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    width: 100%;
    box-sizing: content-box;
  }

  .align-right {
    margin-left: auto;
  }

  .btn-group {
    display: flex;
    justify-content: flex-end;
  }

  .btn-group > * + * {
    margin-left: 1rem;
  }

  .confirm-btns {
    margin-top: 1rem;
  }

  .collapse-handle {
    background: #fcfdfe;
    border: 1px solid rgba(33, 36, 44, 0.2);
    border-left: 0;
    border-radius: 0px 3px 3px 0px;
    width: 1.5rem;
    position: absolute;
    right: -1.5rem;
    height: 2.25rem;
    margin: 0;
    top: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    cursor: pointer;
  }

  .sidebar-collapsed {
    transform: translateX(-98%);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }

  small {
    margin-top: 0.5rem;
    display: inline-block;
  }
`;
