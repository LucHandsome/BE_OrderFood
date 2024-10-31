import { createOrderDto, resCancelOrderDto, resCreateOrderDto } from "./types";
export declare class Pointer {
    private secretKey;
    private instance;
    constructor(secretKey: string);
    createPayment: (body: createOrderDto) => Promise<resCreateOrderDto>;
    cancelOrder: (transactionID: string) => Promise<resCancelOrderDto>;
}
