// Since implementations are different depending on the deployment
// we splitted the specific implementation details of each backend
// on its own module. We load them both even though we only need
// the one from the current backend to avoid waiting to dynamically
// fetch and load the relevant implementation.
import standalone from "./standalone.js";
import server from "./server.js";

export async function load(defaultConfiguration) {
  // PSPDFKit.Configuration#authPayload is a Server only property.
  // We check for its presence to determine which module to use
  const deployment = defaultConfiguration.authPayload ? server : standalone;

  return deployment(defaultConfiguration);
}
