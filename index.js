// Jerry's Quick Mart
sign = (    
'       _                      _        ____        _      _      __  __            _   \n'+
'      | |                    ( )      / __ \\      (_)    | |    |  \\/  |          | |  \n'+
'      | | ___ _ __ _ __ _   _|/ ___  | |  | |_   _ _  ___| | __ | \\  / | __ _ _ __| |_ \n'+
'  _   | |/ _ \\  __|  __| | | | / __| | |  | | | | | |/ __| |/ / | |\\/| |/ _` |  __| __|\n'+
' | |__| |  __/ |  | |  | |_| | \\__ \\ | |__| | |_| | | (__|   <  | |  | | (_| | |  | |_ \n'+
'  \\____/ \\___|_|  |_|   \\__, | |___/  \\___\\_\\___,_|_|\\___|_|\\_\\ |_|  |_|\\__,_|_|   \\__|\n'+
'                         __/ |                                                         \n'+
'                        |___/                                                          \n')

console.log("Welcome to:\n" + sign);

class Item {
    constructor(name, regular_price, member_price, taxable) {
        this.name = name;
        this.regular_price = regular_price;
        this.member_price = member_price;
        this.taxable = taxable;
    }
    getName() {
        return this.name;
    }
    getPrice(isMember) {
        if(isMember) return this.member_price
        else return this.regular_price;
    }
    isTaxable() {
        return this.taxable;
    }
}

class Stock {
    constructor(item, quantity) {
        this.item = item;
        this.quantity = quantity;
    }
}

class Inventory {
    constructor() {
        this.stock = [];
    }
    addItem(item) {
        const existingStock = this.stock.find(s => s.item === item);
        if (existingStock) {
            existingStock.quantity++;
        } else {
            this.stock.push(new Stock(item, 1));
        }
    }
    removeItem(item) {
        const existingStock = this.stock.find(s => s.item === item);
        if (existingStock) {
            existingStock.quantity--;
            if (existingStock.quantity === 0) {
                this.stock = this.stock.filter(s => s !== existingStock);
            }
        }
    }
}

class ShoppingCart {
    constructor() {
        this.items = [];
    }
    addItem(item) {
        if (!this.items.includes(item)) {
            this.items.push(item);
        }
        else {
            item.quantity++;
        }
    }
    removeItem(itemName) {
        if (this.items.length === 0) {
            console.log("Your cart is empty.");
            return;
        }

        availableItems = this.items.filter(item => item.name === itemName);
        if (available.length === 0) {
            console.log(`Item ${itemName} not found in cart.`);
            return;
        }

    }
}

class Customer {
    constructor(name, isMember) {
        this.name = name;
        this.isMember = isMember;
        this.cart = new ShoppingCart();
    }
}
