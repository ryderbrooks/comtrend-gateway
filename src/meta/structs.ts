export type sLineRateInfo = {
    kbps: number;
    MBps: number;
    MBps_wf: number;
};

export type sGatewayLineInfo = {
    upstream: sLineRateInfo;
    downstream: sLineRateInfo;
    upDownRatio: number;
};

