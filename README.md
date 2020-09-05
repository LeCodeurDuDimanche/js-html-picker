# JS HTML picker
A Javascript library to let the user select HTML elements

## Usage

Call `enableSelection(container, onElementHover, onElementClick)` to enable user selection on the given container.
Hover and click callbacks are given the DOM element and the unique CSS selector of this element in the container as arguments.
Call `disableSelection(container)` to disable the selection.
