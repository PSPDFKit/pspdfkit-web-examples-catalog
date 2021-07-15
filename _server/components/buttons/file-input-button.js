export default function FileInputButton({
  children,
  onChange,
  accept = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/tiff",
  ],
}) {
  return (
    <React.Fragment>
      <label>
        {children}
        <input
          type="file"
          style={{ position: "absolute", top: -1000000, left: -1000000 }}
          name="file"
          accept={accept.join(", ")}
          onChange={(event) => {
            if (event.target.files.length == 0) {
              event.target.value = null;

              return;
            }

            var file = event.target.files[0];

            if (!accept.includes(file.type)) {
              throw new Error(
                "Invalid file type. Supported file types are: " +
                  accept.join(", ")
              );
            }

            onChange && onChange(file);
            event.target.value = null;
          }}
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
