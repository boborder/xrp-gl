import { ripemd160 } from '@noble/hashes/ripemd160';

export const hash = async (text: string | undefined) => {
    const encoder = new TextEncoder();
    const shaBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(text));
    const shaHex = Array.from(new Uint8Array(shaBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    const ripBuffer = ripemd160(encoder.encode(shaHex));
    const ripHex = Array.from(new Uint8Array(ripBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    return ripHex;
}
