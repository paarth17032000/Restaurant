"use strict"
// preloader
const emoji = ['&#127815;','&#127853;','&#127818;','&#127863;','&#127823;','&#127825;'];
const color = ['#686de0','#ED4C67','#F79F1F','#6F1E51','#A3CB38','#FDA7DF'];
const preloader = document.querySelector('.preloader');
const section = document.querySelector('section');
var counter = 0;

function change(){
    
    if( counter >= color.length){ counter = 0 }
    preloader.style.backgroundColor = `${color[counter]}`;
    document.querySelector('.preloader').innerHTML = `<span class="food">${emoji[counter]}</span>
                                                        <h3>Thanks For Waiting</h3>`;
    counter++;
}
setInterval( change , 600);

window.addEventListener('load', () => {
    preloader.classList.add('preloader-stop');
    section.classList.add('section-appear');
});

//text-effects
function appearText() {
    var element = document.querySelector('.original'); 
    var elementPosition = element.getBoundingClientRect().top;
    var windowPosition = window.innerHeight/1.4;
    
    if( elementPosition < windowPosition ){
        element.classList.add('manipulated');
    }
}

window.addEventListener('scroll', appearText);

// site functioning
// assigning DOM
const foodSection = document.querySelector('.food-section');
const cartSection = document.querySelector('.cart-section');
const cartContent = document.querySelector('.cart-content');
const cartOverlay = document.querySelector('.cart-overlay');
const totalCost = document.querySelector('.total-cost');
const itemsCount = document.querySelector('.item-count');
const closeBtn = document.querySelector('.fa-times-circle');
const cartBtn = document.querySelector('.fa-shopping-cart');
const clearCart = document.querySelector('.clear-cart');

// cart
var cart = [];

// buttons 
var buttonCollection = [];

//fetch products from json
class Products{
    async getProducts(){
        try{
            let products = await fetch('products.json');
            let jsonData = await products.json();
            let data = jsonData.products;
            return data;
        } catch (error) {
            console.log(error);
        }
    }
}
// display 
class UI{
    // display food item
    display(products){
        let result = ``;
        products.forEach( item => {
         result += `<div class="item-container">
            <img src=${item.image} alt="product">
            <h3>${item.name}</h3>
            <h4>${item.cost} &#8377;</h4>
            <button data-id="${item.id}">+</button>
        </div>`
        });
        foodSection.innerHTML = result;
    }
    // stting methods on every + button in food item section
    buttonsAction(){
        const btns = [...document.querySelectorAll('.item-container > button')];
        buttonCollection = btns;
        
        btns.forEach( button => {
            let id = button.dataset.id;
            let inCart = cart.find( item => item.id === id );
            if(inCart){
                button.disabled = true;
            }

            button.addEventListener('click', () => {
                button.disabled = true;
                // get product from storage
                let cartItem = {...Storage.getItems(id),amount:1};
                // add to cart
                cart = [...cart,cartItem];
                // add cart to storage
                Storage.saveCart(cart);
                // cart total
                this.total(cart);
                // display product in cart
                this.addProduct(cartItem);
                // display cart
                this.showCart();
            })
        });
    }
    // setting cart total
    total(cart){
        let total = 0;
        let countItems = 0;
        cart.map( item => {
            total += item.cost * item.amount;
            countItems += item.amount;
        } );
        totalCost.innerHTML = `<span>Total : ${total} &#8377;</span>`
        itemsCount.textContent = countItems;
    }
    // adding product ui in cart method
    addProduct(item){
        let div = document.createElement('div');
        div.classList.add('cart-items');
        div.classList.add('clearfix');
        div.innerHTML = `
            <img src=${item.image} alt="product">
                <div class="details">
                <h3>${item.name}</h3>
                <h4>${item.cost} &#8377;</h4>
                <span class="remove" data-id="${item.id}">remove</span>
            </div>
            <div class="count">
                <i class="fas fa-chevron-up" data-id="${item.id}"></i>
                <span class="item-num">${item.amount}</span>
                <i class="fas fa-chevron-down" data-id="${item.id}"></i>
            </div>`;
        cartSection.appendChild(div);  
    }
    // showing cart as user adds the product 
    showCart(){
        cartContent.classList.add('content-slide-in');
        cartOverlay.classList.add('cart-visible');
    }
    // closing cart
    hideCart(){
        cartContent.classList.remove('content-slide-in');
        cartOverlay.classList.remove('cart-visible');
    }
    // clear cart using clear-cart button
    clear(){
        let cartIds = cart.map(item => item.id);
        cartIds.forEach(id => this.removeItem(id));
        // here clearing cart
        while( cartSection.children.length > 0){
            cartSection.removeChild(cartSection.children[0]);
        }       
    }
    // removing item method used with clear() as well as in otherFunction() too
    removeItem(id){
        cart = cart.filter(item => item.id !== id);
        this.total(cart);
        Storage.saveCart(cart);
        let button = this.getBtn(id);
        button.disabled = false;  
    }
    // gettin button by passing it's id
    getBtn(id){
        return buttonCollection.find(button => button.dataset.id == id ); 
    }
    // clearing cart, removing item, adding and subtracting item number
    otherFunction(){
        clearCart.addEventListener('click', () => {
           this.clear();
        });
        cartSection.addEventListener('click', (e) => {
            // remove using remove in cart
            if(e.target.classList.contains('remove')){
                let element = e.target;
                let id = +element.dataset.id;
                cartSection.removeChild(element.parentElement.parentElement);
                this.removeItem(id);
            } 
            // adding product number
            else if(e.target.classList.contains('fa-chevron-up')){
                let element = e.target;
                let id = +element.dataset.id;
                let item = cart.find(item => item.id === id);
                item.amount = item.amount + 1;
                Storage.saveCart(cart);
                this.total(cart);
                e.target.nextElementSibling.textContent = item.amount;
            } 
            // lowering product number
            else if(e.target.classList.contains('fa-chevron-down')){
                let element = e.target;
                let id = +element.dataset.id;
                let item = cart.find(item => item.id === id);
                item.amount = item.amount - 1;
                if( item.amount < 1){
                    cartSection.removeChild(element.parentElement.parentElement);
                    this.removeItem(id);
                }
                Storage.saveCart(cart);
                this.total(cart);
                e.target.previousElementSibling.textContent = item.amount;
            }
        });
        // making item add button disabled for items already in cart after refreshing
        cart.forEach(item => {
            let id = item.id;
            let button = this.getBtn(id);
            console.log(button);
            button.disabled = true; 
        });
    }   
    // updating cart from storage after refresh
    application(){
        cart = Storage.getCartItems();
        cart.forEach(item => this.addProduct(item));
        this.total(cart);
        closeBtn.addEventListener('click', () => this.hideCart());
        cartBtn.addEventListener('click', () => this.showCart());
    }
}

// local storage 
class Storage{
    // saving products to cart
    static storage(products){
        localStorage.setItem("food-products",JSON.stringify(products));
    }
    // getting products from storage
    static getItems(id){
        let products = JSON.parse(localStorage.getItem('food-products'));   
        return products.find( product => product.id == id );
    }
    // saving cart to storage
    static saveCart(cart){
        localStorage.setItem('cart',JSON.stringify(cart));
    }
    //getting cart from storage
    static getCartItems(){
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')) : [];
    }
}

// promises
document.addEventListener('DOMContentLoaded', () => { 
    // maing instances of classes
    var products = new Products;
    var ui = new UI;
    // loading cart
    ui.application();
    // using products class
    products.getProducts()
        .then( products => {
            // loading ui
            ui.display(products);
            // saving products
            Storage.storage(products);
        })
        .then( () =>{
            // using button actions to perform methods
            ui.buttonsAction(); 
            ui.otherFunction();
        })
});