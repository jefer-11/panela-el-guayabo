document.addEventListener('DOMContentLoaded', () => {
    // ==================== MENÚ HAMBURGUESA ====================
    const initHamburgerMenu = () => {
        const hamburgerBtn = document.querySelector('.hamburger-menu');
        const navContainer = document.querySelector('.nav-links-container');
        const mainNavLinks = document.querySelectorAll('.main-nav a');

        if (!hamburgerBtn || !navContainer) return;

        const toggleMenu = () => {
            navContainer.classList.toggle('active');
            hamburgerBtn.querySelector('i').classList.toggle('fa-times');
            document.body.classList.toggle('no-scroll');
        };

        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        mainNavLinks.forEach(link => {
            link.addEventListener('click', () => navContainer.classList.contains('active') && toggleMenu());
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-links-container') && !e.target.closest('.hamburger-menu')) {
                navContainer.classList.remove('active');
                hamburgerBtn.querySelector('i').classList.remove('fa-times');
                document.body.classList.remove('no-scroll');
            }
        });

        // ✅ CORRECCIÓN: cerrar el menú si el usuario redimensiona a escritorio (>992px)
        window.addEventListener('resize', () => {
            if (window.innerWidth > 992) {
                navContainer.classList.remove('active');
                hamburgerBtn.querySelector('i').classList.remove('fa-times');
                document.body.classList.remove('no-scroll');
            }
        });
    };
    initHamburgerMenu();

    // ==================== SISTEMA DE CARRITO ====================
    const cartSystem = () => {
        const products = {
            'panela-redonda-500g': { name: 'Panela Redonda de 500g', price: 8500, image: 'images/panela-redonda-500g.png' },
            'panela-pulverizada-500g': { name: 'Panela Pulverizada de 500g', price: 9000, image: 'images/panela-pulverizada-500g.png' },
            'panela-pulverizada-1kg': { name: 'Panela Pulverizada de 1kg', price: 16000, image: 'images/panela-pulverizada-1kg.png' }
        };

        // Funciones base
        const getCart = () => JSON.parse(localStorage.getItem('panelaCart')) || [];
        const saveCart = cart => localStorage.setItem('panelaCart', JSON.stringify(cart));

        // Actualización de UI
        const updateCartUI = () => {
            const cart = getCart();
            const container = document.getElementById('cartItemsContainer');
            const cartTotalElement = document.getElementById('cartTotal');
            
            if (container) {
                container.innerHTML = cart.length ? cart.map(item => `
                    <div class="cart-item" data-product-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <p class="price">${formatPrice(item.price)} c/u</p>
                            <div class="quantity-controls">
                                <button class="quantity-btn decrease">-</button>
                                <input type="number" value="${item.quantity}" min="1">
                                <button class="quantity-btn increase">+</button>
                            </div>
                        </div>
                        <button class="remove-item"><i class="fas fa-trash"></i></button>
                    </div>
                `).join('') : '<p class="empty-cart">Tu carrito está vacío</p>';

                container.querySelectorAll('.remove-item').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const productId = btn.closest('.cart-item').dataset.productId;
                        saveCart(cart.filter(item => item.id !== productId));
                        updateCartUI();
                        showToast('Producto eliminado');
                    });
                });

                container.querySelectorAll('.quantity-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const input = e.target.parentElement.querySelector('input');
                        const productId = e.target.closest('.cart-item').dataset.productId;
                        const currentValue = parseInt(input.value);

                        if (btn.classList.contains('increase')) {
                            input.value = currentValue + 1;
                        } else {
                            input.value = Math.max(1, currentValue - 1);
                        }

                        updateCartQuantity(productId, parseInt(input.value));
                    });
                });

                container.querySelectorAll('input[type="number"]').forEach(input => {
                    input.addEventListener('change', (e) => {
                        const productId = e.target.closest('.cart-item').dataset.productId;
                        updateCartQuantity(productId, parseInt(e.target.value));
                    });
                });
            }

            if (cartTotalElement) {
                const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                cartTotalElement.textContent = formatPrice(total);
            }

            const cartCounter = document.querySelector('.cart-counter');
            const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
            
            if (cartCounter) {
                cartCounter.textContent = totalItems;
                if (totalItems === 0) cartCounter.remove();
            } else if (totalItems > 0) {
                const counter = document.createElement('div');
                counter.className = 'cart-counter';
                counter.textContent = totalItems;
                document.querySelector('.cart-icon').appendChild(counter);
            }
        };

        const updateCartQuantity = (productId, newQuantity) => {
            const cart = getCart();
            const itemIndex = cart.findIndex(item => item.id === productId);
            
            if (itemIndex > -1) {
                if (newQuantity > 0) {
                    cart[itemIndex].quantity = newQuantity;
                } else {
                    cart.splice(itemIndex, 1);
                }
                saveCart(cart);
                updateCartUI();
            }
        };

        const handleClearCart = () => {
            if (confirm('¿Estás seguro de querer vaciar todo el carrito?')) {
                localStorage.removeItem('panelaCart');
                updateCartUI();
                showToast('Carrito vaciado correctamente');
            }
        };

        const createFlyAnimation = (element) => {
            const clone = element.cloneNode(true);
            const cartIcon = document.querySelector('.cart-icon');
            if (!cartIcon) return;

            clone.style.cssText = `
                position: fixed;
                width: 80px;
                height: 80px;
                border-radius: 15px;
                opacity: 0.9;
                z-index: 9999;
                pointer-events: none;
                box-shadow: 0 8px 20px rgba(0,0,0,0.2);
                transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
            `;

            const startRect = element.getBoundingClientRect();
            clone.style.left = `${startRect.left}px`;
            clone.style.top = `${startRect.top}px`;
            document.body.appendChild(clone);
            void clone.offsetWidth;

            const endRect = cartIcon.getBoundingClientRect();
            const finalX = endRect.left + endRect.width/2 - 40;
            const finalY = endRect.top + endRect.height/2 - 40;

            clone.style.left = `${finalX}px`;
            clone.style.top = `${finalY}px`;
            clone.style.transform = 'scale(0.3) rotate(360deg)';
            clone.style.opacity = '0';

            setTimeout(() => clone.remove(), 1200);
        };

        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                const addButton = e.target.closest('.add-to-cart-btn');
                const productId = addButton.closest('[data-product-id]')?.dataset.productId || document.body.dataset.productId;
                
                if (products[productId]) {
                    addButton.classList.add('adding-to-cart');
                    setTimeout(() => addButton.classList.remove('adding-to-cart'), 600);
                    
                    const productImage = addButton.closest('.product-item')?.querySelector('img');
                    if (productImage) createFlyAnimation(productImage);

                    const cart = getCart();
                    const existingItem = cart.find(item => item.id === productId);
                    
                    if (existingItem) {
                        existingItem.quantity++;
                    } else {
                        cart.push({ ...products[productId], id: productId, quantity: 1 });
                    }
                    
                    saveCart(cart);
                    updateCartUI();
                    showToast(`${products[productId].name} añadido al carrito`);
                }
            }

            if (e.target.closest('#clearCartBtn')) {
                handleClearCart();
            }
        });

        const formatPrice = (price) => price.toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        });

        const showToast = (message) => {
            const toast = document.createElement('div');
            toast.className = 'toast-notification';
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        };

        updateCartUI();
    };
    cartSystem();

    // ==================== SLIDER HERO ====================
    const initHeroSlider = () => {
        const slider = document.querySelector('.hero-slider');
        if (!slider) return;

        const slides = slider.querySelectorAll('.slider-images img');
        const dotsContainer = slider.querySelector('.slider-dots');
        let currentSlide = 0;
        let autoSlideInterval;

        const createDots = () => {
            slides.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.className = 'slider-dot';
                dot.addEventListener('click', () => goToSlide(index));
                dotsContainer.appendChild(dot);
            });
        };

        const updateDots = () => {
            dotsContainer.querySelectorAll('.slider-dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        };

        const goToSlide = (index) => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (index + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
            updateDots();
            resetAutoSlide();
        };

        const resetAutoSlide = () => {
            clearInterval(autoSlideInterval);
            autoSlideInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
        };

        if (slides.length > 1) {
            createDots();
            resetAutoSlide();
            updateDots();
        }
    };
    initHeroSlider();
});
