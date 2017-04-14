import {BigNumber} from "bignumber.js";
import {Web3} from "./Web3";

export class DividendInfo
{
    public Index: number;
    public AmountDividend: BigNumber;
    public AllPaymentsSent: boolean;

    private contractIndex: number;
    private blockDividend: number;


    private get SmartRouletteToken() : any
    {
        return Web3.Instance.SmartRouletteTokens[this.contractIndex];
    }

    private get SmartRouletteDividend() : any
    {
        return Web3.Instance.SmartRouletteDividends[this.contractIndex];
    }

    public get RouletteAddress() : string
    {
        return Web3.Instance.SmartRoulettes[this.contractIndex].address;
    }

    private get Decimals() : number
    {
        return Web3.Instance.decimals[this.contractIndex];
    }

    public get BlockDividend(): number
    {
        if (this.Index == 0 && this.SmartRouletteDividend.address == '0x962c38542eF6e2bf248a5D59EdeE43CD83E85A52') return this.blockDividend + 92;

        return this.blockDividend;
    }

    public constructor(Index:number, AmountDividend: BigNumber, blockDividend: number, AllPaymentsSent: boolean, contractIndex: number)
    {
        this.Index = Index;
        this.AmountDividend = AmountDividend;
        this.blockDividend = blockDividend;
        this.AllPaymentsSent = AllPaymentsSent;
        this.contractIndex = contractIndex;
    }


    public getHolderTokensCountNow(address: string)
    {
        return this.getHolderTokensCountByBlock(address, 'latest');
    }

    public getHolderTokensCount(address: string)
    {
        return this.getHolderTokensCountByBlock(address, this.BlockDividend);
    }

    private getHolderTokensCountByBlock(address: string, blockNo : any)
    {
        let pThis = this;
        return new Promise((resolve, reject)=>
        {
            pThis.SmartRouletteToken.balanceOf(address, blockNo, (err, tokens: BigNumber)=>
            {
                if (!err)
                    pThis.SmartRouletteToken.tempTokensBalanceOf(address, blockNo, (err, tokensTemp: BigNumber)=>
                    {
                        if (!err)
                            //      (tokens + tokensTemp) / 10^decimals
                            resolve(tokens.plus(tokensTemp).div((new BigNumber(10)).pow(pThis.Decimals)) as BigNumber);
                        else
                            reject(err);
                    });
                else
                    reject(err);
            });
        });
    }

    public getHolderProfit(holder: string)
    {
        return new Promise((resolve, reject)=>
        {
            this.SmartRouletteDividend.get_HoldersProfit(this.Index,holder, this.BlockDividend, (err, profit)=>
            {
                if (!err)
                    resolve(profit);
                else
                    reject(err);
            });
        });
    }

    public getHolders()
    {
        let pThis = this;
        return new Promise((resolve, reject)=>
        {
            let AllHolders: Array<string> = [];
            let doIt = (pos) => {
                this.SmartRouletteDividend.get_Holders(pos, pThis.BlockDividend, (err, data) => {
                    if (!err && data) {
                        let holders = data[0];
                        let nextPosition = (data[1] as BigNumber).toNumber();

                        let validHolders = _.chain(holders)
                            .filter((holder) => new BigNumber(holder).greaterThan(0))
                            .uniq()
                            .value();

                        AllHolders = _.union(AllHolders, validHolders);
                        if (nextPosition > 0)
                        {
                            doIt(nextPosition);
                        }
                        else
                        {
                            resolve(AllHolders);
                        }
                    }
                    else {
                        console.log(`get_Holders err=${err}`);
                        reject();
                    }
                });
            };
            doIt(0); // с 0-ой позиции
        });
    }

    public GetAmountInETH(): string
    {
        return (Web3.Instance.fromWei(this.AmountDividend) as BigNumber).toString(10);
    }
}