import * as ex from "@completium/experiment-ts";
import * as att from "@completium/archetype-ts-types";
const view_get_value_arg_to_mich = (i: [
    att.Nat,
    string
]): att.Micheline => {
    return att.pair_to_mich([i[0].to_mich(), att.string_to_mich(i[1])]);
}
export class Type_view_tuple_nat_string {
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
        const address = (await ex.deploy("./tests/contracts/type_view_tuple_nat_string.arl", {}, params)).address;
        this.address = address;
    }
    async view_get_value(i: [
        att.Nat,
        string
    ], params: Partial<ex.Parameters>): Promise<[
        att.Nat,
        string
    ]> {
        if (this.address != undefined) {
            const mich = await ex.exec_view(this.get_address(), "get_value", view_get_value_arg_to_mich(i), params);
            return [(x => { return new att.Nat(x); })(mich.value[Object.keys(mich.value)[0]]), (x => { return x; })(mich.value[Object.keys(mich.value)[1]])];
        }
        throw new Error("Contract not initialised");
    }
    errors = {};
}
export const type_view_tuple_nat_string = new Type_view_tuple_nat_string();
