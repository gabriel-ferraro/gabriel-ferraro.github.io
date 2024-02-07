/**
 * Changes the page language between en and pt-BR.
 * @param {String} lang the selected language.
 */
async function changeLang(lang) {
    // If the current lang is the same as the one selected, returns.
    if (lang == document.documentElement.lang) {
        return;
    }

    // Update current lang.
    document.documentElement.lang = lang;
    // Fetch and set the json for currentLang.
    let json = await fetch(`./resources/${lang}.json`);
    json = await json.json();
    // For each json key-value, set the element inner text as the respective value.
    Object.keys(json).forEach(key => {
        try {
            document.querySelector(key).innerHTML = json[key]
        } catch (err) {
            console.error(`Error setting text for element with selector '${key}':`, err);
        }
    });
}

/**
 * Fetch my github repositories and set them at "projects".
 */
async function getGithubRepos() {
    // Fetch and get the repos as an array of repos.
    const res = await fetch("https://api.github.com/users/gabriel-ferraro/repos")
    // If fetch was no succesful.
    if (!res.ok) {
        document.querySelector(projects).innerHTML = "<h3>Github Api couldn't return projects.</h3>";
        return;
    }

    // Getting repos in an array and setting their info at "github repos".
    const reposList = await res.json();
    reposList.forEach(rep => {
        document.querySelector(".github__repos").innerHTML += `
            <div class="repo__card">
                <h3>${rep.name}</h3>
                <p>See at <a href="${rep.html_url}" target="_blank">Github</a></p>
                <div class="readme">${getRepoReadme(rep.name)}</div>
                <p>Clone this repository</p><button><i class="fa-solid fa-clipboard-list"></i></button>
            </div>
            `
    });
}

/**
 * Fetch readme from repository, get it as base64, translate to UTF-8 and returns it.
 * @param {String} repName name of the desired repo.
 * @returns The UTF-8 content of the readme, or a h3 message if readme wasn't found.
 */
async function getRepoReadme(repName) {
    let res = await fetch(`https://api.github.com/repos/gabriel-ferraro/${repName}/contents/README.md`)
    // If readme couldn't be retrieved.
    if (!res.ok) {
        return "<h3 class='repo__readme'>No readme available</h3>";
    }

    // Get readme as base64, translate to UTF-8 and return it.
    res = await res.text();
    const result = decodeURIComponent(atob(res.content));
    console.log("result: ------", result)
    return result
}

/**
 * Fetch the CV with PDF.js and render it at the canvas_container.
 * Currently, only the first page of the PDF is rendered, as such, CVs utilized have only one page.
 */
async function loadCV() {
    // Get the canvas and select properties.
    const selectedLang = document.querySelector("#curriculum-lang").value;
    const canvas = document.querySelector("#pdf_renderer");
    const canvasContext = canvas.getContext('2d');
    // If no lang was selected, clear canvas.
    if (!selectedLang) {
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        canvas.height = 0;
        canvas.width = 0;
        // Hide download icon.
        document.querySelector("#download-cv").style.visibility = "hidden";
        return;
    }
    
    const cvLocation = `./resources/Gabriel Severino - cv (${selectedLang}).pdf`;
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
        // Makes download cv icon visible and set anchor href value to download the correct cv.
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