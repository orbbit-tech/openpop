// Stub for @evervault/wasm-attestation-bindings — TEE attestation not needed in this app.
export function attestEnclave() { return true }
export function validateAttestationDocPcrs() { return true }
export function getUserData() { return undefined }
export function getNonce() { return undefined }
export class PCRs {
  constructor() {}
  static empty() { return new PCRs() }
  get hashAlgorithm() { return undefined }
  set hashAlgorithm(_) {}
  get pcr0() { return undefined }
  set pcr0(_) {}
  get pcr1() { return undefined }
  set pcr1(_) {}
  get pcr2() { return undefined }
  set pcr2(_) {}
  get pcr8() { return undefined }
  set pcr8(_) {}
  free() {}
}
export function initSync() { return {} }
export default async function __wbg_init() { return {} }
