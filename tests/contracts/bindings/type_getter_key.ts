import * as ex from "@completium/experiment-ts";
import * as att from "@completium/archetype-ts-types";
const get_value_arg_to_mich = (i: att.Key): att.Micheline => {
    return i.to_mich();
}
export const deploy_get_value_callback = async (): Promise<string> => {
    return await ex.deploy_callback("get_value", att.prim_annot_to_mich_type("key", []));
};
export class Type_getter_key {
    address: string | undefined;
    constructor(address: string | undefined = undefined) {
        this.address = address;
    }
    get_value_callback_address: string | undefined;
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
        const res = await ex.deploy("./tests/contracts/type_getter_key.arl", {}, params);
        this.address = res.address;
        this.get_value_callback_address = await deploy_get_value_callback();
    }
    async get_value(i: att.Key, params: Partial<ex.Parameters>): Promise<att.Key> {
        if (this.address != undefined) {
            if (this.get_value_callback_address != undefined) {
                const entrypoint = new att.Entrypoint(new att.Address(this.get_value_callback_address), "callback");
                await ex.call(this.address, "get_value", att.getter_args_to_mich(get_value_arg_to_mich(i), entrypoint), params);
                return await ex.get_callback_value<att.Key>(this.get_value_callback_address, x => { return new att.Key(x); });
            }
        }
        throw new Error("Contract not initialised");
    }
    async get_res(): Promise<att.Key> {
        if (this.address != undefined) {
            const storage = await ex.get_storage(this.address);
            return new att.Key(storage);
        }
        throw new Error("Contract not initialised");
    }
    errors = {};
}
export const type_getter_key = new Type_getter_key();
