import {BigNumber} from "bignumber.js";

export enum PaymentStatus
{
    Pending,
    Sent,
    Done
}

export class HolderInfo
{
    private holder: string;
    private profit: BigNumber;
    private status: PaymentStatus;
    private transactionHash: string;

    public get Holder() { return this.holder; }

    public get Profit() { return window['web3'].fromWei(this.profit).toString(10); }

    public get Status() {
        if (this.status === PaymentStatus.Done) return 'Done';
        if (this.status === PaymentStatus.Sent) return 'Sent';
        if (this.status === PaymentStatus.Pending) return 'Pending';
        return 'Unknown';
    }

    public get TransactionHash() {
        if (!this.transactionHash) return 'Unknown';
        return this.transactionHash;
    }
    public get TransactionHashUrl() {
        if (!this.transactionHash) return '';
        return `https://etherscan.io/tx/${this.transactionHash}`;
    }

    public static Build(data: any) : HolderInfo
    {
        let obj = new HolderInfo(data['holder'].toLowerCase(), data['profit']);
        obj.status = data['status'];
        obj.transactionHash = data['transactionHash'];
        return obj;
    }

    constructor(holder:string, profit: BigNumber)
    {
        this.holder = holder.toLowerCase();
        this.profit = profit;
        this.status = PaymentStatus.Pending;
    }
}