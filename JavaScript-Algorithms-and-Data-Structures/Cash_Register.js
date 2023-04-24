function checkCashRegister(price, cash, cid) {
    const currencyUnitAmountDollar = [
        { currencyUnit: 'ONE HUNDRED', amountDollar: 100},
        { currencyUnit: 'TWENTY', amountDollar: 20},
        { currencyUnit: 'TEN', amountDollar: 10},
        { currencyUnit: 'FIVE', amountDollar: 5},
        { currencyUnit: 'ONE', amountDollar: 1},
        { currencyUnit: 'QUARTER', amountDollar: 0.25},
        { currencyUnit: 'DIME', amountDollar: 0.1},
        { currencyUnit: 'NICKEL', amountDollar: 0.05},
        { currencyUnit: 'PENNY', amountDollar: 0.01}
      ];
      
    let result = {status: 'INSUFFICIENT_FUNDS', change: []};
    let change = cash - price;
  
    let register = cid.reduce((prev, curr) => {
            prev.total += curr[1];
            prev[curr[0]] = curr[1];
            return prev;
        }, {total: 0}
    );
  
    if(register.total === change) {
        result.status = 'CLOSED';
        result.change = cid;
        return result;
    }
     
    if(register.total < change) {
        return result;
    }
  
    let changeArr = currencyUnitAmountDollar.reduce((prev, curr) => {
        let value = 0;
        
        while(register[curr.currencyUnit] > 0 && change >= curr.amountDollar) {
          change -= curr.amountDollar;
          register[curr.currencyUnit] -= curr.amountDollar;
          value += curr.amountDollar;
          change = change.toFixed(2);
        }
        
        if(value > 0) {
          prev.push([ curr.currencyUnit, value ]);
        }
        
        return prev;
    }, []);
   
    if(changeArr.length < 1 || change > 0) return result;
    
    result.status = 'OPEN';
    result.change = changeArr;
    return result;
  }