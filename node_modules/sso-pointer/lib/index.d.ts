export declare class PointerStrategy {
    private axiosInstance;
    private clientId;
    private clientSecret;
    constructor(clientId: string, clientSecret: string);
    getAccessToken(code: string): Promise<any>;
    verifyAccessToken(token: string): Promise<string | import("jsonwebtoken").JwtPayload>;
}
