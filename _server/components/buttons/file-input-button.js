export default function FileInputButton({ children, onChange }) {
  return (
    <React.Fragment>
      <label>
        {children}
        <input
          type="file"
          style={{ position: "absolute", top: -1000000, left: -1000000 }}
          name="file"
          accept="application/pdf"
          onChange={onChange}
        />
      </label>
      <style jsx>
        {`
          label {
            display: block;
            padding: 10px 12px;
            margin-top: 10px;
            font-weight: 500;
            font-size: 12px;
            border: 1px solid #206cd4;
            background: #4484e3;
            border-radius: 5px;
            color: #fff;
            text-align: center;
            cursor: pointer;
            line-height: 1em;
          }
          label:hover,
          label:focus-within {
            background: #4b8cec;
          }
        `}
      </style>
    </React.Fragment>
  );
}
