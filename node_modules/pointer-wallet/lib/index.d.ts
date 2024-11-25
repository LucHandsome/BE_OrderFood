import { connectedPaymentDto, createOrderDto, resCancelOrderDto, resCreateOrderDto, withdrawMoneyDto } from "./types";
export declare class Pointer {
    private secretKey;
    private instance;
    constructor(secretKey: string);
    createPayment: (body: createOrderDto) => Promise<resCreateOrderDto>;
    cancelOrder: (orderID: string) => Promise<resCancelOrderDto>;
    refundMoney: (orderID: string) => Promise<any>;
    withdrawMoney: (body: withdrawMoneyDto) => Promise<any>;
    connectedPayment: (body: connectedPaymentDto) => Promise<any>;
}
