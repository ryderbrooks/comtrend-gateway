import { assert }                from 'chai';
import { IGatewayAdapter }       from '../meta/interfaces';
import { sGatewayLineInfo }      from '../meta/structs';
import { createComtrendAdapter } from '../index';


describe('comtrend gateway adapter', () => {
    const comtrendAuthToken: string = 'Basic cm9vdDoxMjM0NQ==';

    const localAddress: string = '192.168.1.12';
    const localPort: number    = 3333;

    const gatewayAdapter: IGatewayAdapter = createComtrendAdapter(comtrendAuthToken);


    const exp: RegExp = new RegExp(`value='${ localAddress }\\|${ localPort }\\|${ localPort }\\|TCP\|${ localPort }\\|${ localPort }\\|ppp0\\.1'`,
                                   'gm');


    it('gets upstream data rate', async () => {
        try {
            const speeds: sGatewayLineInfo = await gatewayAdapter.networkRates();
            assert.isNotNaN(speeds.upstream.MBps_wf);
            assert.isNumber(speeds.upstream.MBps_wf);
        } catch ( e ) {
            throw e;
        }
    });


    it('gets downstream data rate', async () => {
        try {
            const speeds: sGatewayLineInfo = await gatewayAdapter.networkRates();
            assert.isNotNaN(speeds.downstream.MBps_wf);
            assert.isNumber(speeds.downstream.MBps_wf);
        } catch ( e ) {
            throw e;
        }
    });
    it('gets gatewayIP', async () => {
        try {
            const ip: string  = await gatewayAdapter
                .gatewayPublicIP();
            const exp: RegExp = /[\d]{1,3}.[\d]{1,3}.[\d]{1,3}.[\d]{1,3}/gm;
            assert.isTrue(exp.test(ip));
        } catch ( e ) {
            throw e;
        }
    });

    it('opens NAT tunnel', async () => {
        try {
            const response: string = await gatewayAdapter
                .openTrafficFor(localAddress, localPort);
            assert.isTrue(exp.test(response));
        } catch ( e ) {
            throw e;
        }
    });

    it('closes NAT tunnel', async () => {
        try {
            const response: string = await gatewayAdapter
                .closeTrafficFor(localAddress, localPort);
            assert.isFalse(exp.test(response), response);
        } catch ( e ) {
            throw e;
        }
    });
});
