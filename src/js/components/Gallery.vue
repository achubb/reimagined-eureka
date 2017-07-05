<template>
    <div class="gall">
        <h2>{{ message }}</h2>

        <ul class="gallery__filter" v-if="galleryFilters && galleryFilters.length">
            <li class="gallery__filter__button">
                <a href="#"
                    v-on:click.prevent="reset()">
                        Show All
                </a>
            </li>
            <li class="gallery__filter__button" v-for="galleryFilter of galleryFilters">
                <a href="#"
                    v-bind:class="{ 'filter-active': galleryFilter.active}"
                    v-on:click.prevent="filter(galleryFilter.filterName)">
                        {{galleryFilter.filterName}} |
                        {{galleryFilter.active}}
                </a>
            </li>
        </ul>

        <div class="gallery" v-if="galleryImages && galleryImages.length">
            <a :href="galleryImage.url" class="gallery__image"
                v-for="galleryImage of galleryImages"
                :data-caption="galleryImage.caption"
                >
                <img :src="galleryImage.thumbnailUrl" :alt="galleryImage.caption"/>
            </a>
            <a class="gallery__sizer"></a>
            <div class="gallery__gutter-sizer"></div>
        </div>

        <div class="gallery__loading"
            v-bind:class="{ 'gallery__loading--loaded': endOfGallery }">
            <span v-if="endOfGallery">{{ loadingMessage }}</span>
            <img v-else src="/img/640/gear.gif" alt="" />
        </div>

        <ul v-if="galleryErrors && galleryErrors.length">
            <li v-for="galleryError of galleryErrors">
                <p>{{galleryError.message}}</p>
            </li>
        </ul>
    </div>
</template>

<script>
    const _ = require('lodash');
    import axios from 'axios';
    const Masonry = require('masonry-layout');
    const baguetteBox = require('baguettebox.js');
    const imagesLoaded = require('imagesLoaded');
    const scrollMonitor = require('scrollMonitor');


    let msnry
    let msnryConfig = {
        itemSelector: '.gallery__image',
        columnWidth: '.gallery__sizer',
        gutter: '.gallery__gutter-sizer',
        percentPosition: true
    }

    export default {
        props: {
            imagefeed: { required: true },
            categoryfeed: { required: true },
            loadpause: {
                type: Number,
                default: 500
            },
            imagesperpage: {
                type: Number,
                default: 10
            }
        },

        data() {
            return {
                message: 'Hello Vue!',
                loadingMessage: '',
                galleryImages: [],
                galleryErrors: [],
                galleryFilters: [],
                galleryFilterErrors: [],
                images: [],
                galleryPage: 1,
                requestURL: '',
                endOfGallery: false,
                galleryPageLim: this.imagesperpage,
                imageFeed: this.imagefeed,
                categoryFeed: this.categoryfeed,
                loadPause: this.loadPause
            };
        },

        mounted: function() {
            this.imagesLoaded()
            this.lightBox();
        },

        created() {
            this.createRequestURL()
            this.setupFilters()
            this.loadImages()
            this.mason()
            window.addEventListener('scroll', this.scrollWatch);
        },


        methods: {
            createRequestURL: function () {
                // If a category is active get that, otherwise just get the whole gallery
                let cat

                for (var i = 0; i < this.galleryFilters.length; i++) {
                    if (this.galleryFilters[i].active) {
                        cat = this.galleryFilters[i].filterName
                    }
                }

                this.requestURL = this.imageFeed + '?_page=' + this.galleryPage + '&_limit=' + this.galleryPageLim + (cat ? '&category=' + cat : '')
            },

            loadImages: function () {
                this.loadingMessage = 'Loading more images...'
                axios.get(this.requestURL)
                .then(response => {
                    this.galleryImages = response.data
                })
                .catch(e => {
                    this.galleryErrors.push(e)
                })
            },

            scrollWatch: function () {
                let grid = document.querySelector('.gallery__loading');
                let elementWatcher = scrollMonitor.create( grid );

                if (!elementWatcher.isBelowViewport){
                    this.nextPage()
                }
            },

            nextPage: _.debounce( function() {
                this.galleryPage++
                this.loadNextImages()
                this.imagesLoaded()
            }, this.loadPause),

            loadNextImages: function () {
                this.createRequestURL()
                axios.get(this.requestURL)
                .then(response => {
                    // loop through repsonse and push to gallery Images
                    let responseData = response.data
                    if (responseData.length != 0) {
                        for (var i = 0; i < responseData.length; i++) {
                            this.galleryImages.push(responseData[i]);
                        }
                    } else {
                        this.loadingMessage = "End Of Gallery"
                        this.endOfGallery = true;
                    }
                })
                .catch(e => {
                    this.galleryErrors.push(e)
                })
            },

            imagesLoaded: function () {

                this.$nextTick( function() {
                    setTimeout(function(){
                        let images = document.querySelectorAll('.gallery__image img');

                        function onProgress(imgLoad, image) {
                            let grid = document.querySelector('.gallery');
                            msnry = new Masonry( grid, msnryConfig );

                            let imageEl = image.img.parentNode;
                            if (imageEl.classList) {
                                imageEl.classList.add('image--loaded');
                            } else {
                                imageEl.className += ' ' + 'image--loaded';
                            }
                        }

                        function onAlways() {
                            baguetteBox.destroy();
                            baguetteBox.run('.gallery');
                        }

                        let imgLoadStatus = imagesLoaded(images);
                        imgLoadStatus.on('progress', onProgress)
                        imgLoadStatus.on('always', onAlways)
                    }, 50);
                })
            },

            mason: function () {
                console.log('masonry...');
                this.$nextTick( function() {
                    setTimeout(function(){
                        let grid = document.querySelector('.gallery');
                        msnry = new Masonry( grid, msnryConfig );
                    }, 50);
                })
            },

            setupFilters: function () {

                // This will be a different request

                axios.get(this.categoryFeed)
                .then(response => {
                    let responseData = response.data
                    if (responseData.length != 0) {
                        for (var i = 0; i < responseData.length; i++) {
                            var obj = {
                                filterName: responseData[i].category,
                                active: false
                            }
                            this.galleryFilters.push(obj);
                        }
                    }
                })
                .catch(e => {
                    this.galleryFilterErrors.push(e)
                })
            },

            filter: _.debounce(function (cat) {
                this.galleryPage = 1        // Reset page counter to 1
                axios.get(this.imageFeed + '?_page=' + this.galleryPage + '&_limit=' + this.galleryPageLim + '&category=' + cat)
                .then(response => {
                    this.galleryImages = response.data
                })
                .catch(e => {
                    this.galleryErrors.push(e)
                })
                // set active filter
                this.setActiveFilter(cat)
                this.mason()
                this.lightBoxDestroy()
                this.lightBox()
            }, this.loadPause),

            setActiveFilter: function (cat) {
                for (var i = 0; i < this.galleryFilters.length; i++) {
                    let filter = this.galleryFilters[i].filterName;
                    if (cat === filter) {
                        this.galleryFilters[i].active = true
                    } else {
                        this.galleryFilters[i].active = false
                    }
                }
            },

            reset: function () {
                // Resets back to the first group of all images...
                this.galleryPage = 1
                this.requestURL = this.imageFeed + '?_' + this.galleryPage + '&_limit=' + this.galleryPageLim

                for (var i = 0; i < this.galleryFilters.length; i++) {
                    this.galleryFilters[i].active = false
                }

                this.loadImages()
                this.mason()
                this.lightBoxDestroy()
                this.lightBox()
            },

            lightBox: function () {
                this.$nextTick( function() {
                    setTimeout(function(){
                        baguetteBox.run('.gallery');
                    }, 100);
                })
            },

            lightBoxDestroy: function () {
                this.$nextTick( function() {
                    setTimeout( function(){
                        baguetteBox.destroy()
                    }, 50);
                })
            }
        }
    }
</script>
