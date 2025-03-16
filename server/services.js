/* eslint-disable no-unused-vars */

const jss= (...o)=> JSON.stringify(o[0],null,o[1] ? 2 : 0);

var fnInput = null;
var submit = null;
var pImg = null;

function fnameChange(evt) {
    evt.preventDefault();
    const disabled = fnInput.files[0].name.trim().length === 0;
    console.log(`change, disabled: ${disabled}`)
    const theImagefile = fnInput.files[0];
    if(theImagefile) {
        if(theImagefile.type.startsWith("image")) {
            const imgUrl = URL.createObjectURL(theImagefile);
            pImg.src = imgUrl;
            pImg.alt = ""
            pImg.style.pointerEvents = 'auto';
        } else {
            pImg.src = "";
            pImg.alt = `Unable to Display this type of document`
            pImg.style.pointerEvents = 'none';
        }
    }
    submit.disabled = disabled
}

function onLoad() {
    console.log(`OnLoad()`)
    pImg = document.getElementById("image");
    pImg.alt = "No Invoice Loaded"
    pImg.style.pointerEvents = 'none';
    submit = document.getElementById("submit");

    fnInput = document.getElementById("fname");
    fnInput.addEventListener('input',fnameChange);
    submit.disabled = true;
}

function onUnload() {
    fnInput.removeEventListener('input',fnameChange)
}

function sendInvoice() {
    let fn = document.getElementById("fname")
    let pResults = document.getElementById("results")

    console.log(`filename is> ${jss(fn.files[0].name,1)}`)
    const formData = new FormData();

    let imageQuestion = document.getElementById("imageQuestion")

    formData.append('imageQuestion', imageQuestion.value );
    formData.append('invoice',fn.files[0])
    submit.disabled = true;
    pResults.value = "<analyzing>"

    fetch('/api/analyze', {
        method: "POST",
        body:formData
    })
    .then( response => response.json() )
    .then( data => {
        pResults.value = jss(data,1)
        submit.disabled = false;
    })
    .catch(error => alert(`Error from API\n${error}`))
}