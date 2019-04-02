import { sGatewayLineInfo } from './structs';



export interface IGatewayAdapter {
    openTrafficFor(ip:string, port:number): Promise<string>;
    closeTrafficFor(ip:string, port:number):Promise<string>;
    gatewayPublicIP():Promise<string>;
    networkRates():Promise<sGatewayLineInfo>;
}
