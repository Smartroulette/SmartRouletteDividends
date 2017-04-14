import { Injectable, EventEmitter } from '@angular/core';
import BigNumber from 'bignumber.js';
import * as _ from "underscore";
import {DividendInfo} from "./DividendInfo";
import {Config} from "../config/config.dividend";

@Injectable()
export class Web3
{
    public static get Instance() {
        return Web3._instance;
    }
    private static _instance: Web3;
    private web3: any;
    public SmartRoulettes: Array<any>;
    public SmartRouletteTokens: Array<any>;
    public SmartRouletteDividends: Array<any>;

    public decimals: Array<number>;

    private web3Loaded: Promise<any>;

    public fromWei(value)
    {
        return this.web3.fromWei(value);
    }

    public constructor()
    {
        if (Web3._instance) throw new Error("Web3 already exists");
        Web3._instance = this;

        this.web3Loaded = new Promise((resolve,reject)=>
        {
            let pThis = this;
            let doIt = ()=>
            {
                this.web3 = new (require('web3'))();
                this.web3.setProvider(new this.web3.providers.HttpProvider("https://mainnet.infura.io:8545"));

                // this.web3 = window['web3'];
                console.log('this.web3 ',this.web3);

                this.SmartRoulettes = _.map(Config.roulette_address, (address)=> this.web3.eth.contract(Config.abiRoulette).at(address));

                console.log('this.SmartRoulettes', this.SmartRoulettes);

                this.SmartRouletteTokens = _.map(Config.tokens_address, (address)=> this.web3.eth.contract(Config.abiToken).at(address));

                this.SmartRouletteDividends = _.map(Config.dividend_address, (address)=> this.web3.eth.contract(Config.abiDividend).at(address));

                Promise.all(_.map(this.SmartRouletteTokens, (SmartRouletteToken)=>
                {
                    return new Promise((resolve, reject)=>{
                        SmartRouletteToken.decimals((err, decimals)=>
                        {
                            if (!err)
                            {
                                resolve(decimals);
                            }
                            else
                            {
                                reject(err);
                            }
                        })  ;
                    });
                })).then((decimals: Array<number>)=>{
                    this.decimals = decimals;
                    resolve(); // DONE!
                }).catch(reject);

            };
            doIt();

        });

    }

    public IsWeb3Loaded()
    {
        return this.web3Loaded;
    }

    private getDividendInfo(contractIndex: number, index: number)
    {
        return new Promise((resolve, reject)=>{
            this.SmartRouletteDividends[contractIndex].getDividendInfo(index, (err, data) =>
            {
                if (!err && data)
                {
                    let AmountDividend = data[0] as BigNumber;
                    let BlockDividend = (data[1] as BigNumber).toNumber();
                    let AllPaymentsSent = data[2] as boolean;
                    console.log("AmountDividend", AmountDividend);
                    resolve(new DividendInfo(index, AmountDividend, BlockDividend, AllPaymentsSent, contractIndex));
                }
                else
                {
                    reject(err);
                }
            });
        });
    }

    public getDividendPeriods()
    {
        return new Promise((resolve, reject)=>
        {
            Promise.all(_.map(this.SmartRouletteDividends, (SmartRouletteDividend)=>
            {
                var contractIndex = this.SmartRouletteDividends.indexOf(SmartRouletteDividend);
                return new Promise((resolve, reject)=>
                {
                    SmartRouletteDividend.dividendCount((err, dividendCount:BigNumber)=>
                    {
                        if (!err && dividendCount && dividendCount.toNumber() > 0)
                        {
                            Promise.all(_.times(dividendCount.toNumber(), (n)=>this.getDividendInfo(contractIndex, n)))
                                .then(resolve)
                                .catch(reject);
                        }
                        else
                        {
                            if (err)
                                reject(err);
                            else
                                reject("DividendCount is 0");
                        }
                    });
                });
            })).then((dividendInfos)=>
            {
                console.log(dividendInfos, "FLAT", _.flatten(dividendInfos));
                resolve(_.flatten(dividendInfos));
            }).catch(reject);

        });

    }

    public getFee(hash: string)
    {
        return new Promise((resolve, reject)=>{
            this.web3.eth.getTransaction(hash, (err, txInfo)=>{
                if (!err && txInfo)
                {
                    resolve(txInfo.gasPrice.mul(Config.gasFee));
                }
                else
                {
                    reject(err);
                }
            })
        });
    }


}