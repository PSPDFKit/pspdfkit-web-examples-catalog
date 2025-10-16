let certificatesPromise;

export function createSigningFormNode(
  instance,
  signingSidebar,
  sign,
  canProvidePrivateKey
) {
  certificatesPromise = Promise.all([
    fetch("/digital-signatures-visible-sign/static/certificate.pem").then(
      (response) => response.arrayBuffer()
    ),
    fetch("/digital-signatures-visible-sign/static/private-key.pem").then(
      (response) => response.text()
    ),
  ]);

  const signingForm = document.createElement("div");
  signingForm.classList.add("signingForm");
  signingForm.innerHTML = signingSidebar;
  signingForm.querySelector("#providePrivateKey_label").hidden =
    !canProvidePrivateKey;

  signingForm.querySelector("#showLocation").addEventListener("change", (e) => {
    const locationInput = signingForm.querySelector("#location");
    locationInput.disabled = !e.target.checked;
  });

  signingForm.querySelector("#showReason").addEventListener("change", (e) => {
    const reasonInput = signingForm.querySelector("#reason");
    reasonInput.disabled = !e.target.checked;
  });

  signingForm.querySelector("#showSigner").addEventListener("change", (e) => {
    const signerInput = signingForm.querySelector("#signer");
    signerInput.disabled = !e.target.checked;
  });

  signingForm.querySelector("#showSignDate").addEventListener("change", (e) => {
    const showDateTimezone = signingForm.querySelector("#showDateTimezone");

    if (e.target.checked) {
      showDateTimezone.disabled = false;
    } else {
      showDateTimezone.disabled = true;
      showDateTimezone.checked = false;
    }
  });

  const setPositionNewFormFieldState = (state) => {
    const positionXInput = signingForm.querySelector("#positionX");
    const positionYInput = signingForm.querySelector("#positionY");
    const widthInput = signingForm.querySelector("#width");
    const heightInput = signingForm.querySelector("#height");

    positionXInput.disabled = state;
    positionYInput.disabled = state;
    widthInput.disabled = state;
    heightInput.disabled = state;
  };

  const setUseExistingFormFieldState = (state) => {
    const formFieldNameInput = signingForm.querySelector("#formFieldName");
    formFieldNameInput.disabled =
      state || formFieldNameInput.options.length === 0;
  };

  signingForm
    .querySelector("#useExistingFormField")
    .addEventListener("change", (e) => {
      setUseExistingFormFieldState(!e.target.checked);

      setPositionNewFormFieldState(e.target.checked);
    });

  signingForm
    .querySelector("#positionNewFormField")
    .addEventListener("change", (e) => {
      setPositionNewFormFieldState(!e.target.checked);

      setUseExistingFormFieldState(e.target.checked);
    });

  signingForm.querySelector("#addTimestamp").addEventListener("change", (e) => {
    const timestampUrlInput = signingForm.querySelector("#timestampUrl");
    const timestampUsernameInput =
      signingForm.querySelector("#timestampUsername");
    const timestampPasswordInput =
      signingForm.querySelector("#timestampPassword");
    timestampUrlInput.disabled = !e.target.checked;
    timestampUsernameInput.disabled = !e.target.checked;
    timestampPasswordInput.disabled = !e.target.checked;
  });

  const CAdESSelector = signingForm.querySelector("#CAdES");
  CAdESSelector.addEventListener("click", () => {
    signingForm.querySelector("#providePrivateKey").removeAttribute("disabled");
    signingForm.querySelector("#enableLTV").removeAttribute("disabled");
  });

  const CMSSelector = signingForm.querySelector("#CMS");
  CMSSelector.addEventListener("click", () => {
    signingForm
      .querySelector("#providePrivateKey")
      .setAttribute("disabled", "");
    signingForm.querySelector("#enableLTV").setAttribute("disabled", "");
  });

  const refreshLTVButton = signingForm.querySelector("#refreshLTV");
  refreshLTVButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const [certificate] = await certificatesPromise;
    await instance.setSignaturesLTV([certificate]);
  });

  const resetButton = signingForm.querySelector("#resetForm");
  resetButton.addEventListener("click", (event) => {
    event.preventDefault();
    signingForm.querySelector("form").reset();
  });

  const signingButton = signingForm.querySelector("#sign");
  signingButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const formInputs = event.target.form.querySelectorAll(
      "input, select, button"
    );

    for (const formInput of formInputs) {
      formInput.setAttribute("disabled", "true");
    }

    const {
      signer,
      reason,
      location,
      graphic,
      watermark,
      showSigner,
      showReason,
      showLocation,
      showSignDate,
      showDateTimezone,
      showWatermark,
      formFieldName,
      left,
      top,
      width,
      height,
      signatureFormField,
      mode,
      signatureType,
      providePrivateKey,
      addTimestamp,
      timestampUrl,
      timestampUsername,
      timestampPassword,
      enableLTV,
    } = event.target.form;

    const ltv = enableLTV.checked;

    const [certificate, privateKey] = await certificatesPromise;

    const passPrivateKey =
      providePrivateKey.checked &&
      canProvidePrivateKey &&
      signatureType.value === PSPDFKit.SignatureType.CAdES;

    await sign(instance, passPrivateKey, {
      signatureMetadata: {
        signerName: signer.value,
        signatureReason: reason.value,
        signatureLocation: location.value,
      },
      placeholderSize: 10000,
      ...(signatureFormField.value === "useExistingFormField" &&
      formFieldName.value
        ? { formFieldName: formFieldName.value }
        : {
            position: {
              pageIndex: instance.viewState.currentPageIndex,
              boundingBox: new PSPDFKit.Geometry.Rect({
                left: Number(left.value),
                top: Number(top.value),
                width: Number(width.value),
                height: Number(height.value),
              }),
            },
          }),
      appearance: {
        watermarkImage: watermark && watermark.files[0],
        graphicImage: graphic && graphic.files[0],
        mode: mode.value,
        showSigner: showSigner.checked,
        showReason: showReason.checked,
        showLocation: showLocation.checked,
        showSignDate: showSignDate.checked,
        showDateTimezone: showDateTimezone.checked,
        showWatermark: showWatermark.checked,
      },
      signingData: {
        ltv: signatureType.value === PSPDFKit.SignatureType.CAdES && ltv,
        timestamp:
          addTimestamp.checked && timestampUrl.value
            ? {
                url: timestampUrl.value,
                username: timestampUsername.value || "",
                password: timestampPassword.value || "",
              }
            : null,
        signatureType: signatureType.value,
        ...(signatureType.value === PSPDFKit.SignatureType.CAdES
          ? {
              certificates: [certificate],
            }
          : null),
        ...(passPrivateKey ? { privateKey } : null),
      },
    });

    for (const formInput of formInputs) {
      formInput.removeAttribute("disabled");
    }

    await updateFormFieldsList();

    setUseExistingFormFieldState(
      !signingForm.querySelector("#useExistingFormField").checked
    );
    setPositionNewFormFieldState(
      !signingForm.querySelector("#positionNewFormField").checked
    );
  });

  async function updateFormFieldsList() {
    const formFields = await instance.getFormFields();
    const signatureFormFields = formFields.filter(
      (formField) => formField instanceof PSPDFKit.FormFields.SignatureFormField
    );
    const formFieldsSelect = signingForm.querySelector("#formFieldName");
    formFieldsSelect.innerHTML = "";

    for (const formField of signatureFormFields) {
      const option = document.createElement("option");
      option.value = formField.name;
      option.append(formField.name);
      formFieldsSelect.append(option);
    }

    if (!formFieldsSelect.disabled) {
      formFieldsSelect.disabled = signatureFormFields.size === 0;
    }

    if (signatureFormFields.size > 0) {
      formFieldsSelect.selectedIndex = 0;
    }
  }

  instance.addEventListener("formFields.create", updateFormFieldsList);
  instance.addEventListener("formFields.delete", updateFormFieldsList);
  updateFormFieldsList();

  return signingForm;
}
