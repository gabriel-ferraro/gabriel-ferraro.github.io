/**
 * Toggles navbar menu style for responsivity.
 * If navbar menu is activated and user clicks outside the navbar or outside return top, toggles the style.
 */
function toggleMenu() {
    const navmenu = document.getElementById("navbar-menu");
    // Named function for the event listener. Closes navbar after it's activated.
    function clickOutsideHandler(event) {
        // Check if the clicked element is not the toggle button itself, (nor any element with tag normal-link) or within the menu.
        if (!event.target.closest(".normal-link") && !event.target.closest("#navbar-menu")) {
            navmenu.classList.remove("active");
            // Remove the event listener after it's been triggered once
            document.removeEventListener("click", clickOutsideHandler);
        }
    }
    // Add the event listener.
    document.addEventListener("click", clickOutsideHandler);
    // apply the navbar menu style.
    navmenu.classList.toggle("active");
}

/**
 * Returns the value for the search param indicated in the argument paramName.
 * @param {String} paramName Name of the desired URL search param.
 * @returns {String | null} Value of the URL search param (null if it doesn't exist).
 */
function getQueryParamValue(paramName) {
    return new URLSearchParams(window.location.search).get(paramName);
}

/**
 * Updates or creates a query param with a value and sets it in browser URL.
 * @param {String} queryParamKey query param key.
 * @param {String} paramValue value for the query param.
 */
function setQueryParamValue(queryParamKey, paramValue) {
    const queryParams = new URLSearchParams(window.location.search);
    const aquiredParam = queryParams.get(queryParamKey);
    // If the aquiredParam exists and the query param value in URL is the same as the one recieved as arg, returns.
    if (aquiredParam && paramValue.toLocaleLowerCase() == aquiredParam.toLocaleLowerCase()) return;

    // Set the value in the param, then set the updated new URL pathname.
    // If page loaded without the URL query param, the set below creates it and sets the value, else updates.
    queryParams.set(queryParamKey, paramValue);
    const newUrl = window.location.pathname + '?' + queryParams.toString();
    window.history.replaceState({}, '', newUrl);
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
    setQueryParamValue("lang", lang);
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
 * Recieves a project element id as argument, moves HTML viewport to project section.
 * @param {String} projectId id of project element.
 */
async function renderProject(projectId) {
    // setSnippet loads the resource (project) at the location selected-project if successful, and returns a Promise<boolean>,
    // because async functions wrap the return value into a Promise, so to get the expected boolean, resolving it is necessary.
    const projectLoaded = await setSnippet(("./resources/snippets/" + projectId + ".html"), "#selected-project-div");
    // If project resource loaded succesfully, scroll view to end of projects section.
    if (projectLoaded) document.getElementById("selected-project-div").scrollIntoView({ block: "start", behavior: 'smooth' });
}

/**
 * Removes content from currently selected-project section, making it empty in HTML.
 */
function closeProject() {
    document.getElementById("selected-project-div").innerHTML = "";
}

/**
 * Updates the URL depending on projectId arg, copy the updated URL link to user's clipboard.
 * @param {String} projectId Id of the selected project to become value for project URL query param.
 */
function shareWithProjectParam(projectId) {
    setQueryParamValue("project", projectId);
    window.navigator.clipboard.writeText(window.location.toString());
}

// On page load.
window.addEventListener("load", () => {
    // Define doc language by the lang URL search param.
    const langParam = getQueryParamValue("lang");
    if (langParam) changeLang(langParam);

    // Get URL param, if exists, load project and scroll the view for it's HTML section.
    const projectParam = getQueryParamValue("project");
    if (projectParam) renderProject(projectParam);

    // Generate projects carousel behaviour.
    controlCarousel("#projects-carousel");

    // Setting the default language of lang selector for CV to the template option: none.
    document.getElementById("cv-lang-select").value = "";    
});