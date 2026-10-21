// Local stand-in for the Workers `cloudflare:sockets` module.
// Node-based runs only exercise the control plane; attempting a proxy
// connection reports that clearly instead of pretending to open a socket.
export function connect() {
  throw new Error('cloudflare:sockets is only available inside the Cloudflare Workers runtime');
}

export default { connect };
