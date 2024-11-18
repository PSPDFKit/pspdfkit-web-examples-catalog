import PSPDFKit from "pspdfkit";
import React, { useMemo } from "react";
import styles, {
  modeSelectorStyles,
  roleSelectorStyles,
} from "./static/styles";
import "url-search-params-polyfill";
import Select from "react-select";

let isInstant = true;
let _instance;

export function load(defaultConfiguration) {
  if (!defaultConfiguration.instant || defaultConfiguration.pdf) {
    console.log(
      "Collaboration Permissions is not supported in PSPDFKit for Web Standalone or Server without Instant."
    );
    isInstant = false;

    return null;
  }

  isInstant = true;

  const toolbarItems = PSPDFKit.defaultToolbarItems;

  // Enable the comments tool in the main toolbar.
  // We are placing it as the first tool on the right hand side of the toolbar.
  toolbarItems.splice(
    toolbarItems.findIndex((item) => item.type === "spacer") + 1,
    0,
    { type: "comment" }
  );

  PSPDFKit.unload(defaultConfiguration.container);

  return PSPDFKit.load({
    ...defaultConfiguration,
    toolbarItems,
    customRenderers: {
      Annotation: privateIconRenderer,
    },
    annotationPresets: {
      ...PSPDFKit.defaultAnnotationPresets,
      "ink-signature": {
        ...PSPDFKit.defaultAnnotationPresets["ink-signature"],
        group: "signature",
      },
    },
  }).then((instance) => {
    _instance = instance;

    instance.setAnnotationCreatorName(
      window.jwtParameters && window.jwtParameters.default_group
    );
    console.log("PSPDFKit for Web successfully loaded!!", instance);

    return instance;
  });
}

export const CustomContainer = React.forwardRef((props, ref) => {
  const params = useMemo(() => {
    const location = window.location.search;

    return new URLSearchParams(location);
  }, []);

  const [page, setPage] = React.useState(1);
  const [role, setRole] = React.useState(params.get("role"));
  const [student, setStudent] = React.useState(params.get("student"));
  const [isPrivate, setIsPrivate] = React.useState(false);

  React.useLayoutEffect(() => {
    if (role && (role === "teacher" || student)) {
      openPage();
    }
  }, []);

  React.useEffect(() => {
    if (!_instance) return;

    _instance.setViewState((s) => s.set("interactionMode", null));
    _instance.setSelectedAnnotation(null);

    if (isPrivate) {
      _instance.setGroup(
        role === "teacher" ? "private_teacher" : "private_students"
      );
    } else {
      _instance.resetGroup();
    }
  }, [isPrivate]);

  const openPage = React.useCallback(
    (_student = student) => {
      if (role === "teacher" || (role === "student" && _student)) {
        window.jwtParameters = getJWTParameters(_student);
        setPage(2);

        // Rerender the document with the new permissions
        props.onForceReRender();
      }
    },
    [student, role, props.onForceReRender]
  );

  const setStudentAndOpenPage = (studentName) => {
    setStudent(studentName);
    openPage(studentName);
  };

  if (!isInstant) {
    return (
      <div ref={ref} className="phases__phase">
        <style jsx>{styles}</style>
        <div className="info">
          <div className="info-content">
            <span className="info-icon">
              <InlineSvgComponent src={require("./static/information.js")} />
            </span>
            <h2>Not available in standalone mode</h2>
            <p>
              Collaboration Permissions require Instant and a server backend to
              run. It doesn't work in the standalone mode.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const goBack = () => {
    setStudent("");
    setRole("");
    setPage(1);
  };

  return (
    <>
      <style jsx>{styles}</style>
      {page === 1 && !role && (
        <div className="wrapper">
          <div className="content">
            <div className="info">
              <div className="info-content">
                <span className="info-icon">
                  <InlineSvgComponent
                    src={require("./static/collaboration-permissions-welcome.js")}
                  />
                </span>
                <h2>Collaboration Permissions Example</h2>
                <p>
                  Collaborate on the document as one of the roles below. Please
                  select one to continue.
                </p>

                <div className="button-wrapper">
                  <button
                    style={{
                      marginRight: 20,
                    }}
                    onClick={() => setRole("student")}
                  >
                    Student
                  </button>
                  <button onClick={() => setRole("teacher")}>Teacher</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {page === 1 && (role === "teacher" || (role === "student" && !student)) && (
        <div className="wrapper">
          <div
            className="info"
            style={{
              alignItems: "unset",
              maxWidth: 400,
            }}
          >
            <h2>
              {role === "teacher"
                ? "Teacher permissions"
                : "Student Permissions"}
            </h2>
            <ul>
              {getRules(role).map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>

            {role === "teacher" ? (
              <button
                style={{
                  width: 180,
                }}
                onClick={() => openPage()}
              >
                Evaluate Paper
              </button>
            ) : (
              <>
                Work on the document as:
                <div
                  className="button-wrapper  bw-mt"
                  style={{ marginTop: 30 }}
                >
                  <button onClick={() => setStudentAndOpenPage("olivia")}>
                    Olivia
                  </button>
                  <button onClick={() => setStudentAndOpenPage("lucas")}>
                    Lucas
                  </button>
                </div>
                <div className="button-wrapper bw-mt">
                  <button onClick={() => setStudentAndOpenPage("john")}>
                    John
                  </button>
                  <button onClick={() => setStudentAndOpenPage("mary")}>
                    Mary
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <>
        <header>
          <div className="mobile" onClick={goBack}>
            <InlineSvgComponent src={require("./static/back.js")} />
          </div>
          <button className="desktop" onClick={goBack}>
            Back
          </button>

          <div className="header-center">
            <p className="desktop">Viewing document as:</p>
            <p className="mobile">Viewing as:</p>&nbsp;&nbsp;
            <Select
              value={roleOptions.find(
                (o) => o.value === (role === "teacher" ? "teacher" : student)
              )}
              onChange={(selected) => {
                const url =
                  selected.value === "teacher"
                    ? getUrl("teacher")
                    : getUrl("student", selected.value);

                window.open(url, "_blank");
              }}
              options={roleOptions}
              styles={roleSelectorStyles}
              formatOptionLabel={(option) => {
                if (option.value !== (student || role)) {
                  return (
                    <>
                      {option.label}{" "}
                      <InlineSvgComponent
                        src={require("./static/external-link.js")}
                      />
                    </>
                  );
                } else {
                  return option.label;
                }
              }}
            />
          </div>

          <Select
            value={privacyModeOptions.find((o) => o.value === isPrivate)}
            onChange={(selected) => {
              setIsPrivate(selected.value);
            }}
            options={privacyModeOptions}
            styles={modeSelectorStyles}
            formatOptionLabel={(option, x) => {
              if (x.context === "value") {
                return (
                  <InlineSvgComponent
                    src={require(`./static/${
                      option.value ? "private" : "public"
                    }.js`)}
                  />
                );
              }

              return (
                <>
                  <InlineSvgComponent
                    src={require(`./static/${
                      option.value ? "private" : "public"
                    }.js`)}
                  />
                  {option.label}
                </>
              );
            }}
          />
        </header>
        <div
          className="container"
          ref={ref}
          style={{
            height: "100%",
            width: "100%",
            visibility:
              page === 2 && (role === "teacher" || !!student)
                ? "visible"
                : "hidden",
          }}
        />
      </>
    </>
  );
});

const InlineSvgComponent = ({ src, ...otherProps }) => {
  return <span {...otherProps} dangerouslySetInnerHTML={{ __html: src }} />;
};

function getUrl(role, student) {
  const search = new window.URLSearchParams(window.location.search.slice(1));

  if (search.has("role")) {
    search.set("role", role);
  } else {
    search.append("role", role);
  }

  if (search.has("student")) {
    if (!student) {
      search.delete("student");
    } else {
      search.set("student", student);
    }
  } else {
    if (student) {
      search.append("student", student);
    }
  }

  return (
    window.location.origin + window.location.pathname + "?" + search.toString()
  );
}

/**
 * These are the permissions that have been assigned for teacher and student.
 */
function getJWTParameters(studentName) {
  const teacher = {
    user_id: "user_teacher",
    default_group: "teacher",
    collaboration_permissions: [
      "annotations:view:group=students",
      "annotations:view:self",
      "annotations:edit:self",
      "annotations:delete:group=students",
      "annotations:delete:self",
      "comments:view:group=students",
      "comments:view:group=private_teacher",
      "comments:view:self",
      "comments:edit:self",
      "comments:delete:all",
      "comments:reply:all",
      "form-fields:view:all",
      "annotations:view:group=signature",
      "annotations:set-group:group=private_teacher",
      "annotations:set-group:group=teacher",
      "annotations:set-group:group=signature",
      "comments:set-group:group=private_teacher",
      "comments:set-group:group=teacher",
    ],
  };

  const student = {
    user_id: `user_${studentName}`,
    default_group: "students",
    collaboration_permissions: [
      "annotations:view:group=students",
      "annotations:view:group=teacher",
      "annotations:view:self",
      "annotations:view:group=signature",
      "annotations:view:group=private_students",
      "annotations:edit:self",
      "annotations:delete:self",
      "comments:view:group=students",
      "comments:view:group=private_students",
      "comments:view:group=teacher",
      "comments:view:self",
      "comments:edit:self",
      "comments:delete:self",
      "comments:reply:all",
      "annotations:set-group:group=private_students",
      "annotations:set-group:group=students",
      "comments:set-group:group=private_students",
      "comments:set-group:group=students",
      "annotations:set-group:group=signature",
      "form-fields:view:all",
      "form-fields:fill:all",
    ],
  };

  return studentName ? student : teacher;
}

function getRules(role) {
  const teacher = [
    "You can view public annotations and comments created by all students. You cannot edit them, but you can delete them.",
    "Students can view public annotations and comments created by you, but they cannot edit or delete them.",
    "You cannot view annotations or comments created by students in private mode.",
    "Annotations or comments that you add in private mode won't be visible to students.",
  ];

  const student = [
    "You can view the public annotations created by the teacher.",
    "You can view comments and replies made by the teacher.",
    "You cannot view annotations or comments created by the teacher in private mode.",
    "You can view annotations or comments created by other students in private mode.",
    "You cannot edit or delete comments and annotations created by the teacher or other students. You can only edit comments and annotations that you made.",
  ];

  return role === "teacher" ? teacher : student;
}

const roleOptions = [
  { value: "teacher", label: "Teacher" },
  { value: "olivia", label: "Olivia (Student)" },
  { value: "lucas", label: "Lucas (Student)" },
  { value: "john", label: "John (Student)" },
  { value: "mary", label: "Mary (Student)" },
];

const privacyModeOptions = [
  {
    value: true,
    label: "Private Mode",
  },
  {
    value: false,
    label: "Public Mode",
  },
];

const iconNodes = {};

// Renders the private icon in the bottom right corner of a private annotation.
function privateIconRenderer({ annotation }) {
  let node;

  if (iconNodes[annotation.id]) {
    node = iconNodes[annotation.id];
  } else {
    node = document.createElement("img");
    node.setAttribute(
      "src",
      "/collaboration-permissions/static/private-annotation.svg"
    );
    node.style.position = "absolute";
    node.style.right = "-18px";
    node.style.bottom = "-14px";
    iconNodes[annotation.id] = node;
  }

  return annotation.group && annotation.group.startsWith("private")
    ? {
        node,
        append: true,
      }
    : null;
}
