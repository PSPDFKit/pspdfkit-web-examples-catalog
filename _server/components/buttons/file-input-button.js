import React from "react";

export default function FileInputButton({
  children,
  onChange,
  accept = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/tiff",
    "application/msword", // doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template", // doct
    "application/vnd.ms-word.document.macroEnabled.12", //.docm
    "application/vnd.ms-excel", // xls", "xlt", "xla
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
    "application/vnd.openxmlformats-officedocument.spreadsheetml.template", // xltx
    "application/vnd.ms-powerpoint", // ppt", "pps", "pot", "ppa
    "application/vnd.ms-powerpoint.presentation.macroEnabled.12", // .pptm
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
    "application/vnd.openxmlformats-officedocument.presentationml.template", // potx
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow", // ppsx
    "application/vnd.ms-excel.sheet.macroEnabled.12", // .xlsm
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
