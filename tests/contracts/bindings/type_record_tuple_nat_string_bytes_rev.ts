import * as ex from "@completium/experiment-ts";
import * as att from "@completium/archetype-ts-types";
export class my_record implements att.ArchetypeType {
    constructor(public n: att.Nat, public v: [
        [
            att.Nat,
            string
        ],
        att.Bytes
    ], public s: string) { }
    toString(): string {
        return JSON.stringify(this, null, 2);
    }
    to_mich(): att.Micheline {
        return att.pair_to_mich([this.n.to_mich(), att.pair_to_mich([att.pair_to_mich([att.pair_to_mich([this.v[0][0].to_mich(), att.string_to_mich(this.v[0][1])]), this.v[1].to_mich()]), att.string_to_mich(this.s)])]);
    }
    equals(v: my_record): boolean {
        return (this.n.equals(v.n) && this.n.equals(v.n) && ((x, y) => {
            return ((x, y) => {
                return x[0].equals(y[0]) && x[1] == y[1];
            })(x[0], y[0]) && x[1].equals(y[1]);
        })(this.v, v.v) && this.s == v.s);
    }
}
export const my_record_mich_type: att.MichelineType = att.pair_array_to_mich_type([
    att.prim_annot_to_mich_type("nat", ["%n"]),
    att.pair_array_to_mich_type([
        att.pair_array_to_mich_type([
            att.pair_array_to_mich_type([
                att.prim_annot_to_mich_type("nat", []),
                att.prim_annot_to_mich_type("string", [])
            ], []),
            att.prim_annot_to_mich_type("bytes", [])
        ], ["%v"]),
        att.prim_annot_to_mich_type("string", ["%s"])
    ], [])
], []);
const set_value_arg_to_mich = (i: my_record): att.Micheline => {
    return i.to_mich();
}
export class Type_record_tuple_nat_string_bytes_rev {
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
        const address = (await ex.deploy("./tests/contracts/type_record_tuple_nat_string_bytes_rev.arl", {}, params)).address;
        this.address = address;
    }
    async set_value(i: my_record, params: Partial<ex.Parameters>): Promise<any> {
        if (this.address != undefined) {
            return await ex.call(this.address, "set_value", set_value_arg_to_mich(i), params);
        }
        throw new Error("Contract not initialised");
    }
    async get_set_value_param(i: my_record, params: Partial<ex.Parameters>): Promise<att.CallParameter> {
        if (this.address != undefined) {
            return await ex.get_call_param(this.address, "set_value", set_value_arg_to_mich(i), params);
        }
        throw new Error("Contract not initialised");
    }
    async get_res(): Promise<my_record> {
        if (this.address != undefined) {
            const storage = await ex.get_storage(this.address);
            return new my_record((x => { return new att.Nat(x); })(storage.n), (x => { return [[(x => { return new att.Nat(x); })(x[Object.keys(x)[0]]), (x => { return x; })(x[Object.keys(x)[1]])], (x => { return new att.Bytes(x); })(x[Object.keys(x)[2]])]; })(storage.v), (x => { return x; })(storage.s));
        }
        throw new Error("Contract not initialised");
    }
    errors = {};
}
export const type_record_tuple_nat_string_bytes_rev = new Type_record_tuple_nat_string_bytes_rev();
