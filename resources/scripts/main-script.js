/**
 * Toggles menu-items style for responsivity.
 */
function toggleMenu() {
    // Switch style for setting sidenav properties in smaller screens.
    document.getElementById("navbar-menu").classList.toggle("active");
}

/**
 * Changes the page language between en and pt-BR.
 * @param {String} lang the selected language.
 */
async function changeLang(lang) {
    // If the current lang is the same as the one selected, returns.
    if (lang == document.documentElement.lang) return;

    // Fetch and set the json for currentLang.
    const response = await fetch(`./resources/languages/${lang}.json`);
    // If language requested doesn't have a resource for it, returns.
    if (!response.ok) return;

    // Update current lang in doc and set lang URL param.
    document.documentElement.lang = lang;
    setSearchParamLangValue(lang);
    const json = await response.json();
    // For each json key-value, set the element innerHTML as the respective value.
    Object.keys(json).forEach(key => {
        // Aquire all instances of element/s in HTML.
        // If key has "°" at index 1, it's implied there is multiple elements alike, so it's a NodeList of elements.
        const element = (key[1] == '°') ? document.querySelectorAll(key) : document.querySelector(key);
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
    const selectedLang = document.getElementById("cv-lang-select").value;
    const canvas = document.getElementById("pdf-renderer");
    const canvasContext = canvas.getContext('2d');
    // If no lang was selected, clear canvas.
    if (!selectedLang) {
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvas.height = 0;
        canvas.width = 0;
        // Hide download icon and canvas.
        document.getElementById("download-cv").style.visibility = "hidden";
        document.getElementById("canvas_container").style.display = "none";
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
        document.getElementById("canvas_container").style.display = "initial";
        document.getElementById("download-cv").style.visibility = "visible";
        document.getElementById("download-cv-anchor").href = cvLocation;
    }, error => console.error(error));
}

/**
 * Requests the selected HTML snippet and sets at the designated location.
 * Returns a Promise<boolean> indicating if process was succesfull. it doesn't return a simple boolean
 * because declaring a function with "async" makes it so the return value gets wraped into a Promise, then consumers of this
 * function need to resolve it.
 * @param {String} request HTML snippet requested.
 * @param {String} location Location to set snippet (must contain element id or class symbols).
 * @returns {Promise<boolean>} If requested resource or location doesn't exist, returns a Promise<boolean> (false), else, true.
*/
async function setSnippet(request, location) {
    const res = await fetch(request);
    const aquiredLocation = document.querySelector(location);
    // Check arguments validity, if not valid return false.
    if (!res.ok || !aquiredLocation) return false;

    // If valid args, set the resource at the location and return true.
    aquiredLocation.innerHTML = await res.text();
    return true;
}

/**
 * Returns the value for the search param indicated in the argument paramName.
 * @param {String} paramName Name of the desired URL search param.
 * @returns {String | null} Value of the URL search param (null if it doesn't exist).
 */
function getSearchParamValue(paramName) {
    return new URLSearchParams(window.location.search).get(paramName);
}

/**
 * Changes the lang URL param value to the lang in argument.
 * @param {String} newValue new lang value.
 * @returns If the language in lang URL param is the same as the one selected, returns.
 */
function setSearchParamLangValue(newValue) {
    const langParam = new URLSearchParams(window.location.search);
    const aquiredLangParam = langParam.get("lang");
    // If the language in URL param is the same as the one selected, returns.
    if (aquiredLangParam && newValue.toLocaleLowerCase() == aquiredLangParam.toLocaleLowerCase()) return;

    // Set the lang value in the param, then set the updated newUrl pathname.
    // If page loaded without a URL param for lang, the set below creates it and sets the value.
    langParam.set("lang", newValue);
    const newUrl = window.location.pathname + '?' + langParam.toString();
    window.history.replaceState({}, '', newUrl);
}

/**
 * Recieves a project element id as argument, moves HTML viewport to project section.
 * @param {String} projectId id of project element.
 */
async function renderProject(projectId) {
    // setSnippet loads the resource (project) at the location selected-project if successful, and returns a Promise<boolean>,
    // because async functions wrap the return value into a Promise, so to get the expected boolean, resolving it is necessary.
    const projectLoaded = await setSnippet(("./resources/snippets/" + projectId + ".html"), "#selected-project");
    // If project resource loaded succesfully, scroll view to projects section.
    if (projectLoaded) document.getElementById("projects").scrollIntoView({ block: "end", behavior: 'smooth' });
}

// On page load.
window.addEventListener("load", () => {
    // Define doc language by the lang URL search param.
    const langParam = getSearchParamValue("lang");
    if (langParam) changeLang(langParam);

    // Get URL param, if exists, load project and scroll the view for it's HTML section.
    const projectParam = getSearchParamValue("project");
    if (projectParam) renderProject(projectParam);

    // Generate projects carousel behaviour.
    controlCarousel("#projects-carousel");

    // Setting the default language of lang selector for CV to the template option: none.
    document.getElementById("cv-lang-select").value = "";
});