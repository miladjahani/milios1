// ESM loader hooks: alias the Workers-only `cloudflare:sockets` module to a
// local stub so the control plane can run on plain Node (tests, dev server).
const STUB = new URL('./sockets-stub.mjs', import.meta.url).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'cloudflare:sockets') {
    return { url: STUB, shortCircuit: true, format: 'module' };
  }
  return nextResolve(specifier, context);
}
