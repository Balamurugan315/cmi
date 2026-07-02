
"use strict";

/*=========================================
        GAMEVERSE ADMIN UTILITIES
=========================================*/

/*==========================
    TOAST
==========================*/

const AdminUtils = {

toast(message,type="success"){

    if(typeof showToast==="function"){

        showToast(message,type);

        return;

    }

    alert(message);

},

/*==========================
    CONFIRM
==========================*/

confirm(message){

    return window.confirm(message);

},

/*==========================
    SEARCH TABLE
==========================*/

search(inputSelector,tableSelector){

    const input=document.querySelector(inputSelector);

    if(!input) return;

    input.addEventListener("keyup",()=>{

        const value=input.value.toLowerCase();

        document

        .querySelectorAll(`${tableSelector} tbody tr`)

        .forEach(row=>{

            row.style.display=

            row.innerText.toLowerCase()

            .includes(value)

            ? ""

            : "none";

        });

    });

},

/*==========================
    PAGINATION
==========================*/

paginate(tableSelector,page=1,rows=10){

    const allRows=document.querySelectorAll(

        `${tableSelector} tbody tr`

    );

    const start=(page-1)*rows;

    const end=start+rows;

    allRows.forEach((row,index)=>{

        row.style.display=

        index>=start && index<end

        ? ""

        : "none";

    });

},

/*==========================
    CSV EXPORT
==========================*/

exportTable(tableSelector,fileName){

    const table=document.querySelector(tableSelector);

    if(!table) return;

    let csv="";

    table.querySelectorAll("tr")

    .forEach(row=>{

        const cols=row.querySelectorAll("th,td");

        let line=[];

        cols.forEach(col=>{

            line.push(

                `"${col.innerText.trim()}"`

            );

        });

        csv+=line.join(",")+"\n";

    });

    const blob=new Blob([csv],{

        type:"text/csv"

    });

    const url=URL.createObjectURL(blob);

    const a=document.createElement("a");

    a.href=url;

    a.download=fileName;

    a.click();

    URL.revokeObjectURL(url);

},

/*==========================
    LOADING BUTTON
==========================*/

loading(button,text="Loading..."){

    button.dataset.text=button.innerHTML;

    button.disabled=true;

    button.innerHTML=

    `<i class="ri-loader-4-line ri-spin"></i> ${text}`;

},

stopLoading(button){

    button.disabled=false;

    button.innerHTML=

    button.dataset.text;

},

/*==========================
    EMAIL
==========================*/

email(email){

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    .test(email);

},

/*==========================
    PHONE
==========================*/

phone(phone){

    return /^[6-9]\d{9}$/

    .test(phone);

},

/*==========================
    URL
==========================*/

url(url){

    try{

        new URL(url);

        return true;

    }

    catch{

        return false;

    }

},

/*==========================
    REQUIRED
==========================*/

required(value){

    return value.trim()!== "";

},

/*==========================
    NUMBER
==========================*/

number(value){

    return !isNaN(value);

},

/*==========================
    DATE
==========================*/

date(start,end){

    return new Date(end)>=new Date(start);

},

/*==========================
    ROW HIGHLIGHT
==========================*/

highlight(tableSelector){

    document

    .querySelectorAll(`${tableSelector} tbody tr`)

    .forEach(row=>{

        row.onclick=()=>{

            document

            .querySelectorAll(

                `${tableSelector} tbody tr`

            )

            .forEach(r=>{

                r.classList.remove(

                    "active-row"

                );

            });

            row.classList.add(

                "active-row"

            );

        };

    });

},

/*==========================
    KEYBOARD
==========================*/

shortcuts(searchSelector){

    document.addEventListener("keydown",e=>{

        if(e.ctrlKey && e.key==="f"){

            e.preventDefault();

            document

            .querySelector(searchSelector)

            ?.focus();

        }

        if(e.key==="Escape"){

            document.activeElement.blur();

        }

    });

},

/*==========================
    COUNTER
==========================*/

counter(selector){

    document.querySelectorAll(selector)

    .forEach(counter=>{

        const target=parseInt(

            counter.innerText.replace(/\D/g,"")

        );

        if(isNaN(target)) return;

        let value=0;

        const speed=Math.ceil(target/80);

        const timer=setInterval(()=>{

            value+=speed;

            if(value>=target){

                value=target;

                clearInterval(timer);

            }

            counter.innerText=value.toLocaleString();

        },20);

    });

}

};