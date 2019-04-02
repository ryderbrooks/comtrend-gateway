import * as http            from 'http';
import { IGatewayAdapter }  from '../meta/interfaces';
import { sGatewayLineInfo } from '../meta/structs';
import { REJ, RES }         from '../meta/types';
import { LineRates }        from './LineRates';



export class Comtrend_VirtualServer implements IGatewayAdapter {
    async openTrafficFor( ip: string, port: number ): Promise<string> {
        try {
            const sessionKey: string = await this.getSessionID();
            const response: string   = await this._addVServer(ip, port, sessionKey);
            return response;
        } catch ( e ) {
            throw e;
        }
    }


    async closeTrafficFor( ip: string, port: number ): Promise<string> {
        try {
            const sessionKey: string = await this.getSessionID();
            const response: string   = await this._removeServer(ip, port, sessionKey);
            return response;
        } catch ( e ) {
            throw e;
        }
    }


    async gatewayPublicIP(): Promise<string> {
        try {
            const body: string                  = await this.request(`${ this.host }/wancfg.cmd?action=view`);
            const match: RegExpExecArray | null = this.gatewayIPExp.exec(body);
            if( match ) {
                return match[ 1 ];
            }
            throw new Error('gateway ip regex fail');
        } catch ( e ) {
            throw e;
        }
    }


    async networkRates(): Promise<sGatewayLineInfo> {
        try {
            const body: string            = await this.request(`${ this.host }/info.html`);
            const lineRateInfo: LineRates = new LineRates(body);
            return {
                upstream    : lineRateInfo.upstreamRate,
                downstream  : lineRateInfo.downstreamRate,
                upDownRatio : lineRateInfo.upDownRatio,
            };
        } catch ( e ) {
            throw e;
        }
    }


    constructor( authToken: string ) {
        this.Authorization = authToken;
    }


    private readonly Authorization: string;
    private ip: string   = '192.168.1.1';
    private path: string = 'scvrtsrv';


    private get header(): any {
        return { Host : this.ip, Authorization : this.Authorization };
    }


    private get host(): string {
        return `http://${ this.ip }`;
    }


    private get getVServer(): string {
        return `${ this.host }/${ this.path }.html`;
    }


    private get addVServerPath(): string {
        return `${ this.host }/${ this.path }.cmd`;
    }


    private get sessionKeyExp(): RegExp {
        return /&sessionKey=([\d]+)/gm;
    }


    private get gatewayIPExp(): RegExp {
        return /<td>([\d]{1,3}.[\d]{1,3}.[\d]{1,3}.[\d]{1,3})<\/td>/gm;
    }


    private async getSessionID(): Promise<string> {
        try {
            const body: string                  = await this.getVServerData();
            const match: RegExpExecArray | null = this.sessionKeyExp.exec(body);
            if( match ) {
                return match[ 1 ];
            }
            throw new Error('no sessionKey Match');
        } catch ( e ) {
            throw e;
        }
    }


    private _addVServer( serverIP: string,
                         serverPort: number,
                         sessionKey: string ): Promise<string> {
        const query: string = [
            'action=add',
            'srvName=ValidationServer',
            'dstWanIf=all',
            `srvAddr=${ serverIP }`,
            'loopbackEnable=1',
            'proto=1,',
            `eStart=${ serverPort },`,
            `eEnd=${ serverPort },`,
            `iStart=${ serverPort },`,
            `iEnd=${ serverPort },`,
            `sessionKey=${ sessionKey }`,
        ].join('&');
        return this.request(`${ this.addVServerPath }?${ query }`);
    }


    private request( url: string ): Promise<string> {
        return new Promise<string>(( res: RES<string>, rej: REJ ): void => {
            http.get(url,
                     { headers : this.header },
                     ( response: http.IncomingMessage ): void => {
                         const { statusCode } = response;

                         if( statusCode !== 200 ) {
                             response.resume();
                             rej(new Error(`Request failed Status: ${ statusCode }`));
                             return;
                         }

                         let data: Buffer[] = [];
                         response.on('data',
                                     ( chunk: Buffer ): void => {
                                         data.push(chunk);
                                     });
                         response.once('end', () => {
                             const D: string = Buffer.concat(
                                 data).toString('utf8');
                             data            = null;
                             res(D);
                         });
                         response.once('error',
                                       ( err: Error ): void => {
                                           rej(err);
                                       });
                     })
                .once('error', ( err: Error ): void => {
                    rej(err);
                });
        });
    }


    private _removeServer( ip: string,
                           port: number,
                           sessionKey: string ): Promise<string> {
        try {
            const query: string = [
                'action=remove',
                `rmLst=${ ip }|${ port }|${ port }|TCP|${ port }|${ port }|ppp0.1,`,
                `sessionKey=${ sessionKey }`,
            ].join('&');
            return this.request(`${ this.addVServerPath }?${ query }`);
        } catch ( e ) {
            throw e;
        }
    }


    private getVServerData(): Promise<string> {
        return this.request(this.getVServer);
    }
}


