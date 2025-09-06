class Item {
    constructor(name, quantity, regularPrice, memberPrice, taxStatus) {
        this.name = name;
        this.quantity = quantity;
        this.regularPrice = regularPrice;
        this.memberPrice = memberPrice;
        this.taxStatus = taxStatus;
    }
    getPrice(isMember) {
        return isMember ? this.memberPrice : this.regularPrice;
    }
    isTaxable() {
        return this.taxStatus.toLowerCase() === 'taxable';
    }
}

class Inventory {
    constructor() {
        this.items = [];
    }
    
    getAvailableItems() {
        return this.items.filter(item => item.quantity > 0);
    }
    getItemByName(name) {
        return this.items.find(item => item.name === name);
    }
    updateStock(name, quantity) {
        const item = this.getItemByName(name);
        if (item) item.quantity -= quantity;
    }
    // To string allows to consolidate into a single line of text
    toString() {
        return this.items.map(item => `${item.name}: ${item.quantity}, $${item.regularPrice.toFixed(2)}, $${item.memberPrice.toFixed(2)}, ${item.taxStatus}` ).join('\n');
    }
    loadFromText(text) {
        this.items = text.trim().split('\n').map(line => {
            const [name, details] = line.split(':');
            const [quantity, regularPrice, memberPrice, tax] = details.split(',').map(s => s.trim());
            return new Item(
                name,
                parseInt(quantity),
                parseFloat(regularPrice.replace(/[^\d.]/g, '')), // Remove all that is not a digit (\d) or dot (.)
                parseFloat(memberPrice.replace(/[^\d.]/g, '')),
                tax.replace(/\s/g, '') // Remove all whitespace
            );
        });
    }
}

class CartItem {
    constructor(item, quantity, unitPrice) {
        this.name = item.name;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.taxable = item.isTaxable();
    }
    getTotal() {
        return this.unitPrice * this.quantity;
    }
}

class Cart {
    constructor() {
        this.items = [];
    }
    addItem(item, quantity, unitPrice) {
        const existing = this.items.find(ci => ci.name === item.name);
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.items.push(new CartItem(item, quantity, unitPrice));
        }
    }
    removeItem(name) {
        this.items = this.items.filter(ci => ci.name !== name);
    }
    empty() {
        this.items = [];
    }
    getTotalItems() {
        return this.items.reduce((sum, ci) => sum + ci.quantity, 0);
    }
    getSubTotal() {
        return this.items.reduce((sum, ci) => sum + ci.getTotal(), 0);
    }
    getTax(taxRate) {
        return this.items.filter(ci => ci.taxable).reduce((sum, ci) => sum + ci.getTotal() * taxRate, 0);
    }
    isEmpty() {
        return this.items.length === 0;
    }
}

class Transaction {
    constructor(number, date, cart, isMember, cash, taxRate) {
        this.number = number;
        this.date = date;
        this.cart = cart;
        this.isMember = isMember;
        this.cash = cash;
        this.taxRate = taxRate;
    }
    getReceipt() {
        const lines = [];
        lines.push(`${this.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`);
        lines.push(`TRANSACTION: ${this.number.toString().padStart(6, '0')}`);
        lines.push(`CUSTOMER TYPE: ${this.isMember ? 'MEMBER' : 'NON-MEMBER'}`);
        lines.push('___________________________________________');
        lines.push('ITEM            QTY  UNIT PRICE TOTAL');
        lines.push('___________________________________________');
        this.cart.items.forEach(ci => {
            lines.push(`${ci.name.padEnd(15)} ${ci.quantity.toString().padEnd(4)} $${ci.unitPrice.toFixed(2).padEnd(9)} $${ci.getTotal().toFixed(2)}`);
        });
        lines.push('___________________________________________');
        lines.push(`TOTAL NUMBER OF ITEMS SOLD: ${this.cart.getTotalItems()}`);
        const sub = this.cart.getSubTotal();
        const tax = this.cart.getTax(this.taxRate);
        const total = sub + tax;
        lines.push(`SUB-TOTAL: $${sub.toFixed(2)}`);
        lines.push(`TAX (${(this.taxRate*100).toFixed(1)}%): $${tax.toFixed(2)}`);
        lines.push(`TOTAL: $${total.toFixed(2)}`);
        lines.push(`CASH: $${this.cash.toFixed(2)}`);
        lines.push(`CHANGE: $${(this.cash-total).toFixed(2)}`);
        let saved = 0; // Savings calculation
        if (this.isMember) {
            this.cart.items.forEach(ci => {
                const invItem = inventory.getItemByName(ci.name);
                if (invItem) {
                    const diff = invItem.regularPrice - invItem.memberPrice;
                    if (diff > 0) {
                        saved += diff * ci.quantity;
                    }
                }
            });
        }
        lines.push('********************************');
        if (saved > 0) lines.push(`YOU SAVED: $${saved.toFixed(2)}!`);
        return lines.join('\n');
    }
}

const TAX_RATE = 0.065;
let inventory = new Inventory();
let cart = new Cart();
let transactionCount = 1;
let isMember = false;

function loadInventory() {
    fetch('assets/inventory.txt')
        .then(res => res.text())
        .then(text => {
            inventory.loadFromText(text);
            renderInventory();
        });
}

function renderInventory() {
    const list = document.getElementById('inventoryList');
    if (!list) return;
    list.innerHTML = '';
    inventory.getAvailableItems().forEach(item => {
        const li = document.createElement('li');
        li.className = '';
        li.innerHTML =
        `<span>
            <b>${item.name}</b><br>
            ${item.quantity} units. <span style='color:#888;'>
        $${item.regularPrice.toFixed(2)}${item.memberPrice !== item.regularPrice ? '/$'+item.memberPrice.toFixed(2) : ''}
        </span>
        </span>`; // if there's no difference, it only shows one price
        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.min = 1;
        qtyInput.max = item.quantity;
        qtyInput.value = 1;
        const addBtn = document.createElement('button');
        addBtn.textContent = '+ Add to Cart';
        addBtn.onclick = () => {
            const qty = parseInt(qtyInput.value);
            if (isNaN(qty) || qty < 1 || qty > item.quantity) {
                alert('Invalid quantity or item out of stock.');
                return;
            }
            cart.addItem(item, qty, item.getPrice(isMember));
            renderCart();
        };
        li.appendChild(qtyInput);
        li.appendChild(addBtn);
        list.appendChild(li);
    });
}

function renderCart() {
    const list = document.getElementById('cartList');
    list.innerHTML = '';
    cart.items.forEach(ci => {
        const li = document.createElement('li');
        li.textContent = `${ci.name} x${ci.quantity} ($${ci.unitPrice.toFixed(2)}) = $${ci.getTotal().toFixed(2)}`;
        const btn = document.createElement('button');
        btn.textContent = 'Remove';
        btn.onclick = () => { cart.removeItem(ci.name); renderCart(); };
        li.appendChild(btn);
        list.appendChild(li);
    });
    document.getElementById('cartTotals').textContent = cart.isEmpty() ? '' : `Subtotal: $${cart.getSubTotal().toFixed(2)} | Tax: $${cart.getTax(TAX_RATE).toFixed(2)} | Total: $${(cart.getSubTotal()+cart.getTax(TAX_RATE)).toFixed(2)}`;
    const itemCountDiv = document.getElementById('cartItemCount');
    if (itemCountDiv) {
        itemCountDiv.textContent = cart.isEmpty() ? '' : `Total items in cart: ${cart.getTotalItems()}`;
    }
}

document.getElementById('emptyCartBtn').onclick = () => {
    cart.empty();
    renderCart();
};

document.getElementsByName('customerType').forEach(radio => {
    radio.onchange = e => {
        isMember = e.target.value === 'member';
        cart.empty();
        renderCart();
    };
});

document.getElementById('checkoutBtn').onclick = () => {
    if (cart.isEmpty()) {
        alert('Cart is empty!');
        return;
    }
    const total = cart.getSubTotal() + cart.getTax(TAX_RATE);
    function askCash() {
        setTimeout(() => {
            const input = prompt(`Total: $${total.toFixed(2)}\nEnter cash amount:`);
            if (input === null) return; 
            const cash = parseFloat(input);
            if (!isNaN(cash) && cash >= total) {
                cart.items.forEach(ci => inventory.updateStock(ci.name, ci.quantity));
                const transaction = new Transaction(transactionCount++, new Date(), cart, isMember, cash, TAX_RATE);
                const receipt = transaction.getReceipt();
                showReceipt(receipt);
                saveReceiptFile(receipt, transaction.number, transaction.date);
                saveInventoryFile();
                cart = new Cart();
                renderCart();
                renderInventory();
            } else {
                alert('Insufficient cash.');
                askCash();
            }
        }, 0);
    }
    askCash();
};

document.getElementById('cancelBtn').onclick = () => {
    cart.empty();
    renderCart();
    document.getElementById('receiptSection').textContent = '';
};

function showReceipt(text) {
    document.getElementById('receiptSection').textContent = text;
}

function saveReceiptFile(text, number, date) {
    const d = date;
    const fname = `transaction_${number.toString().padStart(6,'0')}_${d.getMonth()+1}${d.getDate()}${d.getFullYear()}.txt`;
    const blob = new Blob([text], {type: 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fname;
    a.click();
}

function saveInventoryFile() {
    const blob = new Blob([inventory.toString()], {type: 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'inventory.txt';
    a.click();
}

document.addEventListener('DOMContentLoaded', () => {
    loadInventory();
    renderCart();
    const uploadInput = document.getElementById('uploadInventory');
    if (uploadInput) {
        uploadInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                inventory.loadFromText(evt.target.result);
                renderInventory();
                cart.empty();
                renderCart();
                document.getElementById('receiptSection').textContent = '';
            };
            reader.readAsText(file);
        });
    }
});
