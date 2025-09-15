import PSPDFKit from "@nutrient-sdk/viewer";

function commentThreadFullCustomization() {
  console.log("commentThread init");

  return {
    onMount: (id) => console.log("commentThread mounted", id),
    onUnmount: (id) => console.log("commentThread unmounted", id),
    render: (params) => {
      const div = document.createElement("div");
      div.style.backgroundColor = "lightblue";
      div.style.padding = "10px";
      div.style.border = "1px solid #ccc";
      div.style.borderRadius = "5px";
      div.innerText = `This is a custom UI for the comment thread. params: ${JSON.stringify(
        params
      )}`;

      return div;
    },
  };
}

const commentThreadPartialCustomization = {
  header: () => {
    console.log("commentThread header init");

    return {
      onMount: (id) => console.log("commentThread header mounted", id),
      onUnmount: (id) => console.log("commentThread header unmounted", id),
      render: () => {
        const div = document.createElement("div");
        div.style.backgroundColor = "lightgreen";
        div.style.padding = "5px";
        div.innerText = "This is a custom header for the comment thread.";

        return div;
      },
    };
  },
  footer: () => {
    console.log("commentThread footer init");

    return {
      onMount: () => console.log("commentThread footer mounted"),
      onUnmount: () => console.log("commentThread footer unmounted"),
      render: () => {
        const div = document.createElement("div");
        div.style.backgroundColor = "lightcoral";
        div.style.padding = "5px";
        div.innerText = "This is a custom footer for the comment thread.";

        return div;
      },
    };
  },
  comment: {
    header: () => {
      console.log("commentThread comment header init");

      return {
        onMount: (id) =>
          console.log("commentThread comment header mounted", id),
        onUnmount: (id) =>
          console.log("commentThread comment header unmounted", id),
        render: () => {
          const div = document.createElement("div");
          div.style.backgroundColor = "lightyellow";
          div.style.padding = "5px";
          div.innerText = "This is a custom UI for comment header";

          return div;
        },
      };
    },
    footer: () => {
      console.log("commentThread comment footer init");

      return {
        onMount: (id) =>
          console.log("commentThread comment footer mounted", id),
        onUnmount: (id) =>
          console.log("commentThread comment footer unmounted", id),
        render: () => {
          const div = document.createElement("div");
          div.style.backgroundColor = "peachpuff";
          div.style.padding = "5px";
          div.innerText = "This is a custom UI for comment footer";

          return div;
        },
      };
    },
  },
};

const USE_FULL_CUSTOMIZATION = false;

export function load(defaultConfiguration) {
  return PSPDFKit.load({
    ...defaultConfiguration,
    ui: {
      commentThread: USE_FULL_CUSTOMIZATION
        ? commentThreadFullCustomization
        : commentThreadPartialCustomization,
      sidebar: {
        infoSidebar: () => {
          console.log("infoSidebar init");
          const div = document.createElement("div");
          const button = document.createElement("button");
          let count = 0;
          button.innerText = `Count: ${count}`;
          button.style.padding = "10px";

          let interval;

          return {
            onMount: (id) => {
              console.log("infoSidebar mounted", id);
              interval = setInterval(() => {
                count += 1;
                button.innerText = `Count: ${count}`;
              }, 1000);
            },
            onUnmount: (id) => {
              console.log("infoSidebar unmounted", id);
              clearInterval(interval);
            },
            render: () => {
              div.style.padding = "10px";
              div.style.height = "100vh";
              div.innerText = "This is a custom UI for the info sidebar.";
              div.style.color = "white";

              const p = document.createElement("p");
              p.innerText =
                "You can customize this sidebar as needed. View the guide for more details.";

              const a = document.createElement("a");
              a.href =
                "https://www.nutrient.io/guides/web/user-interface/ui-customization/introduction/";
              a.target = "_blank";
              a.innerText = "View the guide for more details ➡️";

              a.style.color = "coral";

              div.appendChild(document.createElement("br"));
              div.appendChild(p);

              div.appendChild(document.createElement("br"));
              div.appendChild(a);
              div.appendChild(document.createElement("br"));
              div.appendChild(document.createElement("br"));

              const p2 = document.createElement("p");
              p2.innerText =
                "The button below is updated every second using the onMount and onUnmount lifecycle methods. The interval is cleared on unmount.";
              div.appendChild(p2);

              div.appendChild(document.createElement("br"));
              div.appendChild(button);

              return div;
            },
          };
        },
        infoSidebar2: () => {
          console.log("infoSidebar2 init");
          const div = document.createElement("div");

          return {
            onMount: (id) => {
              console.log("infoSidebar2 mounted", id);
            },
            onUnmount: (id) => {
              console.log("infoSidebar2 unmounted", id);
            },
            render: () => {
              div.style.padding = "10px";
              div.style.height = "100vh";
              div.innerText = "This is a custom UI for the info sidebar 2.";
              div.style.color = "hotpink";

              const p = document.createElement("p");
              p.innerText =
                "You can customize this sidebar as needed. View the guide for more details.";

              const a = document.createElement("a");
              a.href =
                "https://www.nutrient.io/guides/web/user-interface/ui-customization/introduction/";
              a.target = "_blank";
              a.innerText = "View the guide for more details ➡️";

              a.style.color = "coral";

              div.appendChild(document.createElement("br"));
              div.appendChild(p);

              div.appendChild(document.createElement("br"));
              div.appendChild(a);

              return div;
            },
          };
        },
      },
    },
  }).then((instance) => {
    console.log("Nutrient Web SDK successfully loaded!!", instance);

    const infoSidebarToolbarItem = {
      type: "custom",
      id: "infoSidebarToolbarItem",
      title: "Info Sidebar",
      dropdownGroup: "sidebar",
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(240,187,64,1)"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z"></path></svg>',
      onPress: () => {
        instance.setViewState((viewState) =>
          viewState.set(
            "sidebarMode",
            viewState.sidebarMode === "infoSidebar" ? null : "infoSidebar"
          )
        );
      },
    };
    const infoSidebarToolbarItem2 = {
      type: "custom",
      id: "infoSidebarToolbarItem2",
      title: "Info Sidebar 2",
      dropdownGroup: "sidebar",
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="hotpink"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z"></path></svg>',
      onPress: () => {
        instance.setViewState((viewState) =>
          viewState.set(
            "sidebarMode",
            viewState.sidebarMode === "infoSidebar2" ? null : "infoSidebar2"
          )
        );
      },
    };
    instance.setToolbarItems([
      ...NutrientViewer.defaultToolbarItems,
      infoSidebarToolbarItem,
      infoSidebarToolbarItem2,
    ]);

    instance.addEventListener(
      "viewState.change",
      (viewState, prevViewState) => {
        if (viewState.sidebarMode === prevViewState.sidebarMode) {
          return;
        }

        instance.setToolbarItems((items) =>
          items.map((item) => {
            if (item.id === "infoSidebarToolbarItem") {
              return {
                ...item,
                selected: viewState.sidebarMode === "infoSidebar",
              };
            } else if (item.id === "infoSidebarToolbarItem2") {
              return {
                ...item,
                selected: viewState.sidebarMode === "infoSidebar2",
              };
            }

            return item;
          })
        );
      }
    );

    return instance;
  });
}
