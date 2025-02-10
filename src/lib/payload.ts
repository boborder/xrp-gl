import { Xumm } from "xumm";

const push = async (payload: any) => {
  const message = payload.pushed
    ? `Payload '${payload.uuid}' pushed to your phone.`
    : "Payload not pushed, opening payload...";
  alert(message);
  if (!payload.pushed) {
    window.open(payload.next.always);
  }
};

export const createPayload = async (Transaction: any) => {
  const apiKey = process.env.XUMMAPI;
		if (!apiKey) {
			throw new Error("XUMMAPI environment variable is not set.");
		}
		const xumm = new Xumm(apiKey);

		const payload = await xumm.payload?.create({
			...Transaction,
			Fee: 123,
		});
		if (payload) {
			if (xumm.xapp) {
				await xumm.xapp?.openSignRequest(payload);
			} else {
				push(payload);
			}
			const qr = payload.refs.qr_png;
			const uuid = payload.uuid;
			return { qr, uuid };
		}
};
