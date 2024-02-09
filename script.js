/**
 * Changes the page language between en and pt-BR.
 * @param {String} lang the selected language.
 */
async function changeLang(lang) {
    // If the current lang is the same as the one selected, returns.
    if (lang == document.documentElement.lang) {
        return;
    }

    // Fetch and set the json for currentLang.
    const response = await fetch(`./resources/languages/${lang}.json`);
    // If language requested doesn't have a resource for it, returns.
    if (!response.ok) {
        return;
    }
    // Update current lang.
    document.documentElement.lang = lang;
    const json = await response.json();
    // For each json key-value, set the element innerHTML as the respective value.
    Object.keys(json).forEach(key => {
        // Aquire all instances of element/s in HTML.
        // If key has "°" at index 1, it's implied there is multiple elements alike, so it's a NodeList of elements.
        const element = (key[1] == "°") ? document.querySelectorAll(key) : document.querySelector(key);
        // If it's a NodeList, run through all elements and set their value, else check if element exists and set it's single value.
        if (element instanceof NodeList) {
            element.forEach(el => el.innerHTML = json[key]);
        } else if (element) {
            element.innerHTML = json[key];
        }
    });
}

/**
 * Fetch the CV with PDF.js and render it at the canvas_container.
 * Currently, only the first page of the PDF is rendered, as such, CVs utilized have only one page.
 */
async function loadCV() {
    // Get the canvas and select properties.
    const selectedLang = document.querySelector("#cv-lang-select").value;
    const canvas = document.querySelector("#pdf_renderer");
    const canvasContext = canvas.getContext('2d');
    // If no lang was selected, clear canvas.
    if (!selectedLang) {
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        canvas.height = 0;
        canvas.width = 0;
        // Hide download icon and canvas.
        document.querySelector("#download-cv").style.visibility = "hidden";
        document.querySelector("#canvas_container").style.display = "none";
        return;
    }

    const cvLocation = `./resources/CVs/Gabriel Severino - cv (${selectedLang}).pdf`;
    pdfjsLib.getDocument(cvLocation).promise.then(pdf => {
        // Fetch the first page.
        pdf.getPage(1).then(page => {
            // Prepare canvas using PDF page dimensions.
            const viewport = page.getViewport({ scale: 1.5 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            // Render PDF page into canvas context.
            page.render({ canvasContext, viewport });
        });
        // Makes download cv icon and canvas visible, sets anchor href value to download the correct cv.
        document.querySelector("#canvas_container").style.display = "initial";
        document.querySelector("#download-cv").style.visibility = "visible";
        document.querySelector("#download-cv-anchor").href = cvLocation;
    }, error => console.error(error));
}

/**
 * Requests the selected HTML snippet and sets at the designated location.
 * @param {String} request HTML snippet requested.
 * @param {String} location Location to set snippet (element id or class).
*/
async function setSnippet(request, location) {
    const res = await fetch(request + ".html")
    document.querySelector(location).innerHTML = await res.text();
}

// On page load.
window.addEventListener("load", () => {
    const langParam = new URLSearchParams(window.location.search).get("lang");
    if (langParam) {
        changeLang(langParam);
    }
    // Setting the default language of lang selector for CV to the template option: none.
    document.querySelector("#cv-lang-select").value = "";
});