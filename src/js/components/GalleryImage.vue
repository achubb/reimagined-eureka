<template lang="html">
    <a href="/img/flowers.jpeg" class="gallery__image"
        v-bind:class="'filter--' + filterSuffix"
        :data-at-640="fullImage"
    >
        <!-- <img src="/img/640/flowers.jpeg"> -->
        <img :src="thumbImage">
    </a>
</template>

<script>
    export default {
        data() {
            return {
                thumbImage: '/img/640/flowers.jpg',
                fullImage: '/img/640/flowers.jpg',
                filterSuffix: 'flowers'
            }
        }
    }
</script>

<style lang="css">
</style>
