import {Comtrend_VirtualServer} from './lib/Comtrend';
import { IGatewayAdapter }      from './meta/interfaces';


export function createComtrendAdapter(authToken:string):IGatewayAdapter{
    return new Comtrend_VirtualServer(authToken);
}
