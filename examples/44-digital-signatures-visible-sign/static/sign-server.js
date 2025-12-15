export async function sign(instance, isPrivateKeyProvided, payload) {
  return instance.signDocument(
    {
      ...payload,
      signingData: {
        ...payload.signingData,
        signatureContainer: PSPDFKit.SignatureContainerType.raw,
      },
    },
    {
      // The example signing microservice we are using
      // expects the "user-1-with-rights" token when
      // invoking its endpoint. Nutrient Document Engine forwards
      // any value specified in "signingToken" to it.
      signingToken: "user-1-with-rights",
    }
  );
}
