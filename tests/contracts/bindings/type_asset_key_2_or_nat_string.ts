import * as ex from "@completium/experiment-ts";
import * as att from "@completium/archetype-ts-types";
export class my_asset_key implements att.ArchetypeType {
    constructor(public k: att.Or<att.Nat, string>, public n: att.Nat) { }
    toString(): string {
        return JSON.stringify(this, null, 2);
    }
    to_mich(): att.Micheline {
        return att.pair_to_mich([this.k.to_mich((x => { return x.to_mich(); }), (x => { return att.string_to_mich(x); })), this.n.to_mich()]);
    }
    equals(v: my_asset_key): boolean {
        return (this.k == v.k && this.k == v.k && this.n.equals(v.n));
    }
}
export const my_asset_key_mich_type: att.MichelineType = att.pair_array_to_mich_type([
    att.or_to_mich_type(att.prim_annot_to_mich_type("nat", []), att.prim_annot_to_mich_type("string", []), ["%k"]),
    att.prim_annot_to_mich_type("nat", ["%n"])
], []);
export type my_asset_value = string;
export const my_asset_value_mich_type: att.MichelineType = att.prim_annot_to_mich_type("string", []);
export type my_asset_container = Array<[
    my_asset_key,
    my_asset_value
]>;
export const my_asset_container_mich_type: att.MichelineType = att.pair_annot_to_mich_type("map", att.pair_array_to_mich_type([
    att.or_to_mich_type(att.prim_annot_to_mich_type("nat", []), att.prim_annot_to_mich_type("string", []), ["%k"]),
    att.prim_annot_to_mich_type("nat", ["%n"])
], []), att.prim_annot_to_mich_type("string", []), []);
const asset_put_arg_to_mich = (i: att.Or<att.Nat, string>): att.Micheline => {
    return i.to_mich((x => { return x.to_mich(); }), (x => { return att.string_to_mich(x); }));
}
export class Type_asset_key_2_or_nat_string {
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
        const address = (await ex.deploy("./tests/contracts/type_asset_key_2_or_nat_string.arl", {}, params)).address;
        this.address = address;
    }
    async asset_put(i: att.Or<att.Nat, string>, params: Partial<ex.Parameters>): Promise<any> {
        if (this.address != undefined) {
            return await ex.call(this.address, "asset_put", asset_put_arg_to_mich(i), params);
        }
        throw new Error("Contract not initialised");
    }
    async get_asset_put_param(i: att.Or<att.Nat, string>, params: Partial<ex.Parameters>): Promise<att.CallParameter> {
        if (this.address != undefined) {
            return await ex.get_call_param(this.address, "asset_put", asset_put_arg_to_mich(i), params);
        }
        throw new Error("Contract not initialised");
    }
    async get_my_asset(): Promise<my_asset_container> {
        if (this.address != undefined) {
            const storage = await ex.get_storage(this.address);
            let res: Array<[
                my_asset_key,
                string
            ]> = [];
            for (let e of storage.entries()) {
                res.push([(x => { return new my_asset_key((x => { return (x => {
                        const is_left = x["0"] !== undefined;
                        const value = is_left ? (x => { return new att.Nat(x); })(x["0"]) : (x => { return x; })(x["1"]);
                        return new att.Or<att.Nat, string>(value, is_left);
                    })(x); })(x[0]), (x => { return new att.Nat(x); })(x[1])); })(e[0]), (x => { return x; })(e[1])]);
            }
            return res;
        }
        throw new Error("Contract not initialised");
    }
    errors = {};
}
export const type_asset_key_2_or_nat_string = new Type_asset_key_2_or_nat_string();
