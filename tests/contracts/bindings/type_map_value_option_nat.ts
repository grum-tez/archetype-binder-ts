import * as ex from "@completium/experiment-ts";
import * as att from "@completium/archetype-ts-types";
const set_value_arg_to_mich = (i: att.Option<att.Nat>): att.Micheline => {
    return i.to_mich((x => { return x.to_mich(); }));
}
export class Type_map_value_option_nat {
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
        const address = (await ex.deploy("./tests/contracts/type_map_value_option_nat.arl", {}, params)).address;
        this.address = address;
    }
    async set_value(i: att.Option<att.Nat>, params: Partial<ex.Parameters>): Promise<any> {
        if (this.address != undefined) {
            return await ex.call(this.address, "set_value", set_value_arg_to_mich(i), params);
        }
        throw new Error("Contract not initialised");
    }
    async get_set_value_param(i: att.Option<att.Nat>, params: Partial<ex.Parameters>): Promise<att.CallParameter> {
        if (this.address != undefined) {
            return await ex.get_call_param(this.address, "set_value", set_value_arg_to_mich(i), params);
        }
        throw new Error("Contract not initialised");
    }
    async get_res(): Promise<Array<[
        att.Nat,
        att.Option<att.Nat>
    ]>> {
        if (this.address != undefined) {
            const storage = await ex.get_storage(this.address);
            let res: Array<[
                att.Nat,
                att.Option<att.Nat>
            ]> = [];
            for (let e of storage.entries()) {
                res.push([(x => { return new att.Nat(x); })(e[0]), (x => { return new att.Option<att.Nat>(x == null ? null : (x => { return new att.Nat(x); })(x)); })(e[1])]);
            }
            return res;
        }
        throw new Error("Contract not initialised");
    }
    errors = {};
}
export const type_map_value_option_nat = new Type_map_value_option_nat();
