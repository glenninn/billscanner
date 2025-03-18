/* eslint-disable no-unused-vars */

const jss= (...o)=> JSON.stringify(o[0],null,o[1] ? 2 : 0);
const saveScanFile = "scan.json";

var fnInput = null;
var submit = null;
var save = null;
var pImg = null;
var pResults = null;

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
    save = document.getElementById("saveresults");

    fnInput = document.getElementById("fname");
    fnInput.addEventListener('input',fnameChange);
    submit.disabled = true;
    save.disabled = true;
    pResults = document.getElementById("results")
}

function onUnload() {
    fnInput.removeEventListener('input',fnameChange)
}

function sendInvoice() {

    console.log(`filename is> ${jss(fnInput.files[0].name,1)}`)
    const formData = new FormData();

    let imageQuestion = document.getElementById("imageQuestion")

    formData.append('imageQuestion', imageQuestion.value );
    formData.append('invoice',fnInput.files[0])
    submit.disabled = true;
    save.disabled = true;
    pResults.value = "<analyzing>"

    fetch('/api/analyze', {
        method: "POST",
        body:formData
    })
    .then( response => response.json() )
    .then( data => {
        pResults.value = jss(data,1)
        submit.disabled = false;
        save.disabled = false;
    })
    .catch(error => alert(`Error from API\n${error}`))
}

function saveResults() {
    const results = pResults.value;
    const blob = new Blob([results], {type: "text/javascript"});
    const blobURL = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobURL;
    a.download = saveScanFile
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}