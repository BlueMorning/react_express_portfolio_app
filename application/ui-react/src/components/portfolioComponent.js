import React, {Component}       from 'react';
import FormSearchForCurrencies  from './formSearchForCurrencies';
import CurrenciesListComponent  from './currenciesListComponent'
import WalletComponent          from './walletComponent'
import ClientRequest            from './../requests/clientRequest';


class PortfolioComponent extends Component
{

  constructor(props)
  {
    super(props);
    this.title = "Cryptocurrency portfolio app. with ReactJS, ExpressJS and MongoDB.";
    this.state = {
      currencyFilteredList: [],
      walletEntity: {}
    }

    this.currencyFilteredList   = [];
    this.currencyListLimit      = 50;
    this.clientRequest          = new ClientRequest();
    this.currencyNameForSearch  = null;
    this.setIntervall           = null;
    this.currencyName           = "";
    this.isLockOnPortfolio      = false;
    this.isLiveDataActivated    = false;

    this.handleSearchForCurrencies            = this.handleSearchForCurrencies.bind(this);
    this.handleOnLockPortfolioChanged         = this.handleOnLockPortfolioChanged.bind(this);
    this.handleBuyCurrency                    = this.handleBuyCurrency.bind(this);
    this.handleSellCurrency                   = this.handleSellCurrency.bind(this);
    this.refreshCurrencyRow                   = this.refreshCurrencyRow.bind(this);
    this.handleGetWalletDone                  = this.handleGetWalletDone.bind(this);
    this.handleAddCash                        = this.handleAddCash.bind(this);
    this.handleWithdrawCash                   = this.handleWithdrawCash.bind(this);
    this.handleResetPortfolio                 = this.handleResetPortfolio.bind(this);
    this.handleIsLiveDataActivated            = this.handleIsLiveDataActivated.bind(this);

    this.clientRequest.getWallet(this.handleGetWalletDone);
    this.clientRequest.onSearchForCurrencies  = this.searchForCurrenciesDone.bind(this);
    this.clientRequest.searchForCurrencies("", false);
  }

  render()
  {
    return (
      <div className="mainContainer">
        <h1>{this.title}</h1>
        <div className="containerHeader">
          <FormSearchForCurrencies  onSearchForCurrencies={this.handleSearchForCurrencies}
                                    onLockPortfolioChanged={this.handleOnLockPortfolioChanged}
                                    onClearSearch={this.handleOnClearSearch}
                                    onResetPortfolio={this.handleResetPortfolio}
                                    onLiveDataActivated={this.handleIsLiveDataActivated}/>
          <WalletComponent          walletEntity={this.state.walletEntity}
                                    addCash={this.handleAddCash}
                                    withdrawCash={this.handleWithdrawCash} />
        </div>
        <CurrenciesListComponent  currencies={this.state.currencyFilteredList}
                                  buyCurrency={this.handleBuyCurrency}
                                  sellCurrency={this.handleSellCurrency} />
      </div>
    )
  }

  handleSearchForCurrencies(currencyName, isLockOnPortfolio){
    if(this.setInterval != null){
      clearInterval(this.setInterval);
    }
    this.currencyName           = currencyName;
    this.isLockOnPortfolio      = isLockOnPortfolio;
    this.clientRequest.searchForCurrencies(currencyName, isLockOnPortfolio);
  }

  handleOnLockPortfolioChanged(currencyName, isLockOnPortfolio){
    if(this.setInterval != null){
      clearInterval(this.setInterval);
    }

    this.currencyName           = currencyName;
    this.isLockOnPortfolio      = isLockOnPortfolio;
    this.clientRequest.searchForCurrencies(currencyName, isLockOnPortfolio);
  }

  searchForCurrenciesDone(currencyDataList){
    if(this.setInterval != null){
      clearInterval(this.setInterval);
    }
    this.currencyFilteredList = currencyDataList;
    this.setState({currencyFilteredList: this.currencyFilteredList}, () => {
      if(this.setInterval != null){
        clearInterval(this.setInterval);
      }

      if(this.isLiveDataActivated){
        this.setInterval = setInterval(() => {
          this.clientRequest.getWallet(this.handleGetWalletDone);
          this.clientRequest.searchForCurrencies(this.currencyName, this.isLockOnPortfolio);
        }, 3000);
      }
    });
  }

  handleBuyCurrency(currencyEntity, transactionQuantity){
    this.clientRequest.buyCurrency(currencyEntity.coinSymbol,
                                   transactionQuantity,
                                   this.refreshCurrencyRow);
  }

  handleSellCurrency(currencyEntity, transactionQuantity){
    this.clientRequest.sellCurrency(currencyEntity.coinSymbol,
                                    transactionQuantity,
                                    this.refreshCurrencyRow);
  }

  refreshCurrencyRow(currencyPortfolioEntityJSON){
    let currencyPortfolioEntity = JSON.parse(currencyPortfolioEntityJSON);
    let currencyFilteredList    = this.state.currencyFilteredList;
    let currencyRow             = currencyFilteredList.find((currency) => {
      return currency.coinSymbol == currencyPortfolioEntity.coinSymbol;
    });

    if(currencyRow != null && currencyRow != undefined){
      currencyRow.portfolioQuantity     = currencyPortfolioEntity.quantity;
      currencyRow.portfolioAveragePrice = currencyPortfolioEntity.averagePrice;
    }

    this.setState({currencyFilteredList: currencyFilteredList});
    this.clientRequest.getWallet(this.handleGetWalletDone);
  }

  handleGetWalletDone(walletEntityJSON){
    let walletEntity = JSON.parse(walletEntityJSON);
    this.setState({walletEntity: walletEntity})
  }

  handleAddCash(cashAmount){
    this.clientRequest.addCashToWallet(cashAmount, (walletEntity) => {
      this.handleGetWalletDone(walletEntity);
    })
  }

  handleWithdrawCash(cashAmount){
    this.clientRequest.withdrawCashFromWallet(cashAmount, (walletEntity) => {
      this.handleGetWalletDone(walletEntity);
    })
  }

  handleResetPortfolio(){
    this.clientRequest.resetPortfolio(() => {
      this.clientRequest.searchForCurrencies(this.currencyName, this.isLockOnPortfolio);
    })
  }

  handleIsLiveDataActivated(isLiveDataActivated){
    this.isLiveDataActivated = isLiveDataActivated;
    if(this.isLiveDataActivated){
      this.setInterval = setInterval(() => {
        this.clientRequest.getWallet(this.handleGetWalletDone);
        this.clientRequest.searchForCurrencies(this.currencyName, this.isLockOnPortfolio);
      }, 3000);
    }
  }
}

export default PortfolioComponent;
