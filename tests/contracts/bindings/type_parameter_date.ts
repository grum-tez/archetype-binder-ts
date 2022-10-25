import * as ex from "@completium/experiment-ts";
import * as att from "@completium/archetype-ts-types";
const asset_add_arg_to_mich = (i: Date): att.Micheline => {
    return att.date_to_mich(i);
}
export class Type_parameter_date {
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
    async deploy(res: Date, params: Partial<ex.Parameters>) {
        const res = await ex.deploy("./tests/contracts/type_parameter_date.arl", {
            res: att.date_to_mich(res)
        }, params);
        this.address = res.address;
    }
    async asset_add(i: Date, params: Partial<ex.Parameters>): Promise<any> {
        if (this.address != undefined) {
            return await ex.call(this.address, "asset_add", asset_add_arg_to_mich(i), params);
        }
        throw new Error("Contract not initialised");
    }
    async get_asset_add_param(i: Date, params: Partial<ex.Parameters>): Promise<att.CallParameter> {
        if (this.address != undefined) {
            return await ex.get_call_param(this.address, "asset_add", asset_add_arg_to_mich(i), params);
        }
        throw new Error("Contract not initialised");
    }
    async get_res(): Promise<Date> {
        if (this.address != undefined) {
            const storage = await ex.get_storage(this.address);
            return new Date(storage);
        }
        throw new Error("Contract not initialised");
    }
    errors = {};
}
export const type_parameter_date = new Type_parameter_date();
