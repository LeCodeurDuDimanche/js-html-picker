let container;
//TODO: faire une classe
let hovered = {element: null, selector: null, prevStyle: null};
let selected = {element: null, selector: null, prevStyle: null};

let selectionActionCallback, hoverActionCallback, detectClickOutsideContainerActionCallback;

function setStyle(element, state, defineStyle)
{
    if (element.element === null)
    {
        element.prevStyle = null;
        return;
    }

    if (state) {
        element.prevStyle = element.element.style.background;
        defineStyle(element.element);
    }
    else {
        element.element.style.background = element.prevStyle;
        element.prevStyle = null;
    }
}

//TODO: improve style and colors
function setHoverStyle(element, state)
{
    setStyle(element, state, (e) => e.style.background = '#ffeeaa');
}

function setSelectedStyle(element, state)
{
    setStyle(element, state, (e) => e.style.background = '#ffaaaa');
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

        if (hovered.element === selected.element)
            setSelectedStyle(selected, false);
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
function enableSelection(container, onHover, onSelect)
{
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
