let container;
//TODO: faire une classe
//TODO: refactor hover/select functions
let hovered = {element: null, selector: null, prevStyle: null};
let selected = {element: null, selector: null, prevStyle: null};
let hoverStyle = null;
let selectStyle = null;
let defaultOptions = {
    hoverStyle : {background: '#ffeeaa'},
    selectStyle : {background: '#ffaaaa'}
};

let selectionActionCallback, hoverActionCallback, detectClickOutsideContainerActionCallback;

function copyPartialStyle(element, style)
{
    let copy = {};
    for (let prop in style)
        copy[prop] = element.style[prop];
    return copy;
}

function setElementStyle(element, style)
{
    for (let prop in style)
        element.style.setProperty(prop, style[prop]);
}

function setStyle(element, state, style)
{
    if (element.element === null)
    {
        element.prevStyle = null;
        return;
    }

    if (state) {
        element.prevStyle = copyPartialStyle(element.element, style);
        setElementStyle(element.element, style);
    }
    else if (element.prevStyle !== null) {
        setElementStyle(element.element, element.prevStyle);
        element.prevStyle = null;
    }
}

//TODO: improve style and colors
function setHoverStyle(element, state)
{
    setStyle(element, state, hoverStyle);
}

function setSelectedStyle(element, state)
{
    setStyle(element, state, selectStyle);
}

function selectorIsUnique(container, selector)
{
    return container.querySelectorAll(selector).length === 1;
}

//TODO: gerer le cas ou l'id n'est pas unique ? (HTML non valide)
function getUniqueCssSelector(container, element)
{
    if (! container.contains(element))
        return null;

    if (container === element)
        return '';

    // Id
    if (element.id)
        return "#" + element.id;

    // Classes
    let selector = "";
    for (let className of element.classList.values())
    {
        selector += "." + className;
        if (selectorIsUnique(container, selector))
            return selector;
    }

    // Element type
    selector = element.nodeName + selector;
    if (selectorIsUnique(container, selector))
        return selector;

    // Parent
    selector = getUniqueCssSelector(container, element.parentNode) + ">" + selector;
    if (selectorIsUnique(container, selector))
        return selector;

    // Position
    let pos = Array.from(element.parentNode.children).indexOf(element) + 1;
    selector += ":nth-child(" + pos + ")";
    if (selectorIsUnique(container, selector))
        return selector;

    return selector;
}


function hoverAction(container, callback)
{
    return (e) => {
        setHoverStyle(hovered, false);
    	hovered.element = e.target;
        hovered.selector = getUniqueCssSelector(container, hovered.element);

        setHoverStyle(hovered, true);

        callback(hovered.element, hovered.selector);
  };
}

function selectionAction(container, callback)
{
    return (e) => {
        setSelectedStyle(selected, false);
        selected.element = e.target;
        selected.selector = getUniqueCssSelector(container, selected.element);

        if (selected.element === hovered.element)
            setHoverStyle(hovered, false);
        setSelectedStyle(selected, true);

        callback(selected.element, selected.selector);
    };
}

//Si on clique en dehors du container
function detectClickOutsideContainerAction(container)
{
    return (e) => {
        if (! container.contains(e.target))
        {
            setSelectedStyle(selected, false);
            selected.element = selected.selector = null;
        }
    };

}
// Si on survole en dehors du container
function onMouseLeave()
{
    setHoverStyle(hovered, false);
    hovered.element = hovered.selector = null;
}

//TODO: gerer les appels concurrents
function enableSelection(container, onHover, onSelect, options = {})
{
    hoverStyle = options.hoverStyle ?? defaultOptions.hoverStyle;
    selectStyle = options.selectStyle ?? defaultOptions.selectStyle;

    //TODO: check capture
    hoverActionCallback = hoverAction(container, onHover);
    container.addEventListener("mouseover", hoverActionCallback);

    selectionActionCallback = selectionAction(container, onSelect);
    container.addEventListener("click", selectionActionCallback);

    detectClickOutsideContainerActionCallback = detectClickOutsideContainerAction(container);
    container.addEventListener("click", detectClickOutsideContainerActionCallback);

    container.addEventListener("mouseleave", onMouseLeave);
}

function disableSelection(container)
{
    setSelectedStyle(selected, false);
    setHoverStyle(hovered, false);
    selected.element = selected.selector = null;
    hovered.element = hovered.selector = null;

    container.removeEventListener("mouseover", hoverActionCallback);
    container.removeEventListener("click", selectionActionCallback);
    container.removeEventListener("click", detectClickOutsideContainerActionCallback);
    container.removeEventListener("mouseleave", onMouseLeave);
}

//TODO: trouver une meilleure API
function getLastSelectedElement()
{
    return [selected.element, selected.selector];
}

export {enableSelection, disableSelection, getLastSelectedElement, getUniqueCssSelector};
