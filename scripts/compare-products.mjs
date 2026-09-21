#!/usr/bin/env node
/**
 * Download currently available Octopus Energy products and compare them
 * with tariffs hardcoded in src/data/source.ts and the rest of the app.
 *
 * Usage:
 *   pnpm compare-products
 *   node scripts/compare-products.mjs
 *   node scripts/compare-products.mjs --json
 *
 * The public products catalogue does not include restricted tariffs
 * (notably Tracker). Hardcoded codes missing from that list are looked
 * up at /v1/products/{code}/ so we can tell expired vs restricted vs gone.
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const PRODUCTS_URL = "https://api.octopus.energy/v1/products/";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = path.join(ROOT, "src");
const SOURCE_TS = path.join(SRC_DIR, "data", "source.ts");

const tty = process.stdout.isTTY && !process.argv.includes("--json");
const ansi = (code, text) => (tty ? `\x1b[${code}m${text}\x1b[0m` : text);
const bold = (text) => ansi("1", text);
const dim = (text) => ansi("2", text);
const red = (text) => ansi("31", text);
const green = (text) => ansi("32", text);
const yellow = (text) => ansi("33", text);
const cyan = (text) => ansi("36", text);

const PRODUCT_STRING_RE = /["'`]([A-Z]{2,}(?:-[A-Z0-9]+){1,})["'`]/g;
const FULL_TARIFF_CODE_RE =
  /["'`][EG]-[12]R-([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+)-[A-Z]["'`]/g;
const DATE_IN_CODE_RE = /\d{2}-\d{2}-\d{2}/;
const OLD_YEAR_CODE_RE = /\d{4}-\d/;

const LIST_NAMES = ["GTARIFFS", "EETARIFFS", "ETARIFFS", "AGILE", "TRACKER"];
const COMPARISON_LISTS = new Set(["GTARIFFS", "EETARIFFS", "ETARIFFS"]);

function looksLikeProductCode(code) {
  if (/^[EG]-[12]R$/.test(code)) return false;
  return DATE_IN_CODE_RE.test(code) || OLD_YEAR_CODE_RE.test(code);
}

function pad(text, width) {
  return text.length >= width ? text : text + " ".repeat(width - text.length);
}

function formatDate(value) {
  if (!value) return "open-ended";
  return value.replace("T", " ").replace(/\+\d{2}:\d{2}$/, "").replace(/Z$/, " UTC");
}

function availabilityStatus(product, now = new Date()) {
  if (!product) return "missing";
  if (product.available_to && new Date(product.available_to) <= now) {
    return product.is_restricted ? "expired-restricted" : "expired";
  }
  if (product.is_restricted) return "restricted";
  if (product.available_to) {
    const msLeft = new Date(product.available_to).getTime() - now.getTime();
    if (msLeft <= 7 * 24 * 60 * 60 * 1000) return "ending-soon";
  }
  return "available";
}

function statusLabel(status) {
  switch (status) {
    case "available":
      return green("available");
    case "restricted":
      return yellow("restricted (not in public catalogue)");
    case "ending-soon":
      return yellow("ending soon");
    case "expired":
    case "expired-restricted":
      return red("no longer available");
    case "missing":
      return red("not found (404)");
    default:
      return status;
  }
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Request failed ${response.status} for ${url}`);
  }
  return response.json();
}

async function fetchAllProducts() {
  const products = [];
  let url = PRODUCTS_URL;
  while (url) {
    const page = await fetchJson(url);
    products.push(...page.results);
    url = page.next;
  }
  return products;
}

async function fetchProduct(code) {
  return fetchJson(`${PRODUCTS_URL}${encodeURIComponent(code)}/`);
}

async function mapPool(items, concurrency, mapper) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, worker)
  );
  return results;
}

function extractArrayBlock(source, name) {
  const match = source.match(
    new RegExp(`export const ${name}[^=]*=\\s*\\[([\\s\\S]*?)\\n\\];`)
  );
  return match ? match[1] : "";
}

function extractObjects(block) {
  const objects = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < block.length; i++) {
    const char = block[i];
    if (char === "{") {
      if (depth === 0) start = i;
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0 && start !== -1) {
        objects.push(block.slice(start, i + 1));
        start = -1;
      }
    }
  }
  return objects;
}

function parseSourceLists(source) {
  const lists = {};
  for (const name of LIST_NAMES) {
    const raw = extractArrayBlock(source, name);
    const active = extractArrayBlock(
      source.replace(/\/\*[\s\S]*?\*\//g, ""),
      name
    );
    const activeCodes = new Set(
      extractObjects(active)
        .map((block) => block.match(/(?:tariff|code):\s*"([^"]+)"/)?.[1])
        .filter(Boolean)
    );
    lists[name] = extractObjects(raw).map((block) => {
      const code = block.match(/(?:tariff|code):\s*"([^"]+)"/)?.[1];
      return {
        code,
        name: block.match(/name:\s*"([^"]+)"/)?.[1] ?? null,
        category: block.match(/category:\s*"([^"]+)"/)?.[1] ?? null,
        currentPlan: /currentPlan:\s*true/.test(block),
        commentedOut: !activeCodes.has(code),
      };
    }).filter((entry) => entry.code);
  }

  const variable = source.match(
    /export const CURRENT_VARIABLE_CODE\s*=\s*"([^"]+)"/
  );
  lists.CURRENT_VARIABLE_CODE = variable
    ? [
        {
          code: variable[1],
          name: "Flexible Octopus",
          category: "SVT",
          currentPlan: true,
          commentedOut: false,
        },
      ]
    : [];

  return lists;
}

async function collectFileReferences() {
  const references = new Map();

  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }
      if (!/\.(ts|tsx|js|jsx)$/.test(entry.name)) continue;
      const content = await readFile(fullPath, "utf8");
      const relPath = path.relative(ROOT, fullPath);
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        for (const match of line.matchAll(PRODUCT_STRING_RE)) {
          const code = match[1];
          if (!looksLikeProductCode(code)) continue;
          addReference(references, code, relPath, index + 1);
        }
        for (const match of line.matchAll(FULL_TARIFF_CODE_RE)) {
          addReference(references, match[1], relPath, index + 1);
        }
      });
    }
  }

  await walk(SRC_DIR);
  return references;
}

function addReference(map, code, file, line) {
  if (!map.has(code)) map.set(code, []);
  const list = map.get(code);
  if (!list.some((ref) => ref.file === file && ref.line === line)) {
    list.push({ file, line });
  }
}

function slimProduct(product) {
  if (!product) return null;
  return {
    code: product.code,
    display_name: product.display_name,
    full_name: product.full_name,
    brand: product.brand,
    direction: product.direction ?? null,
    is_prepay: product.is_prepay,
    is_business: product.is_business,
    is_tracker: product.is_tracker,
    is_restricted: product.is_restricted,
    is_variable: product.is_variable,
    available_from: product.available_from,
    available_to: product.available_to,
  };
}

function productSummary(product) {
  if (!product) return "";
  const bits = [
    product.display_name || product.full_name,
    product.brand,
    product.direction,
    product.is_prepay ? "prepay" : null,
    product.is_business ? "business" : null,
    product.is_tracker ? "tracker" : null,
    `from ${formatDate(product.available_from)}`,
    `to ${formatDate(product.available_to)}`,
  ].filter(Boolean);
  return bits.join(" · ");
}

function pickLive(candidates) {
  if (candidates.length === 0) return null;
  const open = candidates.filter((product) => !product.available_to);
  return (open[0] ?? candidates[0]) ?? null;
}

function suggestReplacement(expiredProduct, liveProducts) {
  if (!expiredProduct) return null;
  const sameName = liveProducts.filter(
    (product) => product.display_name === expiredProduct.display_name
  );
  const sameBrand = sameName.filter(
    (product) => product.brand === expiredProduct.brand
  );
  return pickLive(sameBrand) ?? pickLive(sameName);
}

function printHeading(title) {
  console.log(`\n${bold(title)}`);
  console.log(dim("─".repeat(Math.min(80, title.length + 8))));
}

function printCodeRow(code, status, detail) {
  console.log(`  ${pad(code, 38)} ${statusLabel(status)}`);
  if (detail) console.log(`    ${dim(detail)}`);
}

async function main() {
  const jsonOutput = process.argv.includes("--json");

  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`Compare hardcoded Octopus tariffs with the live products API.

Usage:
  node scripts/compare-products.mjs [--json]

The public catalogue only includes currently available, non-restricted
products. Hardcoded codes are also looked up individually.
`);
    return;
  }

  const [liveProducts, sourceText, fileRefs] = await Promise.all([
    fetchAllProducts(),
    readFile(SOURCE_TS, "utf8"),
    collectFileReferences(),
  ]);

  const liveProductsSlim = liveProducts.map(slimProduct);
  const liveByCode = new Map(
    liveProductsSlim.map((product) => [product.code, product])
  );
  const lists = parseSourceLists(sourceText);

  const hardcodedCodes = new Set();
  for (const entries of Object.values(lists)) {
    for (const entry of entries) {
      if (!entry.commentedOut) hardcodedCodes.add(entry.code);
    }
  }
  for (const code of fileRefs.keys()) hardcodedCodes.add(code);

  const lookupCodes = [...hardcodedCodes].filter((code) => !liveByCode.has(code));
  const lookedUp = await mapPool(lookupCodes, 6, async (code) => [
    code,
    slimProduct(await fetchProduct(code)),
  ]);
  const detailByCode = new Map(liveByCode);
  for (const [code, product] of lookedUp) {
    if (product) detailByCode.set(code, product);
  }

  const listReport = {};
  for (const [name, entries] of Object.entries(lists)) {
    listReport[name] = entries
      .filter((entry) => !entry.commentedOut)
      .map((entry) => {
        const product = detailByCode.get(entry.code) ?? null;
        const status = liveByCode.has(entry.code)
          ? availabilityStatus(liveByCode.get(entry.code))
          : availabilityStatus(product);
        const replacement = ["expired", "expired-restricted", "missing"].includes(
          status
        )
          ? suggestReplacement(product, liveProductsSlim)
          : null;
        return {
          ...entry,
          status,
          inPublicCatalogue: liveByCode.has(entry.code),
          product,
          replacement: replacement
            ? { code: replacement.code, display_name: replacement.display_name }
            : null,
        };
      });
  }

  const listedCodes = new Set(
    Object.values(lists).flatMap((entries) => entries.map((entry) => entry.code))
  );
  const otherHardcoded = [...fileRefs.entries()]
    .filter(([code]) => !listedCodes.has(code))
    .map(([code, refs]) => {
      const product = detailByCode.get(code) ?? null;
      return {
        code,
        status: liveByCode.has(code)
          ? availabilityStatus(liveByCode.get(code))
          : availabilityStatus(product),
        inPublicCatalogue: liveByCode.has(code),
        product,
        refs,
      };
    })
    .sort((a, b) => a.code.localeCompare(b.code));

  const hardcodedActiveCodes = new Set(
    Object.values(lists)
      .flat()
      .filter((entry) => !entry.commentedOut)
      .map((entry) => entry.code)
  );
  for (const code of fileRefs.keys()) hardcodedActiveCodes.add(code);

  const addedProducts = liveProducts
    .filter((product) => !hardcodedActiveCodes.has(product.code))
    .sort((a, b) => {
      const brandCmp = a.brand.localeCompare(b.brand);
      return brandCmp !== 0 ? brandCmp : a.code.localeCompare(b.code);
    });

  const comparisonProblems = [
    ...new Map(
      ["GTARIFFS", "EETARIFFS", "ETARIFFS", "CURRENT_VARIABLE_CODE"]
        .flatMap((name) => listReport[name] ?? [])
        .filter((entry) =>
          ["expired", "expired-restricted", "missing"].includes(entry.status)
        )
        .map((entry) => [entry.code, entry])
    ).values(),
  ];
  const latestTracker = listReport.TRACKER[0];
  const latestAgile = listReport.AGILE[0];

  const report = {
    fetchedAt: new Date().toISOString(),
    publicProductCount: liveProducts.length,
    comparisonLists: Object.fromEntries(
      ["CURRENT_VARIABLE_CODE", "ETARIFFS", "GTARIFFS", "EETARIFFS"].map(
        (name) => [name, listReport[name]]
      )
    ),
    historicalLists: {
      AGILE: listReport.AGILE,
      TRACKER: listReport.TRACKER,
    },
    otherHardcoded,
    addedProducts: addedProducts.map(slimProduct),
    comparisonProblems: comparisonProblems.map((entry) => entry.code),
    latestAgile: latestAgile
      ? { code: latestAgile.code, status: latestAgile.status }
      : null,
    latestTracker: latestTracker
      ? { code: latestTracker.code, status: latestTracker.status }
      : null,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(comparisonProblems.length ? 1 : 0);
  }

  console.log(bold("Octopus products vs hardcoded tariffs"));
  console.log(
    `Fetched ${liveProducts.length} currently available products from ${PRODUCTS_URL}`
  );
  console.log(
    dim(
      "Restricted tariffs (e.g. Tracker) are omitted from that list and are looked up by code."
    )
  );

  printHeading("Comparison tariffs in src/data/source.ts");
  for (const name of ["CURRENT_VARIABLE_CODE", "ETARIFFS", "GTARIFFS", "EETARIFFS"]) {
    console.log(`\n  ${cyan(name)}`);
    for (const entry of listReport[name]) {
      const product = entry.product;
      const extra = [
        entry.category,
        productSummary(product),
        entry.replacement
          ? `possible replacement: ${entry.replacement.code} (${entry.replacement.display_name})`
          : null,
      ]
        .filter(Boolean)
        .join(" · ");
      printCodeRow(entry.code, entry.status, extra);
    }
  }

  printHeading("Historical Agile / Tracker catalogues");
  for (const name of ["AGILE", "TRACKER"]) {
    console.log(`\n  ${cyan(name)} ${dim("(older versions are expected to be expired)")}`);
    for (const entry of listReport[name]) {
      printCodeRow(
        entry.code,
        entry.status,
        [entry.name, entry.currentPlan ? "marked currentPlan" : null, productSummary(entry.product)]
          .filter(Boolean)
          .join(" · ")
      );
    }
  }

  if (otherHardcoded.length) {
    printHeading("Other hardcoded product codes");
    for (const entry of otherHardcoded) {
      const locs = entry.refs
        .map((ref) => `${ref.file}:${ref.line}`)
        .join(", ");
      printCodeRow(entry.code, entry.status, `${locs} · ${productSummary(entry.product)}`);
    }
  }

  printHeading("Currently available API products not hardcoded");
  if (!addedProducts.length) {
    console.log(dim("  None."));
  } else {
    let lastBrand = null;
    for (const product of addedProducts) {
      if (product.brand !== lastBrand) {
        lastBrand = product.brand;
        console.log(`\n  ${cyan(product.brand)}`);
      }
      const flags = [
        product.direction,
        product.is_prepay ? "prepay" : null,
        product.is_business ? "business" : null,
        product.available_to ? `until ${formatDate(product.available_to)}` : null,
      ].filter(Boolean);
      console.log(
        `  ${pad(product.code, 38)} ${product.display_name}`
      );
      console.log(`    ${dim(`${product.full_name} · ${flags.join(" · ")}`)}`);
    }
  }

  printHeading("Summary");
  const staleComparison = comparisonProblems.map((entry) => entry.code);
  const newOctopus = addedProducts.filter(
    (product) => product.brand === "OCTOPUS_ENERGY" && !product.is_prepay
  );
  if (staleComparison.length) {
    console.log(
      red(
        `  ${staleComparison.length} comparison tariff(s) are missing or no longer available:`
      )
    );
    for (const entry of comparisonProblems) {
      const hint = entry.replacement
        ? ` → ${entry.replacement.code}`
        : "";
      console.log(red(`    - ${entry.code}${hint}`));
    }
  } else {
    console.log(green("  Comparison tariff lists are all still available."));
  }
  if (latestAgile && latestAgile.status !== "available") {
    console.log(
      yellow(`  Latest AGILE catalogue entry ${latestAgile.code} is not currently available.`)
    );
  }
  if (
    latestTracker &&
    !["available", "restricted"].includes(latestTracker.status)
  ) {
    console.log(
      yellow(
        `  Latest TRACKER catalogue entry ${latestTracker.code} is not currently available.`
      )
    );
    console.log(
      dim(
        "  Tracker products are restricted, so newer codes cannot be discovered from the public catalogue."
      )
    );
  }
  console.log(
    `  ${newOctopus.length} Octopus Energy (non-prepay) product(s) are live but not hardcoded.`
  );

  process.exit(comparisonProblems.length ? 1 : 0);
}

main().catch((error) => {
  console.error(red(error.stack || error.message));
  process.exit(2);
});
