const Exa = require("exa-js");

const DEFAULT_NUM_RESULTS = 5;
const MAX_NUM_RESULTS = 100;

let client;

function getClient() {
  const apiKey = process.env.EXA_API_KEY;

  if (!apiKey) {
    throw new Error(
      "EXA_API_KEY is not set. Add it to your environment (see .env.example) before searching.",
    );
  }

  if (!client) {
    client = new Exa(apiKey);
  }

  return client;
}

/**
 * Searches the web through Exa and returns the relevant pages with highlights.
 *
 * @param {string} query Natural language search query.
 * @param {{ numResults?: number, maxCharacters?: number }} [options]
 * @returns {Promise<Array<{ title: string | null, url: string, publishedDate: string | null, highlights: string[] }>>}
 */
async function searchWeb(query, { numResults = DEFAULT_NUM_RESULTS, maxCharacters } = {}) {
  if (typeof query !== "string" || query.trim() === "") {
    throw new TypeError("searchWeb requires a non-empty query string.");
  }

  if (!Number.isInteger(numResults) || numResults < 1 || numResults > MAX_NUM_RESULTS) {
    throw new RangeError(
      `numResults must be an integer between 1 and ${MAX_NUM_RESULTS}.`,
    );
  }

  const response = await getClient().search(query, {
    type: "auto",
    numResults,
    contents: {
      highlights: maxCharacters ? { maxCharacters } : true,
    },
  });

  return (response.results || []).map((result) => ({
    title: result.title || null,
    url: result.url,
    publishedDate: result.publishedDate || null,
    highlights: result.highlights || [],
  }));
}

async function runCli(args) {
  const query = args.join(" ").trim();

  if (query === "") {
    console.error('Usage: node scripts/exa-web-search.js "<query>"');
    return 1;
  }

  const results = await searchWeb(query);
  console.log(JSON.stringify(results, null, 2));
  return 0;
}

if (require.main === module) {
  runCli(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (error) => {
      console.error(error.message);
      process.exitCode = 1;
    },
  );
}

module.exports = { searchWeb };
