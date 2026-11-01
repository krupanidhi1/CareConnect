/** Tiny logger — timestamps + levels, no extra dependency. */
const fmt = (level, msg, extra) => {
  const ts = new Date().toISOString();
  const base = `[${ts}] ${level}: ${msg}`;
  return extra !== undefined ? `${base} ${typeof extra === "string" ? extra : JSON.stringify(extra)}` : base;
};

module.exports = {
  info: (msg, extra) => console.log(fmt("INFO", msg, extra)),
  warn: (msg, extra) => console.warn(fmt("WARN", msg, extra)),
  error: (msg, extra) => console.error(fmt("ERROR", msg, extra)),
  debug: (msg, extra) => {
    if (process.env.NODE_ENV !== "production") console.log(fmt("DEBUG", msg, extra));
  },
};