/* Собирает dist/index.html в один автономный файл monstik-multik.html:
   весь JS и CSS вшиваются внутрь, медиа уже инлайнятся vite (assetsInlineLimit). */
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const dist = resolve("dist");
let html = readFileSync(join(dist, "index.html"), "utf8");

// хинты препрузки не нужны — весь код уже внутри
html = html.replace(/<link\b[^>]*rel="modulepreload"[^>]*>/g, "");

// фавикон тоже вшиваем, чтобы не было ни одной внешней ссылки
const favicon =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="18" r="13" fill="#2FBDB8"/><circle cx="11" cy="16" r="4.5" fill="#fff"/><circle cx="21" cy="16" r="4.5" fill="#fff"/><circle cx="11.8" cy="16.8" r="2.2" fill="#22304F"/><circle cx="21.8" cy="16.8" r="2.2" fill="#22304F"/></svg>'
  );
html = html.replace(/<link\b[^>]*rel="icon"[^>]*>/, `<link rel="icon" href="${favicon}" />`);

// <script ... src="/assets/xxx.js"></script> -> inline
html = html.replace(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g, (_m, src) => {
  const code = readFileSync(join(dist, src.replace(/^\.?\//, "")), "utf8");
  return `<script type="module">\n${code}\n</script>`;
});

// <link rel="stylesheet" ... href="/assets/xxx.css"> -> inline
html = html.replace(/<link\b[^>]*rel="stylesheet"[^>]*>/g, (tag) => {
  const href = tag.match(/href="([^"]+)"/)?.[1];
  if (!href) return tag;
  const css = readFileSync(join(dist, href.replace(/^\.?\//, "")), "utf8");
  return `<style>\n${css}\n</style>`;
});

const out = resolve("monstik-multik.html");
writeFileSync(out, html);

const leftover = html.match(/(src|href)="(?!data:|#)[^"]+"/g) || [];
console.log(`OK: ${out} (${(html.length / 1024 / 1024).toFixed(2)} MB)`);
console.log(`data:audio — ${(html.match(/data:audio/g) || []).length}, data:image — ${(html.match(/data:image/g) || []).length}`);
if (leftover.length) console.log("внешние ссылки:", leftover.join(", "));
