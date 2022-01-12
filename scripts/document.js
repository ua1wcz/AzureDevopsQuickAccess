function createLink(text, onClick) {
    var item = document.createElement("a");
    item.href = "#";
    item.innerHTML = text;
    item.addEventListener("click", function(event) {
        onClick(event);
        event.preventDefault();
    });
    return item;
}

function createElement(tag, text) {
    var item = document.createElement(tag);
    if (text) {
        item.innerHTML = text;
    }
    return item;
}

function createParagraph(text) {
    return createElement("p", text);
}

function createSpan(text) {
    return createElement("span", text);
}

function createBr() {
    return document.createElement("br");
}

function clearElement(element) {
    while (element.hasChildNodes()) {
        element.removeChild(element.lastChild);
    }
}
