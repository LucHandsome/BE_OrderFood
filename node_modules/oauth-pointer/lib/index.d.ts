import { IApp } from "./types";
export declare class PointerStrategy {
    private axiosInstance;
    private clientId;
    private clientSecret;
    private callbackUrl;
    constructor({ clientId, clientSecret, callbackUrl }: IApp);
    getAccessToken(code: string): Promise<any>;
    getUser(accessToken: string): Promise<any>;
}
