export class EnclaveClient {
    private apiUrl = 'custody-reference-app.vercel.app';

    async register(publicShareA: string): Promise<string> {
        console.log("[Enclave] Connecting to " + this.apiUrl);
        try {
            const response = await fetch(`${this.apiUrl}/sign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    destination: "LIVE_FIRE_TEST",
                    amount: 0
                })
            });

            if (!response.ok) throw new Error("Enclave Unreachable");

            console.log("[Enclave] Connection Established.");
            return "04_MOCK_SHARE_B_PUBLIC_KEY";
        } catch (e) {
            console.error("Enclave Error:", e);
            throw e;
        }
    }
}
