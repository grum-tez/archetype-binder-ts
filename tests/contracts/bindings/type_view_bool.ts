import * as ex from "@completium/experiment-ts";
import * as att from "@completium/archetype-ts-types";
const view_get_value_arg_to_mich = (i: boolean): att.Micheline => {
    return att.bool_to_mich(i);
}
export class Type_view_bool {
    address: string | undefined;
    constructor(address: string | undefined = undefined) {
        this.address = address;
    }
    get_address(): att.Address {
        if (undefined != this.address) {
            return new att.Address(this.address);
        }
        throw new Error("Contract not initialised");
    }
    async get_balance(): Promise<att.Tez> {
        if (null != this.address) {
            return await ex.get_balance(new att.Address(this.address));
        }
        throw new Error("Contract not initialised");
    }
    async deploy(params: Partial<ex.Parameters>) {
        const address = (await ex.deploy("./tests/contracts/type_view_bool.arl", {}, params)).address;
        this.address = address;
    }
    async view_get_value(i: boolean, params: Partial<ex.Parameters>): Promise<boolean> {
        if (this.address != undefined) {
            const mich = await ex.exec_view(this.get_address(), "get_value", view_get_value_arg_to_mich(i), params);
            return mich.prim ? (mich.prim == "True" ? true : false) : mich;
        }
        throw new Error("Contract not initialised");
    }
    errors = {};
}
export const type_view_bool = new Type_view_bool();
