import PSPDFKit from "pspdfkit";

export function load(defaultConfiguration) {
  // Keep track of the current instance so that we
  // can use it inside of a toolbar item onPress callback.
  let instance = null;

  // Only allow annotations that got created by Current User
  const isEditableAnnotation = annotation => {
    return annotation.creatorName === "Current User";
  };

  // Only allow the following Annotation Types
  const editableAnnotationTypes = [PSPDFKit.Annotations.TextAnnotation];

  const createTogglePermissionsToolbarItem = currentPermissionMode => {
    return {
      type: "custom",
      title:
        currentPermissionMode === "editableAnnotationTypes"
          ? "Text Annotations Editable"
          : "Annotations By Current User Editable",
      onPress: () => {
        if (currentPermissionMode === "editableAnnotationTypes") {
          currentPermissionMode = "isEditableAnnotation";
          instance.setIsEditableAnnotation(isEditableAnnotation);
        } else {
          currentPermissionMode = "editableAnnotationTypes";
          instance.setEditableAnnotationTypes(editableAnnotationTypes);
        }
        let toolbarItems = PSPDFKit.defaultToolbarItems;
        toolbarItems.push(
          createTogglePermissionsToolbarItem(currentPermissionMode)
        );
        instance.setToolbarItems(toolbarItems);
      }
    };
  };

  let toolbarItems = PSPDFKit.defaultToolbarItems;
  toolbarItems.push(createTogglePermissionsToolbarItem("isEditableAnnotation"));

  const config = {
    ...defaultConfiguration,
    isEditableAnnotation,
    toolbarItems
  };
  return PSPDFKit.load(config).then(async _instance => {
    instance = _instance;
    console.log("PSPDFKit for Web successfully loaded!!", instance);

    const annotationsOnFirstPage = await instance.getAnnotations(0);

    // Add two text annotations, one that was created by the current user, the other one
    // got created by another user.
    if (annotationsOnFirstPage.size <= 1) {
      instance.createAnnotation(
        new PSPDFKit.Annotations.TextAnnotation({
          pageIndex: 0,
          boundingBox: new PSPDFKit.Geometry.Rect({
            width: 150,
            height: 150,
            top: 350,
            left: 350
          }),
          text: "Annotation created by current user",
          font: "Helvetica",
          isBold: true,
          horizontalAlign: "center",
          verticalAlign: "center",
          backgroundColor: PSPDFKit.Color.BLUE,
          fontColor: PSPDFKit.Color.WHITE,
          creatorName: "Current User"
        })
      );

      instance.createAnnotation(
        new PSPDFKit.Annotations.TextAnnotation({
          pageIndex: 0,
          boundingBox: new PSPDFKit.Geometry.Rect({
            width: 150,
            height: 150,
            top: 550,
            left: 350
          }),
          text: "Annotation from another user",
          font: "Helvetica",
          isBold: true,
          horizontalAlign: "center",
          verticalAlign: "center",
          backgroundColor: PSPDFKit.Color.BLACK,
          fontColor: PSPDFKit.Color.WHITE,
          creatorName: "Other User"
        })
      );
    }

    // Set the author of every new annotation to "Current User" so it's editable
    instance.setAnnotationCreatorName("Current User");

    return instance;
  });
}
