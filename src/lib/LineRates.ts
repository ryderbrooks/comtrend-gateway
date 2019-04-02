import { sLineRateInfo } from '../meta/structs';



export class LineRates {
    private readonly body: string;
    private readonly frictionPct: number = 0.26;


    constructor( body: string ) {
        this.body = body;
    }


    get upstreamRate(): sLineRateInfo {
        return this._checkMatch(LineRates
                                    .streamRateExp('Upstream'));
    }


    get downstreamRate(): sLineRateInfo {
        return this._checkMatch(LineRates
                                    .streamRateExp('Downstream'));
    }


    get upDownRatio(): number {
        return this.upstreamRate.kbps / this.downstreamRate.kbps;
    }


    private static streamRateExp( direction: 'Upstream' | 'Downstream' ): RegExp {
        return new RegExp(`>Line\\s+Rate\\s+-\\s+${ direction }\\s+\\(Kbps\\):<\\/td>"\\);\\s+[\\S]+>(\\d+)`, 'im');
    }


    private kliobitsPS_to_megaBytesPS( kbps: number ): number {
        return ((kbps * CONVERSIONS.BPS_PER_KBPS)
               / CONVERSIONS.BITS_PER_BYTE) / CONVERSIONS.BYTES_PER_MEGABYTE;
    }


    private _checkMatch( pattern: RegExp ): sLineRateInfo {
        const match: RegExpExecArray | null = pattern.exec(this.body);
        switch ( true ) {
            case match === null:
            case Array.isArray(match) === false:
            case typeof match![ 1 ] !== 'string':
            case isNaN(parseInt(match![ 1 ], 10)):
                throw new Error('line rate data match failed');
            default:
                // should always be in kbps
                const kbps: number        = parseInt(match![ 1 ], 10);
                const megaBytesPS: number = this.kliobitsPS_to_megaBytesPS(kbps);
                return {
                    kbps,
                    MBps    : megaBytesPS,
                    MBps_wf : megaBytesPS * (1 - this.frictionPct),
                };

        }
    }
}
