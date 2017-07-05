const baguetteBox = require('baguettebox.js');
const Masonry = require('masonry-layout');

let msnry

const hasClass = (el, cls) => {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

const filter = (selector, filterFn) => {
    var elements = document.querySelectorAll(selector)
    let filterIn = []
    let filterOut = []

    if (filterFn === 'all') {
        for (var h = elements.length; h--;) {
            filterIn.unshift(elements[h])
            filterOut = []
        }
    } else {
        for (var i = elements.length; i--;) {
            if (hasClass(elements[i], filterFn)) {
                filterIn.unshift(elements[i])
            } else {
                filterOut.unshift(elements[i])
            }
        }
    }

    return {
        filterIn: filterIn,
        filterOut: filterOut
    }
}

const highlight = (selector, filterFn) => {
    const highlightList = filter(selector, filterFn);
    const inList = highlightList.filterIn;
    const outList = highlightList.filterOut

    for (let j = inList.length; j--;) {
        inList[j].style.width = '25%';
        //msnry.addItems(inList[j]);
    }

    for (let k = outList.length; k--;) {
        outList[k].style.width = '0';
        //msnry.remove(outList[k]);
    }

    msnry.layout();
}

const filterSelect = () => {
    const filterButtons = document.querySelectorAll('.gallery__filter__button');

    for (let filterButton of filterButtons) {
        filterButton.addEventListener('click',
            function(e){
                e.preventDefault();
                let href = this.getAttribute('href').substring(1);
                highlight('.gallery__image', href);
            }
        )
    }
}

const init = () => {

    var grid = document.querySelector('.gallery');

    msnry = new Masonry( grid, {
        // options...
        itemSelector: '.gallery__image',
        columnWidth: '.gallery__sizer',
        percentPosition: true
    });

    baguetteBox.run('.gallery');

    filterSelect();
}

module.exports = {
    init: init
}
