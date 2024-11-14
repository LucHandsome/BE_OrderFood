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
exports.PointerStrategy = void 0;
const axios_1 = require("axios");
const public_key_1 = require("./public-key");
const jsonwebtoken_1 = require("jsonwebtoken");
class PointerStrategy {
    constructor(clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.axiosInstance = axios_1.default.create({
            baseURL: "https://oauth.pointer.io.vn",
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
    getAccessToken(code) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const response = yield this.axiosInstance.post("/auth/access-token", Object.assign(Object.assign({}, this), { code }));
                return response.data;
            }
            catch (error) {
                throw new Error((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data.message);
            }
        });
    }
    verifyAccessToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = (0, jsonwebtoken_1.verify)(token, public_key_1.PUBLIC_KEY, {
                algorithms: ["RS256"],
            });
            return payload;
        });
    }
}
exports.PointerStrategy = PointerStrategy;
