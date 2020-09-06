# JS HTML picker
A Javascript library to let the user select HTML elements

## Usage

Call `enableSelection(container, onElementHover, onElementClick, options)` to enable user selection on the given container.

The optional `options` object may contain one or more of the following properties :
 - `hoverStyle` : array with CSS attribute-value pairs to be applied when an element is hovered.
 - `selectStyle` : array with CSS attribute-value pairs to be applied when an element is selected.


Hover and click callbacks are given the DOM element and the unique CSS selector of this element in the container as arguments.

Call `disableSelection(container)` to disable the selection.
