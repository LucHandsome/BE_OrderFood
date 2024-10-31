"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pointer = void 0;
const axios_1 = require("axios");
class Pointer {
    constructor(secretKey) {
        this.createPayment = (body) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const response = yield this.instance.post("/api/payment/create-order", body);
                return response.data;
            }
            catch (error) {
                if (((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status) == 401) {
                    throw new Error("Secret key invalid");
                }
                throw new Error(error.response.data.message);
            }
        });
        this.cancelOrder = (transactionID) => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.instance.post("/api/payment/cancel-order", {
                    transactionID,
                });
                return response.data;
            }
            catch (error) {
                throw new Error(error.response.data.message);
            }
        });
        this.secretKey = secretKey;
        this.instance = axios_1.default.create({
            baseURL: "https://api.pointer.io.vn",
            timeout: 10000,
            headers: {
                Authorization: `Bearer ${this.secretKey}`,
            },
        });
    }
}
exports.Pointer = Pointer;
