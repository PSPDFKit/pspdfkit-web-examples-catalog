import css from "styled-jsx/css";

export default css`
  .customContainer {
    display: flex;
    flex-direction: row;
    height: 100%;
  }

  .sidebar {
    width: 320px;
    min-width: 320px;
    background: #32373d;
    color: white;
    font-family: Indivisible, -apple-system, BlinkMacSystemFont, "Segoe UI",
      Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
      sans-serif;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .sidebar h2 {
    font-size: 18px;
    font-weight: bold;
    margin: 0 0 10px 0;
    color: white;
  }

  .sidebar fieldset {
    border: 1px solid gray;
    border-radius: 0.25rem;
    padding: 10px;
    margin: 0;
  }

  .sidebar legend {
    font-size: 14px;
    font-weight: bold;
    color: white;
    padding: 0 8px;
  }

  .sidebar button {
    display: block;
    width: 100%;
    margin: 5px 0;
    padding: 8px 8px;
    border: 1px solid #ddd;
    border-radius: 3px;
    background: #eee;
    color: black;
    cursor: pointer;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sidebar button:hover {
    background: #ddd;
  }

  .sidebar button:disabled {
    background: #999;
    color: #666;
    cursor: not-allowed;
  }

  .sidebar input[type="file"] {
    width: 100%;
    padding: 8px;
    margin: 5px 0;
    border: 1px solid #ddd;
    border-radius: 3px;
    background: white;
    color: black;
  }

  .fontMatches {
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 15px;
    margin-top: 10px;
  }

  .fontMatches h3 {
    font-size: 16px;
    font-weight: bold;
    margin: 0 0 10px 0;
    color: #2e7d32;
  }

  .fontMatches ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .fontMatches li {
    padding: 5px 0;
    border-bottom: 1px solid #ddd;
    font-family: monospace;
    font-size: 14px;
  }

  .fontMatches li:last-child {
    border-bottom: none;
  }

  .noMatches {
    color: #666;
    font-style: italic;
  }

  .substitutionCard {
    margin-bottom: 10px;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .substitutionRow {
    display: flex;
    align-items: baseline;
    margin-bottom: 4px;
  }

  .substitutionLabel {
    width: 60px;
    flex-shrink: 0;
    font-size: 14px;
  }

  .pdfRequested {
    font-weight: bold;
    color: #1976d2;
  }

  .weAreUsing {
    font-weight: bold;
    color: #1976d2;
  }

  .weAreUsing.customMatched {
    color: #2e7d32;
    background: #e8f5e8;
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid #4caf50;
  }

  .customMatchedLabel {
    font-size: 12px;
    font-weight: normal;
    color: #2e7d32;
    font-style: italic;
  }

  .fontSize {
    font-size: 12px;
    color: #666;
    margin-top: 5px;
  }

  .viewerContainer {
    height: 100%;
    flex-grow: 1;
  }

  @media (prefers-color-scheme: light) {
    .sidebar {
      background: #fdf8f2;
      color: black;
    }

    .sidebar h2,
    .sidebar legend {
      color: black;
    }

    .fontMatches {
      background: #f5f5f5;
      border: 1px solid #ccc;
    }

    .fontMatches h3 {
      color: #2e7d32;
    }

    .fontMatches li {
      border-bottom: 1px solid #ccc;
    }
  }
`;
