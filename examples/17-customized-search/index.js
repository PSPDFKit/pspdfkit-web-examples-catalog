import PSPDFKit from "pspdfkit";

async function customSearch(term, instance) {
  // We would get an error if we called `instance.search` with a term of 2
  // characters or less. Therefore we stop here and reset the search results to
  // an empty list in this case.
  if (term.length <= 2) {
    return PSPDFKit.Immutable.List([]);
  }

  // Let's take the results from the default search as the foundation.
  const results = await instance.search(term);

  // We only want to find whole words which match the term we entered.
  const filteredResults = results.filter(result => {
    const searchWord = new RegExp(`\\b${term}\\b`, "i");
    return searchWord.test(result.previewText);
  });

  return filteredResults;
}

export function load(defaultConfiguration) {
  return PSPDFKit.load(defaultConfiguration).then(instance => {
    let lastSearchTerm = "";

    instance.addEventListener("search.termChange", async event => {
      // Opt-out from the default implementation.
      event.preventDefault();

      const { term } = event;
      // Update the search term in the search box. Without this line, the search
      // box would stay empty.
      instance.setSearchState(state => state.set("term", term));
      lastSearchTerm = term;

      // Perform custom search for the term. We're passing the instance as an
      // additional parameter as we are using PSPDFKit's `instance.search`
      // method under the hood.
      const results = await customSearch(term, instance);

      // Our results could return in a different order than expected. Let's make
      // sure only results matching our current term are applied.
      if (term !== lastSearchTerm) {
        return;
      }

      // Finally we apply the results. Note that you can also modify the search
      // state first and then pass the new state to `instance.setSearchState`.
      const newState = instance.searchState.set("results", results);
      instance.setSearchState(newState);
    });
  });
}
