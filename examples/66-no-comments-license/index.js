import PSPDFKit from "@nutrient-sdk/viewer";

import { toolbarCustomBreakpoint } from "../../_server/components/example/utils";

export function load(defaultConfiguration) {
  if (!Object.isFrozen(PSPDFKit.Options)) {
    PSPDFKit.Options.BREAKPOINT_MD_TOOLBAR = toolbarCustomBreakpoint;
  }

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".pdf";
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);

  defaultConfiguration.toolbarItems = defaultConfiguration.toolbarItems.concat([
    {
      type: "custom",
      id: "upload-button",
      title: "Upload",
      onPress: () => fileInput.click(),
    },
    { type: "content-editor" },
  ]);
  defaultConfiguration.licenseKey =
    "B5VOf5qwz8syHHXUPuduU0FMAmPoThh3117rcQybGc8lx6jb-NGX5RBq5gjtEC9md3udtZkbo6VYnYeLeN0L7OtUdjLr8gJmxJfw7S7brvMaopv27AOb2_evV89lY_ie5HKt8aVVFhXZbnwRz7HFNjSaOwiaw_zE_tzPd9hITof-6JmFZqtJT6xYC2BMlHd_mMNM-SP2hGw2wmjORXIHMF62M4HIBnfuHcMUGKzo_PSCVE9NuePD_u1fP2fdlonWE7BpNlt1-Pmk9fPu4GpXnkczg372wPCRCJtpy9Hm_G9jDWmAWWLPcTPkvRcTwdB-MAnLjfX3TPikJLXWm9AEjO1RLp_IbWi1kgw8p_Cp9JWJmTr1N-gc8aQSQECR7YpJA-ikK1KrwZC9nxmP19WS8KAIbr_kapADZPVU5Fw75ZIAYWafTtsyQGOnZcmzm3dkNw7--il66ELqnYHjFkv5_hk6yjfYcy5AXNp70BizDTi-Y1eMVdcnssqEBm9dqYbr2jqGyi7z8c9glcVMiiNZBeP3NM0SUPffuRXiq4j6Q68bUBjruDhvO2VVPRQzLWp83YXS2nE8cRxs5qZZJ2K7xr2H6r9kM5IPHqdqBKdMUNyXMz8oKnzQdsSEfLp_87XAOkorYcUSFxX1LgLIsMshoY0Da0kBNLrYBcA-guy3yiomWlN05b4L_oBxHZE_kLFCnPxe6eanfkYJJuNlb8tJ_FO9LNcaLgfjkaZpjuwRgnaEM3f2f59adfEvqQUtHVBadBRgiju_pxuh7YJD2xx-tK5RnnhEDS2IM6HKOQ8JKz4xs4dBMRZonpX2Wm5qRpOQwdPlBxcAcoa7L8A2W_2XYS3rAgQGB_9U3zgzyxNZE3oBTxLmZCpZ7IW3uljjVb2s_0STKpe9Z4M7QQsqfqSQChi2ZcIqPmTDGzO02RcpCJLLEqjKUTfJI1Ta3tQs_v-9o-hTQuYxwO5mKIgmKb7X52Dx8UxM5RNetsqkkhpM4vsAM1fSWedHCPlUpP-ResfLZ1wWbscAvxS--XhYahdfcCQL6Vjmdji2uXZ8mQTj2goQuZKxJYLGOYr2i-xx8Qrj3RDzs4H5-Sg4alxFUGCCWog3ORwadBZNjsOv-w_G0CPSepjeKWGB6asKEI3iIpBb";

  // Handle file selection
  fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      await PSPDFKit.unload(defaultConfiguration.container);
      await PSPDFKit.load({
        ...defaultConfiguration,
        document: arrayBuffer,
      });
    }
  });

  return PSPDFKit.load({
    ...defaultConfiguration,
  }).then((instance) => {
    console.log("PSPDFKit for Web successfully loaded!!", instance);

    return instance;
  });
}
