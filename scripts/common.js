/*=========================================
    GAMEVERSE ADMIN COMMON JS
=========================================*/

"use strict";

/*=========================================
    DOM READY
=========================================*/

document.addEventListener("DOMContentLoaded", () => {

    initializeNotifications();
    initializeSearchInputs();
    initializeButtons();
    initializeTooltips();

});

/*=========================================
    TOAST MESSAGE
=========================================*/

function showToast(message, type = "success") {

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    toast.innerHTML = message;

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.classList.add("show");

    }, 100);

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 3000);

}

/*=========================================
    CONFIRM ACTION
=========================================*/

function confirmAction(message) {

    return window.confirm(message);

}

/*=========================================
    EMAIL VALIDATION
=========================================*/

function isValidEmail(email) {

    const regex =

        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(email);

}

/*=========================================
    PHONE VALIDATION
=========================================*/

function isValidPhone(phone) {

    const regex = /^[6-9]\d{9}$/;

    return regex.test(phone);

}

/*=========================================
    URL VALIDATION
=========================================*/

function isValidURL(url) {

    try {

        new URL(url);

        return true;

    }

    catch {

        return false;

    }

}

/*=========================================
    REQUIRED FIELD
=========================================*/

function isEmpty(value) {

    return value.trim() === "";

}

/*=========================================
    BUTTON LOADING
=========================================*/

function buttonLoading(button, loadingText) {

    button.dataset.original = button.innerHTML;

    button.disabled = true;

    button.innerHTML =

        `<i class="ri-loader-4-line ri-spin"></i> ${loadingText}`;

}

function stopButtonLoading(button) {

    button.disabled = false;

    button.innerHTML =

        button.dataset.original;

}

/*=========================================
    NOTIFICATION BUTTON
=========================================*/

function initializeNotifications() {

    document

        .querySelectorAll(".notification")

        .forEach(button => {

            button.addEventListener("click", () => {

                showToast(

                    "No new notifications",

                    "info"

                );

            });

        });

}

/*=========================================
    SEARCH INPUT
=========================================*/

function initializeSearchInputs() {

    document

        .querySelectorAll("input[type='search'], .search-box input")

        .forEach(input => {

            input.addEventListener("keyup", debounce(() => {

                console.log(

                    "Searching:",

                    input.value

                );

            }, 300));

        });

}

/*=========================================
    BUTTON EFFECT
=========================================*/

function initializeButtons() {

    document

        .querySelectorAll("button")

        .forEach(button => {

            button.addEventListener("click", () => {

                button.style.transform =

                    "scale(.98)";

                setTimeout(() => {

                    button.style.transform = "";

                }, 120);

            });

        });

}

/*=========================================
    TOOLTIPS
=========================================*/

function initializeTooltips() {

    document

        .querySelectorAll("[title]")

        .forEach(item => {

            item.style.cursor = "pointer";

        });

}

/*=========================================
    DEBOUNCE
=========================================*/

function debounce(callback, delay) {

    let timer;

    return (...args) => {

        clearTimeout(timer);

        timer = setTimeout(() => {

            callback(...args);

        }, delay);

    };

}

