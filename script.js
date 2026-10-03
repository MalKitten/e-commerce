function addEvent(ele, events, active, e) {
    return {
        activate: (extraFunc) => {
            for (let event of events) {
                ele.addEventListener(event, () => {
                    if (active) {
                        e ? e.classList.toggle("active") : ele.classList.toggle("active");
                        if (extraFunc) extraFunc();
                    }
                    else  e.classList.remove("active");
                });
            }
        },

        megnify: () => {
            ele.addEventListener('click', event => {
                if (window.innerWidth >= 800 && event.target == document.querySelector('.product-image')) {
                    pageBlocker.inable();
                    let clone = imgBoxEle.parentNode.cloneNode(true);
                    let blockExit = createEle('button', clone, [['aria-label', 'close the large image display']], ['exit-btn'], []);
                    createEle('img', blockExit, [['src', "images/icon-close.svg"], ['alt', "close the page blocker"]], [], []);
                    blockExit.addEventListener('click', () => {pageBlocker.disable(); clone.remove()});
                    document.querySelector('.wrapper').append(clone);
                    clone.append(blockExit);
                    clone.classList.add('img-box-clone');
                    let prev = document.querySelector('.img-box-clone .prev-image');
                    let next = document.querySelector('.img-box-clone .next-image');
                    addEvent(prev).changeImg('prev');
                    addEvent(next).changeImg('next');
                                        
                    let CloneThumbnails = document.querySelector('.img-box-clone .product-thumbnails').children;
                    
                    for (let i = 0; i < CloneThumbnails.length; i++) {
                        let img = CloneThumbnails[i];
                        addEvent(img).changeImg(i, CloneThumbnails);
                    }
                }
            }) 
        },

        changeImg: (val, cTN) => {
            ele.addEventListener('click', () => {
                let currentIndex = productImgs.indexOf(currentImg);
                if (Number.isInteger(val)) {
                    currentIndex = val;
                    
                }
                else {
                    let prev = document.querySelector('.img-box-clone .prev-image') || prevImgBtn;
                    let next = document.querySelector('.img-box-clone .next-image') || nextImgBtn;
                    if (val == 'prev') {
                        if (currentIndex > 0) {
                            currentIndex -= 1;
                        } else {
                            prev.disabled = true;
                        }
                        next.disabled = false;
    
                    } else if (val == 'next') {
                        currentIndex += 1;
                        if (currentIndex < productImgs.length -1) {
                            prev.disabled = false;
                        } else {
                            next.disabled = true;
                        }
                        prev.disabled = false;
                    }
                }
                
                let thumbnails = document.querySelector('.img-box-clone .product-thumbnails')?.children;
                if (!thumbnails) {
                    thumbnails = productThumbnails;
                }
                for (let i = 0; i < productImgs.length; i++) {
                        let img = cTN ? cTN[i] : thumbnails[i];
                        img.setAttribute('aria-selected', false);
                }
                thumbnails[currentIndex].setAttribute('aria-selected', true)

                currentImg = productImgs[currentIndex];
                let imgBox = document.querySelector('.img-box-clone .product-image');
                if (imgBox) imgBox.setAttribute('src', currentImg);
                else document.querySelector('.product-image').setAttribute('src', currentImg);
            })
        },

        changeQuantity: (btn) => {
            ele.addEventListener('click', () => {
                let quantity = Number(quantityVal.innerText);
                if (btn == '-' && quantity > 0) {
                    quantityVal.innerText = quantity - 1;
                } else if (btn == '+') {
                    quantityVal.innerText = quantity + 1;
                }
            })
        },

        add2Cart: () => ele.addEventListener('click', () => {if(quantityVal.innerText > 0) cartVal.update()}),

        removeFromCart: () => ele.addEventListener('click', () => cartVal.clear())
    }
}


function createEle(element, parent, attributes, classes, other) {
    let ele = document.createElement(element);

    for (let [name, value] of attributes) {
        ele.setAttribute(name, value);
    }

    for (let c of classes) {
        ele.classList.add(c);
    }

    for (let [name, value] of other) {
        ele[name] = value;
    }

    parent.append(ele);
    return ele;
}

// the page blocker

window.addEventListener('resize', () => {
    pageBlocker.disable();
    let navMenu = document.querySelector('.nav-menu.active')
    if (navMenu) navMenu.classList.remove('active');

    let clone = document.querySelector('.img-box-clone');
    if (clone) clone.remove();
})


const pageBlock = document.createElement('div');
const pageBlocker = {
    inable: () => {
        document.body.append(pageBlock);
        pageBlock.classList.add('pg-block');
        pageBlock.classList.add('active');
    } ,
    disable: () => {
        pageBlock.remove();
    }
}


// The nav menu
const navMenu = document.querySelector(".nav-menu");

addEvent(document.querySelector(".nav-menu-btn"), ["click"], true, navMenu).activate(pageBlocker.inable)
addEvent(document.querySelector(".close-menu-btn"), ["click"], true, navMenu).activate(pageBlocker.disable)

// the cart

const productName = document.querySelector('h1').innerText;

const cartPanel = document.querySelector(".cart-panel");
const cartItems = document.querySelector(".cart-items");


addEvent(document.querySelector(".cart"), ["click"], true, cartPanel).activate(() => window.localStorage.getItem('itemQuantity') ? manageCart.fill : manageCart.empty);



const manageCart = {
    fill: () => {
        cartItems.innerHTML = "";
        cartItems.classList.remove('empty');
        let quantity = window.localStorage.getItem("itemQuantity");
        document.documentElement.style.setProperty('--cart-val', `"${quantity}"`);
        cartPanel.setAttribute('aria-label', quantity + ' items');
        document.documentElement.style.setProperty('--display', 'block');
        let cartItemsWapper = createEle('div', cartItems, [], ['cart-items-wrapper'], []);
        let name = window.localStorage.getItem('itemName');
        createEle('img', cartItemsWapper, [['alt', name], ['src', 'images/image-product-1-thumbnail.jpg']], ['incart-img'], []);
        createEle('p', cartItemsWapper, [], ['incart-product-name'], [['innerText', name]]);
        let price = document.querySelector('.current-price').innerText;
        let priceVal = price.slice(1);
        let total = createEle('p', cartItemsWapper, [], ['incart-total'], [['textContent', `${price} × ${quantity} `]]);
        createEle('span', total, [], ['bold'], [['innerText', `$${(priceVal * quantity).toFixed(2)}`]]);
        let removeBtn = createEle('button', cartItemsWapper, [], ['incart-remove-btn'], []);
        createEle('img', removeBtn, [['src', 'images/icon-delete.svg'], ['width', '20'], ['alt', 'remove item']], [], []);
        addEvent(removeBtn).removeFromCart();
        createEle('button', cartItems, [], ['checkoutBtn'], [['innerText', 'Checkout']]);
    },
    empty: () => {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
        cartItems.classList.add('empty');
        document.documentElement.style.setProperty('--display', 'none');
        cartPanel.setAttribute('aria-label', 0 + ' items');
    }
}

function restoreCartItems() {
    let items = window.localStorage.getItem('itemQuantity');
    if (items == undefined) {
        window.localStorage.setItem("itemName", productName);
        window.localStorage.setItem('itemQuantity', 0);
        cartVal.update();
    } else if (items > 0) {
        manageCart.fill();
    }
}

restoreCartItems();

// the display img
const imgBoxEle = document.querySelector('.current-product-display');
addEvent(imgBoxEle).megnify();


// the imgs arrows 
const currentImgEle = document.querySelector('.product-image');
let currentImg = 'images/image-product-1.jpg';
const prevImgBtn = document.querySelector('.prev-image');
const nextImgBtn = document.querySelector('.next-image');

const productImgs = [
    'images/image-product-1.jpg',
    'images/image-product-2.jpg',
    'images/image-product-3.jpg',
    'images/image-product-4.jpg',
];
addEvent(prevImgBtn).changeImg('prev');
addEvent(nextImgBtn).changeImg('next');

// the product quantity

const decreaseBtn = document.querySelector('.decrease');
const quantityVal = document.querySelector('.quantity-value');
const increaseBtn = document.querySelector('.increase');

const cartVal = {
    update: () => {
        window.localStorage.setItem("itemQuantity", quantityVal.innerText);
        manageCart.fill();
    },
    clear: () => {
        window.localStorage.setItem('itemQuantity', 0);
        manageCart.empty();
    }        
};

addEvent(decreaseBtn).changeQuantity('-');
addEvent(increaseBtn).changeQuantity('+');

// numbnail imgs

const productThumbnails = document.querySelector('.product-thumbnails').children;

for (let i = 0; i < productThumbnails.length; i++) {
    let img = productThumbnails[i];
    addEvent(img).changeImg(i);
}

// add to the cart btn

const add2CartBtn = document.querySelector('.add-to-cart-btn');

addEvent(add2CartBtn).add2Cart();
