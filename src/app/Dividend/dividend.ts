import {
  Component, Input
} from '@angular/core';
import * as _ from "underscore";
import {BigNumber} from "bignumber.js";
import {Http, Response} from "@angular/http";
import {Web3} from "../services/Web3";
import {DividendInfo} from "../services/DividendInfo";
import {Config} from "../config/config.dividend";
import {HolderInfo} from "./HolderInfo";

@Component({
  selector: 'Dividend',
  styleUrls: [ './dividend.scss'],
  templateUrl: './dividend.html'
})
export class Dividend
{
  @Input()
  public AddressHolder: string;

  public HolderTokens : BigNumber = null;
  public HolderTokensLatest : BigNumber = null;

  public dividendPeriods: Array<DividendInfo> = [];
  public selectedPeriod: DividendInfo = null;

  public holdersInfo: Array<HolderInfo> = [];
  public activeHolderInfo: HolderInfo;
  public fee: BigNumber = null;
  private MinimunTokensToGetPayment:number = 1000;

  public HolderHasNoTokens(): boolean
  {
    if (!this.HolderTokens) return false;
    return this.HolderTokens.isZero();
  }

  public HolderHasNotEnoughTokens(): boolean
  {
    if (!this.HolderTokens) return false;
    return this.HolderTokens.lessThan(this.MinimunTokensToGetPayment) && !this.HolderTokens.isZero();
  }

  public HolderHasEnoughTokens(): boolean
  {
    if (!this.HolderTokens) return false;
    return this.HolderTokens.greaterThanOrEqualTo(this.MinimunTokensToGetPayment) && !this.HolderTokens.isZero();
  }

  constructor(private web3: Web3, private http: Http)
  {
    let pThis = this;

    web3.IsWeb3Loaded().then(()=>
    {
      console.log("Web3Loaded");
      pThis.web3.getDividendPeriods()
          .then((x: Array<DividendInfo>) => {
            console.log("dividendPeriods",x);
            pThis.dividendPeriods = x;

            if (pThis.dividendPeriods.length > 0) {
              pThis.Select(pThis.dividendPeriods[pThis.dividendPeriods.length - 1]);
            }
          })
          .catch((err) => console.log("err", err));
    });
  }

  public dividentsAmountFromBlockcain: BigNumber = null;

  public ToEth(value: BigNumber) : string
  {
    if (value == null) return '';
    return this.web3.fromWei(value).toString(10);
  }

  public Select(dividend: DividendInfo)
  {
    let pThis = this;
    this.selectedPeriod = dividend;
    this.holdersInfo = [];

    this.http.get(`/dividends_${this.selectedPeriod.RouletteAddress}_${this.selectedPeriod.Index}.json`)
        .map((res:Response) => res.json())
        .subscribe(data =>
    {
      // console.log(data);
      if (data)
      {
        pThis.holdersInfo = _.map(data, (x)=>HolderInfo.Build(x));
        pThis.AddressChanged();
      }
    });
    pThis.AddressChanged();
  }

  private AddressTester = /^0x([0-9a-zA-Z]){40}$/;

  public IsAddressHolderValid() : boolean
  {
    return this.AddressTester.test(this.AddressHolder);
  }

  public AddressChanged()
  {
    if (!this.IsAddressHolderValid()) return;

    this.AddressHolder = this.AddressHolder.toLowerCase();

    if (this.holdersInfo.length > 0)
    {
      let pThis = this;
      this.activeHolderInfo = _.find(this.holdersInfo, (x: HolderInfo)=> x.Holder == this.AddressHolder);

      if (this.activeHolderInfo)
        this.web3.getFee(this.activeHolderInfo.TransactionHash).then((fee: BigNumber)=>{
          pThis.fee = fee;
        });
    }
    else
      this.activeHolderInfo = null;

    if (this.selectedPeriod)
    {
      let pThis = this;


      this.selectedPeriod.getHolderTokensCount(this.AddressHolder).then((x:BigNumber)=>{
        pThis.HolderTokens = x;
      }).catch(console.log.bind(null,"getHolderTokensCount at BlockDividend"));

      this.selectedPeriod.getHolderTokensCountNow(this.AddressHolder).then((x:BigNumber)=>{
        pThis.HolderTokensLatest = x;
      }).catch(console.log.bind(null, "getHolderTokensCount at latest"));

      this.GetDividends();
    }

  }

  public GetDividends()
  {
    let pThis = this;

    if (this.selectedPeriod)
    {
      pThis.fee = null;
      pThis.dividentsAmountFromBlockcain = null;

      this.selectedPeriod.getHolderProfit(this.AddressHolder).then((profit: BigNumber)=>
      {
        pThis.dividentsAmountFromBlockcain = profit;
      }).catch((err)=>
      {
        console.log(err);
      });
    }
    else
    {
      alert("There are no payments");
    }

  }
}

