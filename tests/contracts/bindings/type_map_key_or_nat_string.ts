import * as ex from "@completium/experiment-ts";
import * as att from "@completium/archetype-ts-types";
const set_value_arg_to_mich = (i: att.Or<att.Nat, string>): att.Micheline => {
    return i.to_mich((x => { return x.to_mich(); }), (x => { return att.string_to_mich(x); }));
}
export class Type_map_key_or_nat_string {
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
        const address = (await ex.deploy("./tests/contracts/type_map_key_or_nat_string.arl", {}, params)).address;
        this.address = address;
    }
    async set_value(i: att.Or<att.Nat, string>, params: Partial<ex.Parameters>): Promise<any> {
        if (this.address != undefined) {
            return await ex.call(this.address, "set_value", set_value_arg_to_mich(i), params);
        }
        throw new Error("Contract not initialised");
    }
    async get_set_value_param(i: att.Or<att.Nat, string>, params: Partial<ex.Parameters>): Promise<att.CallParameter> {
        if (this.address != undefined) {
            return await ex.get_call_param(this.address, "set_value", set_value_arg_to_mich(i), params);
        }
        throw new Error("Contract not initialised");
    }
    async get_res(): Promise<Array<[
        att.Or<att.Nat, string>,
        att.Nat
    ]>> {
        if (this.address != undefined) {
            const storage = await ex.get_storage(this.address);
            let res: Array<[
                att.Or<att.Nat, string>,
                att.Nat
            ]> = [];
            for (let e of storage.entries()) {
                res.push([(x => { return (x => {
                        const is_left = x["0"] !== undefined;
                        const value = is_left ? (x => { return new att.Nat(x); })(x["0"]) : (x => { return x; })(x["1"]);
                        return new att.Or<att.Nat, string>(value, is_left);
                    })(x); })(e[0]), (x => { return new att.Nat(x); })(e[1])]);
            }
            return res;
        }
        throw new Error("Contract not initialised");
    }
    errors = {};
}
export const type_map_key_or_nat_string = new Type_map_key_or_nat_string();
